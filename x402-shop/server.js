const PAY_TO = "0xdD1729943bf7C408456cef52886ad12B05B57dC2";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const NETWORK = "eip155:8453";
const ORIGIN = process.env.ORIGIN || "https://volkov.evgeny.m2.fvds.ru";
const VERSION = "1.30.0";
const PORT = Number(process.env.PORT || 4021);
const FACILITATOR = (process.env.FACILITATOR_URL || "https://facilitator.payai.network").replace(/\/$/, "");
const BASE_RPC = process.env.BASE_RPC || "https://mainnet.base.org";
const ETH_RPC = process.env.ETH_RPC || "https://cloudflare-eth.com";
const IPFS_GATEWAY = process.env.IPFS_GATEWAY || "https://ipfs.io/ipfs";
const MAX_BYTES = 120_000;
const TAGS = ["fetch", "html", "markdown", "opengraph"];

const usdToAtomic = (usd) => String(Math.round(Number(usd) * 1_000_000));

const bazaarSchema = {
  $schema: "https://json-schema.org/draft/2020-12/schema",
  type: "object",
  properties: {
    input: {
      type: "object",
      properties: {
        type: { type: "string", const: "http" },
        method: { type: "string", enum: ["GET"] },
        queryParams: { type: "object", properties: {} },
      },
      required: ["type", "method"],
      additionalProperties: false,
    },
    output: {
      type: "object",
      properties: {
        type: { type: "string" },
        example: { type: "object" },
      },
      required: ["type"],
    },
  },
  required: ["input"],
};

function json(status, body, extraHeaders = {}) {
  const payload = JSON.stringify(body);
  return new Response(payload, {
    status,
    headers: {
      "content-type": "application/json",
      "access-control-allow-origin": "*",
      "access-control-allow-methods": "GET, OPTIONS",
      "access-control-allow-headers": "Content-Type, X-PAYMENT, PAYMENT-SIGNATURE, Payment-Signature",
      "access-control-expose-headers": "Payment-Required, Payment-Response, X-PAYMENT-RESPONSE",
      ...extraHeaders,
    },
  });
}

function b64json(obj) {
  return Buffer.from(JSON.stringify(obj)).toString("base64");
}

function decodePaymentHeader(raw) {
  if (!raw) return null;
  try {
    return JSON.parse(Buffer.from(raw, "base64").toString("utf8"));
  } catch {
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }
}

function isPrivateHost(hostname) {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h === "0.0.0.0") return true;
  if (h === "::1" || h.startsWith("[") || h.endsWith(".internal")) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) {
    const [a, b] = h.split(".").map(Number);
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;
    if (a === 192 && b === 168) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
  }
  return false;
}

function assertPublicHttpUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("Invalid url");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") throw new Error("Only http(s) urls");
  if (isPrivateHost(u.hostname)) throw new Error("Private hosts are blocked");
  return u;
}

async function fetchPublic(raw, { maxBytes = MAX_BYTES, redirect = "follow" } = {}) {
  const u = assertPublicHttpUrl(raw);
  const res = await fetch(u.toString(), {
    redirect,
    headers: { "user-agent": "CashSprint-Fetch/1.30" },
    signal: AbortSignal.timeout(12_000),
  });
  const buf = new Uint8Array(await res.arrayBuffer());
  const sliced = buf.byteLength > maxBytes ? buf.slice(0, maxBytes) : buf;
  const text = new TextDecoder("utf-8", { fatal: false }).decode(sliced);
  return { res, url: res.url || u.toString(), text, bytes: sliced.byteLength, headers: res.headers, status: res.status };
}

function decodeEntities(s) {
  return String(s || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function htmlTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1]).replace(/\s+/g, " ").trim() : "";
}

function metaMap(html) {
  const out = {};
  const re = /<meta\b([^>]+)>/gi;
  let m;
  while ((m = re.exec(html))) {
    const tag = m[1];
    const key = (tag.match(/\b(?:property|name|itemprop)=["']([^"']+)["']/i) || [])[1];
    const content = (tag.match(/\bcontent=["']([^"']*)["']/i) || [])[1];
    if (key && content != null) out[key.toLowerCase()] = decodeEntities(content);
  }
  return out;
}

function absUrl(base, href) {
  try {
    return new URL(href, base).toString();
  } catch {
    return null;
  }
}

function stripTags(html) {
  return decodeEntities(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function toMarkdown(html) {
  const title = htmlTitle(html);
  const text = stripTags(html).slice(0, 4000);
  return title ? `# ${title}\n\n${text}` : text;
}

async function rpc(url, method, params) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, method, params }),
    signal: AbortSignal.timeout(12_000),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message || "RPC error");
  return data.result;
}

function hexToBigInt(hex) {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
}

function fakeExponential(factor, numerator, denominator) {
  let i = 1n;
  let output = 0n;
  let numeratorAccum = factor * denominator;
  while (numeratorAccum > 0n) {
    output += numeratorAccum;
    numeratorAccum = (numeratorAccum * numerator) / (denominator * i);
    i += 1n;
  }
  return output / denominator;
}

function blobBaseFeeFromExcess(excessBlobGas) {
  const MIN_BLOB_BASE_FEE = 1n;
  const BLOB_BASE_FEE_UPDATE_FRACTION = 3338477n;
  return fakeExponential(MIN_BLOB_BASE_FEE, excessBlobGas, BLOB_BASE_FEE_UPDATE_FRACTION);
}

function formatUnits(wei, decimals) {
  const n = typeof wei === "bigint" ? wei : hexToBigInt(wei);
  const base = 10n ** BigInt(decimals);
  const whole = n / base;
  const frac = n % base;
  if (frac === 0n) return Number(whole);
  const s = frac.toString().padStart(decimals, "0").replace(/0+$/, "");
  return Number(`${whole}.${s}`);
}

async function doh(name, type) {
  const u = `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(name)}&type=${encodeURIComponent(type)}`;
  const res = await fetch(u, { headers: { accept: "application/dns-json" }, signal: AbortSignal.timeout(8000) });
  const data = await res.json();
  return (data.Answer || []).map((a) => a.data).filter(Boolean);
}

function pad32(hexNoPrefix) {
  return hexNoPrefix.replace(/^0x/, "").padStart(64, "0");
}

const KECCAK_RC = [
  0x0000000000000001n, 0x0000000000008082n, 0x800000000000808an, 0x8000000080008000n,
  0x000000000000808bn, 0x0000000080000001n, 0x8000000080008081n, 0x8000000000008009n,
  0x000000000000008an, 0x0000000000000088n, 0x0000000080008009n, 0x000000008000000an,
  0x000000008000808bn, 0x800000000000008bn, 0x8000000000008089n, 0x8000000000008003n,
  0x8000000000008002n, 0x8000000000000080n, 0x000000000000800an, 0x800000008000000an,
  0x8000000080008081n, 0x8000000000008080n, 0x0000000080000001n, 0x8000000080008008n,
];

function rotl64(x, n) {
  const s = BigInt(n % 64);
  return BigInt.asUintN(64, (x << s) | (x >> (64n - s)));
}

function keccakF1600(st) {
  for (let round = 0; round < 24; round++) {
    const C = new BigUint64Array(5);
    for (let x = 0; x < 5; x++) C[x] = st[x] ^ st[x + 5] ^ st[x + 10] ^ st[x + 15] ^ st[x + 20];
    for (let x = 0; x < 5; x++) {
      const D = C[(x + 4) % 5] ^ rotl64(C[(x + 1) % 5], 1);
      for (let y = 0; y < 5; y++) st[x + 5 * y] ^= D;
    }
    let x = 1;
    let y = 0;
    let current = st[1];
    for (let t = 0; t < 24; t++) {
      const X = y;
      const Y = (2 * x + 3 * y) % 5;
      const offset = ((t + 1) * (t + 2) / 2) % 64;
      const tmp = st[X + 5 * Y];
      st[X + 5 * Y] = rotl64(current, offset);
      current = tmp;
      x = X;
      y = Y;
    }
    for (let yCol = 0; yCol < 5; yCol++) {
      const lane = [st[5 * yCol], st[1 + 5 * yCol], st[2 + 5 * yCol], st[3 + 5 * yCol], st[4 + 5 * yCol]];
      for (let xCol = 0; xCol < 5; xCol++) {
        st[xCol + 5 * yCol] = BigInt.asUintN(64, lane[xCol] ^ (~lane[(xCol + 1) % 5] & lane[(xCol + 2) % 5]));
      }
    }
    st[0] = BigInt.asUintN(64, st[0] ^ KECCAK_RC[round]);
  }
}

function keccak256Hex(input) {
  const data = typeof input === "string" ? Buffer.from(input, "utf8") : Buffer.from(input);
  const rate = 136;
  const st = new BigUint64Array(25);
  const block = new Uint8Array(rate);
  let offset = 0;
  const absorb = () => {
    const view = new DataView(block.buffer, block.byteOffset, block.byteLength);
    for (let i = 0; i < rate / 8; i++) st[i] ^= view.getBigUint64(i * 8, true);
    keccakF1600(st);
    block.fill(0);
  };
  for (let i = 0; i < data.length; i++) {
    block[offset++] = data[i];
    if (offset === rate) {
      absorb();
      offset = 0;
    }
  }
  block[offset] ^= 0x01;
  block[rate - 1] ^= 0x80;
  absorb();
  const out = Buffer.alloc(32);
  const view = new DataView(out.buffer);
  for (let i = 0; i < 4; i++) view.setBigUint64(i * 8, st[i], true);
  return out.toString("hex");
}

function selector(sig) {
  return "0x" + keccak256Hex(sig).slice(0, 8);
}

async function ethCall(to, data, rpcUrl = BASE_RPC) {
  return rpc(rpcUrl, "eth_call", [{ to, data }, "latest"]);
}

function toChecksumAddress(address) {
  const addr = String(address || "").toLowerCase().replace(/^0x/, "");
  if (!/^[a-f0-9]{40}$/.test(addr)) throw new Error("Invalid address");
  const hash = keccak256Hex(addr);
  let out = "0x";
  for (let i = 0; i < 40; i++) {
    out += parseInt(hash[i], 16) >= 8 ? addr[i].toUpperCase() : addr[i];
  }
  return out;
}

function decodeAbiString(hex) {
  if (!hex || hex === "0x") return "";
  const h = hex.replace(/^0x/, "");
  if (h.length < 128) {
    try {
      return Buffer.from(h.slice(0, 64), "hex").toString("utf8").replace(/\0/g, "").trim();
    } catch {
      return "";
    }
  }
  const offset = Number(BigInt("0x" + h.slice(0, 64)));
  const start = offset * 2;
  const len = Number(BigInt("0x" + h.slice(start, start + 64)));
  const data = h.slice(start + 64, start + 64 + len * 2);
  return Buffer.from(data, "hex").toString("utf8");
}

const ENS_REGISTRY = "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e";

function namehash(name) {
  let node = Buffer.alloc(32);
  const labels = String(name || "").toLowerCase().split(".").filter(Boolean).reverse();
  for (const label of labels) {
    const labelHash = Buffer.from(keccak256Hex(label), "hex");
    node = Buffer.from(keccak256Hex(Buffer.concat([node, labelHash])), "hex");
  }
  return "0x" + node.toString("hex");
}

async function whoisRaw(server, query) {
  const conn = await Bun.connect({ hostname: server, port: 43 });
  conn.write(query + "\r\n");
  const chunks = [];
  const reader = conn.readable.getReader();
  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    chunks.push(Buffer.from(value));
    if (Buffer.concat(chunks).length > 80_000) break;
  }
  try {
    conn.end();
  } catch {}
  return Buffer.concat(chunks).toString("utf8");
}

async function whoisLookup(host) {
  const iana = await whoisRaw("whois.iana.org", host);
  const refer = (iana.match(/^refer:\s+(\S+)/im) || iana.match(/^whois:\s+(\S+)/im) || [])[1] || "whois.iana.org";
  const body = refer === "whois.iana.org" ? iana : await whoisRaw(refer, host);
  return { refer, text: body.slice(0, 20_000) };
}

async function tlsCert(host, port = 443) {
  const tls = await import("node:tls");
  return await new Promise((resolve, reject) => {
    const socket = tls.connect(
      { host, port, servername: host, rejectUnauthorized: false, timeout: 8000 },
      () => {
        const cert = socket.getPeerCertificate();
        socket.end();
        if (!cert || !cert.subject) return reject(new Error("No certificate"));
        resolve({
          host,
          subject: cert.subject,
          issuer: cert.issuer,
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          serialNumber: cert.serialNumber || "",
          fingerprint256: cert.fingerprint256 || "",
        });
      },
    );
    socket.on("error", reject);
    socket.on("timeout", () => {
      socket.destroy();
      reject(new Error("TLS timeout"));
    });
  });
}

const ROUTES = {
  "/pay/ping": {
    summary: "Ping",
    description: "Cheap x402 ping. Returns server time and receive wallet. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { ok: true, paid: true, payTo: PAY_TO, ts: "2026-08-17T13:00:00.000Z" },
    handler: async () => ({ ok: true, paid: true, payTo: PAY_TO, ts: new Date().toISOString() }),
  },
  "/pay/og": {
    summary: "Open Graph extract",
    description: "Extract Open Graph title, description and image from a public URL. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", title: "Example Domain", description: "", image: "" },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const meta = metaMap(text);
      return {
        url,
        title: meta["og:title"] || htmlTitle(text),
        description: meta["og:description"] || meta.description || "",
        image: meta["og:image"] || "",
      };
    },
  },
  "/pay/extract": {
    summary: "HTML to markdown",
    description: "Fetch a public page and return title, plaintext and markdown. $0.005 USDC on Base.",
    price: "0.005",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", title: "Example Domain", text: "...", markdown: "# Example Domain" },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      return { url, title: htmlTitle(text), text: stripTags(text).slice(0, 8000), markdown: toMarkdown(text) };
    },
  },
  "/pay/gas": {
    summary: "Base gas price",
    description: "Current Base L2 gas price and block number. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", gasPriceWei: "1000000", gasPriceGwei: 0.001, blockNumber: 1 },
    handler: async () => {
      const [gas, block] = await Promise.all([rpc(BASE_RPC, "eth_gasPrice", []), rpc(BASE_RPC, "eth_blockNumber", [])]);
      const wei = hexToBigInt(gas);
      return {
        network: "base",
        gasPriceWei: wei.toString(),
        gasPriceGwei: Number(wei) / 1e9,
        blockNumber: Number(hexToBigInt(block)),
      };
    },
  },
  "/pay/ipfs": {
    summary: "IPFS cat",
    description: "Fetch a CID from a live Kubo node and return text (max 120kb). $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "cid", required: true }],
    queryExample: { cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG" },
    example: { cid: "QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG", bytes: 12, text: "hello", sha256: "..." },
    handler: async (q) => {
      const cid = String(q.get("cid") || "").trim();
      if (!/^[a-zA-Z0-9]+$/.test(cid)) throw new Error("Invalid cid");
      const { text, bytes } = await fetchPublic(`${IPFS_GATEWAY}/${cid}`);
      const sha256 = new Bun.CryptoHasher("sha256").update(text).digest("hex");
      return { cid, bytes, text: text.slice(0, 20_000), sha256 };
    },
  },
  "/pay/dns": {
    summary: "DNS lookup",
    description: "Public DNS lookup (A/AAAA/CNAME/TXT/MX) for a domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", a: ["93.184.216.34"], aaaa: [], cname: [], txt: [], mx: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const [a, aaaa, cname, txt, mx] = await Promise.all([
        doh(host, "A"),
        doh(host, "AAAA"),
        doh(host, "CNAME"),
        doh(host, "TXT"),
        doh(host, "MX"),
      ]);
      return { host, a, aaaa, cname, txt, mx };
    },
  },
  "/pay/headers": {
    summary: "HTTP headers",
    description: "Fetch a public URL and return status plus response headers. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", status: 200, headers: { "content-type": "text/html" } },
    handler: async (q) => {
      const { url, status, headers } = await fetchPublic(q.get("url"));
      const hdrs = {};
      headers.forEach((v, k) => {
        hdrs[k] = v;
      });
      return { url, status, headers: hdrs };
    },
  },
  "/pay/rss": {
    summary: "RSS to JSON",
    description: "Parse an RSS or Atom feed into JSON items. $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/feed.xml" },
    example: { url: "https://example.com/feed.xml", count: 1, items: [{ title: "Post", link: "https://example.com/p", date: "" }] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const items = [];
      const blocks = text.match(/<(?:item|entry)\b[\s\S]*?<\/(?:item|entry)>/gi) || [];
      for (const block of blocks.slice(0, 40)) {
        const title = decodeEntities((block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i) || [])[1] || "").trim();
        const link =
          (block.match(/<link[^>]+href=["']([^"']+)["']/i) || [])[1] ||
          decodeEntities((block.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || "").trim();
        const date = decodeEntities((block.match(/<(?:pubDate|updated|published)[^>]*>([\s\S]*?)<\//i) || [])[1] || "").trim();
        items.push({ title, link, date });
      }
      return { url, count: items.length, items };
    },
  },
  "/pay/links": {
    summary: "Extract links",
    description: "Extract up to 40 absolute links from a public HTML page. $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, links: ["https://example.com/about"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const hrefs = [...text.matchAll(/<a\b[^>]*href=["']([^"']+)["']/gi)].map((m) => absUrl(url, m[1])).filter(Boolean);
      const links = [...new Set(hrefs)].slice(0, 40);
      return { url, count: links.length, links };
    },
  },
  "/pay/robots": {
    summary: "robots.txt",
    description: "Fetch robots.txt for a public origin. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/robots.txt", status: 200, text: "User-agent: *" },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const robots = `${page.origin}/robots.txt`;
      const { url, status, text } = await fetchPublic(robots);
      return { url, status, text: text.slice(0, 20_000) };
    },
  },
  "/pay/balance": {
    summary: "Base ETH + USDC balance",
    description: "ETH and USDC balances for an address on Base. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "address", required: true }],
    queryExample: { address: PAY_TO },
    example: { network: "base", address: PAY_TO, eth: 0, usdc: 0 },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      const data = selector("balanceOf(address)") + pad32(address);
      const [ethHex, usdcHex] = await Promise.all([
        rpc(BASE_RPC, "eth_getBalance", [address, "latest"]),
        ethCall(USDC, data),
      ]);
      return { network: "base", address, eth: formatUnits(ethHex, 18), usdc: formatUnits(usdcHex, 6) };
    },
  },
  "/pay/redirects": {
    summary: "Redirect chain",
    description: "Follow HTTP redirects (max 8) and return the hop chain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { start: "https://example.com", final: "https://example.com/", hops: [] },
    handler: async (q) => {
      const start = assertPublicHttpUrl(q.get("url")).toString();
      const hops = [];
      let current = start;
      for (let i = 0; i < 8; i++) {
        const { res } = await fetchPublic(current, { redirect: "manual" });
        const loc = res.headers.get("location");
        if (!loc || res.status < 300 || res.status >= 400) {
          return { start, final: res.url || current, hops };
        }
        const next = absUrl(current, loc);
        hops.push({ status: res.status, from: current, to: next });
        current = next;
      }
      return { start, final: current, hops };
    },
  },
  "/pay/sitemap": {
    summary: "Sitemap URLs",
    description: "Parse sitemap.xml and return up to 50 loc URLs. $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/sitemap.xml" },
    example: { url: "https://example.com/sitemap.xml", count: 1, urls: ["https://example.com/"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const urls = [...text.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]).slice(0, 50);
      return { url, count: urls.length, urls };
    },
  },
  "/pay/json": {
    summary: "Fetch JSON",
    description: "Fetch a public URL and parse JSON (max 120kb). $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://httpbin.org/json" },
    example: { url: "https://httpbin.org/json", status: 200, data: {} },
    handler: async (q) => {
      const { url, status, text } = await fetchPublic(q.get("url"));
      return { url, status, data: JSON.parse(text) };
    },
  },
  "/pay/jwt": {
    summary: "Decode JWT",
    description: "Decode a compact JWT header and payload. Signature is not verified. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "token", required: true }],
    queryExample: { token: "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0." },
    example: { header: { alg: "none" }, payload: { sub: "1" }, verified: false },
    handler: async (q) => {
      const token = String(q.get("token") || "");
      const [h, p] = token.split(".");
      const dec = (part) => JSON.parse(Buffer.from(part.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));
      return { header: dec(h), payload: dec(p), verified: false };
    },
  },
  "/pay/jsonld": {
    summary: "JSON-LD extract",
    description: "Extract application/ld+json blocks from a public page. $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, items: [{ "@type": "WebPage" }] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const items = [];
      const re = /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
      let m;
      while ((m = re.exec(text))) {
        try {
          items.push(JSON.parse(m[1]));
        } catch {}
      }
      return { url, count: items.length, items: items.slice(0, 20) };
    },
  },
  "/pay/meta": {
    summary: "HTML meta tags",
    description: "Extract name/property meta tags from a public page. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, items: [{ key: "description", content: "Example" }] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const map = metaMap(text);
      const items = Object.entries(map).map(([key, content]) => ({ key, content }));
      return { url, count: items.length, items };
    },
  },
  "/pay/images": {
    summary: "Extract images",
    description: "Extract up to 30 image URLs from a public page. $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, images: ["https://example.com/logo.png"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const found = [...text.matchAll(/<img\b[^>]*src=["']([^"']+)["']/gi)].map((m) => absUrl(url, m[1])).filter(Boolean);
      const images = [...new Set(found)].slice(0, 30);
      return { url, count: images.length, images };
    },
  },
  "/pay/feeds": {
    summary: "Discover RSS/Atom",
    description: "Find RSS/Atom alternate links on a public page. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, feeds: [{ type: "application/rss+xml", href: "https://example.com/feed.xml" }] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const feeds = [];
      const re = /<link\b([^>]+)>/gi;
      let m;
      while ((m = re.exec(text))) {
        const tag = m[1];
        const rel = (tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "";
        const type = (tag.match(/\btype=["']([^"']+)["']/i) || [])[1] || "";
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        if (/alternate/i.test(rel) && /rss|atom|xml/i.test(type) && href) {
          feeds.push({ type, href: absUrl(url, href) });
        }
      }
      return { url, count: feeds.length, feeds };
    },
  },
  "/pay/token": {
    summary: "ERC-20 metadata",
    description: "Name, symbol and decimals for an ERC-20 on Base. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "address", required: true }],
    queryExample: { address: USDC },
    example: { network: "base", address: USDC, name: "USD Coin", symbol: "USDC", decimals: 6 },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      const [nameHex, symbolHex, decHex] = await Promise.all([
        ethCall(address, selector("name()")),
        ethCall(address, selector("symbol()")),
        ethCall(address, selector("decimals()")),
      ]);
      return {
        network: "base",
        address,
        name: decodeAbiString(nameHex),
        symbol: decodeAbiString(symbolHex),
        decimals: Number(hexToBigInt(decHex)),
      };
    },
  },
  "/pay/nonce": {
    summary: "Base tx nonce",
    description: "Transaction count (nonce) for an address on Base. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "address", required: true }],
    queryExample: { address: PAY_TO },
    example: { network: "base", address: PAY_TO, nonce: 0 },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      const n = await rpc(BASE_RPC, "eth_getTransactionCount", [address, "latest"]);
      return { network: "base", address, nonce: Number(hexToBigInt(n)) };
    },
  },
  "/pay/hash": {
    summary: "SHA-256",
    description: "SHA-256 of a short text payload (max 4000 chars). $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "text", required: true }],
    queryExample: { text: "hello" },
    example: { bytes: 5, sha256: "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824" },
    handler: async (q) => {
      const text = String(q.get("text") || "").slice(0, 4000);
      return { bytes: Buffer.byteLength(text), sha256: new Bun.CryptoHasher("sha256").update(text).digest("hex") };
    },
  },
  "/pay/outline": {
    summary: "Heading outline",
    description: "Extract h1–h3 headings from a public page. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, headings: [{ level: "h1", text: "Example Domain" }] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const headings = [...text.matchAll(/<(h[1-3])\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => ({
        level: m[1].toLowerCase(),
        text: stripTags(m[2]).slice(0, 200),
      }));
      return { url, count: headings.length, headings: headings.slice(0, 40) };
    },
  },
  "/pay/canonical": {
    summary: "Canonical URL",
    description: "Return rel=canonical and og:url for a public page. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", canonical: "https://example.com/", ogUrl: "" },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const canon = (text.match(/<link[^>]+rel=["']canonical["'][^>]*href=["']([^"']+)["']/i) ||
        text.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']canonical["']/i) || [])[1];
      const meta = metaMap(text);
      return { url, canonical: canon ? absUrl(url, canon) : "", ogUrl: meta["og:url"] || "" };
    },
  },
  "/pay/manifest": {
    summary: "Web app manifest",
    description: "Fetch the web app manifest linked from a public page. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", manifestUrl: null, manifest: null },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const href = (text.match(/<link[^>]+rel=["']manifest["'][^>]*href=["']([^"']+)["']/i) ||
        text.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["']manifest["']/i) || [])[1];
      if (!href) return { url, manifestUrl: null, manifest: null };
      const manifestUrl = absUrl(url, href);
      try {
        const man = await fetchPublic(manifestUrl);
        return { url, manifestUrl, manifest: JSON.parse(man.text) };
      } catch {
        return { url, manifestUrl, manifest: null };
      }
    },
  },
  "/pay/block": {
    summary: "Latest Base block",
    description: "Latest Base block number, hash and timestamp. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", number: 1, hash: "0x", timestamp: 0 },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        number: Number(hexToBigInt(block.number)),
        hash: block.hash,
        timestamp: Number(hexToBigInt(block.timestamp)),
      };
    },
  },
  "/pay/contract": {
    summary: "Is contract",
    description: "Whether an address has bytecode on Base, plus bytecode size. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "address", required: true }],
    queryExample: { address: USDC },
    example: { network: "base", address: USDC, isContract: true, bytecodeBytes: 1 },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      const code = await rpc(BASE_RPC, "eth_getCode", [address, "latest"]);
      const hex = (code || "0x").replace(/^0x/, "");
      const bytecodeBytes = hex.length / 2;
      return { network: "base", address, isContract: bytecodeBytes > 0, bytecodeBytes };
    },
  },
  "/pay/ns": {
    summary: "DNS NS records",
    description: "Name server records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", ns: ["a.iana-servers.net", "b.iana-servers.net"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const ns = (await doh(host, "NS")).map((s) => s.replace(/\.$/, ""));
      return { host, ns };
    },
  },
  "/pay/whois": {
    summary: "WHOIS",
    description: "IANA-referred WHOIS text for a public domain. $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", refer: "whois.verisign-grs.com", text: "Domain Name: EXAMPLE.COM" },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) || isPrivateHost(host)) throw new Error("Invalid host");
      const { refer, text } = await whoisLookup(host);
      return { host, refer, text };
    },
  },
  "/pay/cert": {
    summary: "TLS certificate",
    description: "TLS certificate subject, issuer and expiry for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      subject: { CN: "example.com" },
      issuer: { O: "DigiCert" },
      validFrom: "Jan 1 00:00:00 2026 GMT",
      validTo: "Jan 1 00:00:00 2027 GMT",
      serialNumber: "00",
      fingerprint256: "AA:BB",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(host) || isPrivateHost(host)) throw new Error("Invalid host");
      return tlsCert(host);
    },
  },
  "/pay/ens": {
    summary: "ENS resolve",
    description: "Resolve an ENS name to an Ethereum address. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "name", required: true }],
    queryExample: { name: "vitalik.eth" },
    example: { name: "vitalik.eth", node: "0x", address: "0x" },
    handler: async (q) => {
      const name = String(q.get("name") || "").trim().toLowerCase();
      if (!name.endsWith(".eth") || name.length > 80) throw new Error("Invalid ENS name");
      const node = namehash(name);
      const resolverHex = await ethCall(ENS_REGISTRY, selector("resolver(bytes32)") + pad32(node), ETH_RPC);
      const resolver = "0x" + resolverHex.slice(-40);
      if (resolver === "0x0000000000000000000000000000000000000000") return { name, node, address: null };
      const addrHex = await ethCall(resolver, selector("addr(bytes32)") + pad32(node), ETH_RPC);
      const address = "0x" + addrHex.slice(-40);
      return { name, node, address };
    },
  },
  "/pay/txid": {
    summary: "Base transaction",
    description: "Base transaction and receipt status by hash. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "hash", required: true }],
    queryExample: { hash: "0x" + "11".repeat(32) },
    example: { network: "base", hash: "0x", from: "0x", to: "0x", valueWei: "0", status: 1, blockNumber: 1 },
    handler: async (q) => {
      const hash = String(q.get("hash") || "");
      if (!/^0x[a-fA-F0-9]{64}$/.test(hash)) throw new Error("Invalid tx hash");
      const [tx, receipt] = await Promise.all([
        rpc(BASE_RPC, "eth_getTransactionByHash", [hash]),
        rpc(BASE_RPC, "eth_getTransactionReceipt", [hash]),
      ]);
      if (!tx) return { network: "base", hash, found: false };
      return {
        network: "base",
        hash,
        found: true,
        from: tx.from,
        to: tx.to,
        valueWei: hexToBigInt(tx.value).toString(),
        status: receipt ? Number(hexToBigInt(receipt.status)) : null,
        blockNumber: tx.blockNumber ? Number(hexToBigInt(tx.blockNumber)) : null,
      };
    },
  },
  "/pay/favicon": {
    summary: "Favicon URL",
    description: "Resolve the favicon URL from a public page. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", favicon: "https://example.com/favicon.ico" },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const href = (text.match(/<link[^>]+rel=["'][^"']*icon[^"']*["'][^>]*href=["']([^"']+)["']/i) ||
        text.match(/<link[^>]+href=["']([^"']+)["'][^>]*rel=["'][^"']*icon[^"']*["']/i) || [])[1];
      return { url, favicon: href ? absUrl(url, href) : new URL("/favicon.ico", url).toString() };
    },
  },
  "/pay/keywords": {
    summary: "Page keywords",
    description: "Meta keywords and title tokens from a public page. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", title: "Example Domain", keywords: ["example", "domain"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const meta = metaMap(text);
      const title = meta["og:title"] || htmlTitle(text);
      const fromMeta = String(meta.keywords || "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      const fromTitle = title
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((w) => w.length > 2);
      const keywords = [...new Set([...fromMeta, ...fromTitle])].slice(0, 24);
      return { url, title, keywords };
    },
  },
  "/pay/spf": {
    summary: "SPF records",
    description: "DNS TXT SPF records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", records: ["v=spf1 -all"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const txt = (await doh(host, "TXT")).map((s) => s.replace(/"/g, "").trim());
      const records = txt.filter((s) => /^v=spf1\b/i.test(s));
      return { host, records };
    },
  },
  "/pay/dmarc": {
    summary: "DMARC policy",
    description: "DMARC TXT policy for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", name: "_dmarc.example.com", records: ["v=DMARC1; p=reject"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const name = `_dmarc.${host}`;
      const txt = (await doh(name, "TXT")).map((s) => s.replace(/"/g, "").trim());
      const records = txt.filter((s) => /v=DMARC1/i.test(s));
      return { host, name, records };
    },
  },
  "/pay/hreflang": {
    summary: "hreflang alternates",
    description: "Extract rel=alternate hreflang URLs from a public page. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, alternates: [{ hreflang: "en", href: "https://example.com/" }] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const tags = text.match(/<link\b[^>]*>/gi) || [];
      const alternates = [];
      for (const tag of tags) {
        if (!/\brel=["'][^"']*alternate[^"']*["']/i.test(tag)) continue;
        const hreflang = (tag.match(/\bhreflang=["']([^"']+)["']/i) || [])[1];
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        if (!hreflang || !href) continue;
        const abs = absUrl(url, href);
        if (abs) alternates.push({ hreflang, href: abs });
      }
      return { url, count: alternates.length, alternates: alternates.slice(0, 40) };
    },
  },
  "/pay/llms": {
    summary: "llms.txt",
    description: "Fetch /llms.txt from a public origin. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/llms.txt", status: 200, text: "# Example" },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/llms.txt`;
      const { url, status, text } = await fetchPublic(target);
      return { url, status, text: text.slice(0, 20_000) };
    },
  },
  "/pay/checksum": {
    summary: "EIP-55 checksum",
    description: "EIP-55 checksum an Ethereum address. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "address", required: true }],
    queryExample: { address: PAY_TO },
    example: { address: PAY_TO, checksum: PAY_TO },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      const checksum = toChecksumAddress(address);
      return { address, checksum };
    },
  },
  "/pay/supply": {
    summary: "ERC-20 totalSupply",
    description: "totalSupply for an ERC-20 on Base, with decimals. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "address", required: true }],
    queryExample: { address: USDC },
    example: { network: "base", address: USDC, decimals: 6, totalSupply: "0" },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      const [supplyHex, decHex] = await Promise.all([
        ethCall(address, selector("totalSupply()")),
        ethCall(address, selector("decimals()")),
      ]);
      const decimals = Number(hexToBigInt(decHex));
      return {
        network: "base",
        address,
        decimals,
        totalSupply: formatUnits(supplyHex, Number.isFinite(decimals) ? decimals : 18).toString(),
      };
    },
  },
  "/pay/mx": {
    summary: "DNS MX records",
    description: "Mail exchanger records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", mx: [{ preference: 10, exchange: "mail.example.com" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const mx = (await doh(host, "MX")).map((s) => {
        const m = String(s).trim().match(/^(\d+)\s+(\S+)/);
        return m
          ? { preference: Number(m[1]), exchange: m[2].replace(/\.$/, "") }
          : { preference: null, exchange: String(s).replace(/\.$/, "") };
      });
      return { host, mx };
    },
  },
  "/pay/caa": {
    summary: "DNS CAA records",
    description: "Certification Authority Authorization records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", caa: ['0 issue "letsencrypt.org"'] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const caa = (await doh(host, "CAA")).map((s) => String(s).trim());
      return { host, caa };
    },
  },
  "/pay/security": {
    summary: "security.txt",
    description: "Fetch /.well-known/security.txt from a public origin. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/.well-known/security.txt", status: 200, text: "Contact: mailto:security@example.com" },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/.well-known/security.txt`;
      const { url, status, text } = await fetchPublic(target);
      return { url, status, text: text.slice(0, 20_000) };
    },
  },
  "/pay/ads": {
    summary: "ads.txt",
    description: "Fetch /ads.txt from a public origin. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/ads.txt", status: 200, text: "example.com, pub-1, DIRECT" },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/ads.txt`;
      const { url, status, text } = await fetchPublic(target);
      return { url, status, text: text.slice(0, 20_000) };
    },
  },
  "/pay/keccak": {
    summary: "Keccak-256",
    description: "Keccak-256 of a short text payload (max 4000 chars). $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "text", required: true }],
    queryExample: { text: "hello" },
    example: { bytes: 5, keccak256: "1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8" },
    handler: async (q) => {
      const text = String(q.get("text") || "").slice(0, 4000);
      return { bytes: Buffer.byteLength(text), keccak256: keccak256Hex(text) };
    },
  },
  "/pay/basefee": {
    summary: "Base EIP-1559 base fee",
    description: "Latest Base block baseFeePerGas in wei and gwei. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, baseFeeWei: "1000000", baseFeeGwei: 0.001 },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const wei = hexToBigInt(block.baseFeePerGas);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block.number)),
        baseFeeWei: wei.toString(),
        baseFeeGwei: Number(wei) / 1e9,
      };
    },
  },
  "/pay/txt": {
    summary: "DNS TXT records",
    description: "TXT records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", txt: ["v=spf1 -all"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const txt = (await doh(host, "TXT")).map((s) => String(s).replace(/"/g, "").trim());
      return { host, txt };
    },
  },
  "/pay/soa": {
    summary: "DNS SOA record",
    description: "Start of Authority record for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      mname: "ns.example.com",
      rname: "hostmaster.example.com",
      serial: "1",
      refresh: 7200,
      retry: 3600,
      expire: 1209600,
      minimum: 3600,
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const raw = (await doh(host, "SOA"))[0];
      if (!raw) return { host, found: false };
      const parts = String(raw).trim().split(/\s+/);
      return {
        host,
        found: true,
        mname: (parts[0] || "").replace(/\.$/, ""),
        rname: (parts[1] || "").replace(/\.$/, ""),
        serial: parts[2] || "",
        refresh: Number(parts[3]) || 0,
        retry: Number(parts[4]) || 0,
        expire: Number(parts[5]) || 0,
        minimum: Number(parts[6]) || 0,
      };
    },
  },
  "/pay/humans": {
    summary: "humans.txt",
    description: "Fetch /humans.txt from a public origin. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/humans.txt", status: 200, text: "/* TEAM */" },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/humans.txt`;
      const { url, status, text } = await fetchPublic(target);
      return { url, status, text: text.slice(0, 20_000) };
    },
  },
  "/pay/assetlinks": {
    summary: "Digital Asset Links",
    description: "Fetch /.well-known/assetlinks.json from a public origin. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/.well-known/assetlinks.json", status: 200, count: 1, statements: [] },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/.well-known/assetlinks.json`;
      const { url, status, text } = await fetchPublic(target);
      let statements = [];
      try {
        const parsed = JSON.parse(text);
        statements = Array.isArray(parsed) ? parsed.slice(0, 40) : [];
      } catch {
        statements = [];
      }
      return { url, status, count: statements.length, statements };
    },
  },
  "/pay/priority": {
    summary: "Base priority fee",
    description: "Current Base eth_maxPriorityFeePerGas in wei and gwei. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", maxPriorityFeeWei: "1000000", maxPriorityFeeGwei: 0.001 },
    handler: async () => {
      const hex = await rpc(BASE_RPC, "eth_maxPriorityFeePerGas", []);
      const wei = hexToBigInt(hex);
      return {
        network: "base",
        maxPriorityFeeWei: wei.toString(),
        maxPriorityFeeGwei: Number(wei) / 1e9,
      };
    },
  },
  "/pay/selector": {
    summary: "Solidity function selector",
    description: "4-byte keccak selector for a Solidity function signature. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "sig", required: true }],
    queryExample: { sig: "transfer(address,uint256)" },
    example: { sig: "transfer(address,uint256)", selector: "0xa9059cbb" },
    handler: async (q) => {
      const sig = String(q.get("sig") || "").trim().replace(/\s+/g, "");
      if (!/^[A-Za-z_][A-Za-z0-9_]*\([A-Za-z0-9_,\[\]]*\)?$/.test(sig) || sig.length > 200) {
        throw new Error("Invalid function signature");
      }
      return { sig, selector: selector(sig) };
    },
  },
  "/pay/aaaa": {
    summary: "DNS AAAA records",
    description: "IPv6 AAAA records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", aaaa: ["2606:2800:21f:cb07:6820:80da:af6b:8b2c"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const aaaa = (await doh(host, "AAAA")).map((s) => String(s).replace(/\.$/, ""));
      return { host, aaaa };
    },
  },
  "/pay/cname": {
    summary: "DNS CNAME record",
    description: "CNAME target for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "www.example.com" },
    example: { host: "www.example.com", cname: "example.com" },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const records = (await doh(host, "CNAME")).map((s) => String(s).replace(/\.$/, ""));
      return { host, cname: records[0] || "", records };
    },
  },
  "/pay/srv": {
    summary: "DNS SRV records",
    description: "SRV records for a public service name. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "_sip._tcp.example.com" },
    example: { host: "_sip._tcp.example.com", srv: [{ priority: 10, weight: 1, port: 5060, target: "sip.example.com" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const srv = (await doh(host, "SRV")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return {
          priority: Number(parts[0]) || 0,
          weight: Number(parts[1]) || 0,
          port: Number(parts[2]) || 0,
          target: (parts[3] || "").replace(/\.$/, ""),
        };
      });
      return { host, srv };
    },
  },
  "/pay/app-ads": {
    summary: "app-ads.txt",
    description: "Fetch /app-ads.txt from a public origin. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/app-ads.txt", status: 200, text: "example.com, pub-1, DIRECT" },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/app-ads.txt`;
      const { url, status, text } = await fetchPublic(target);
      return { url, status, text: text.slice(0, 20_000) };
    },
  },
  "/pay/openid": {
    summary: "OpenID Provider Configuration",
    description: "Fetch /.well-known/openid-configuration from a public origin. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://accounts.google.com" },
    example: {
      url: "https://accounts.google.com/.well-known/openid-configuration",
      status: 200,
      issuer: "https://accounts.google.com",
      authorization_endpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/.well-known/openid-configuration`;
      const { url, status, text } = await fetchPublic(target);
      let config = {};
      try {
        config = JSON.parse(text);
      } catch {
        config = {};
      }
      return {
        url,
        status,
        issuer: config.issuer || "",
        authorization_endpoint: config.authorization_endpoint || "",
        token_endpoint: config.token_endpoint || "",
        jwks_uri: config.jwks_uri || "",
        config,
      };
    },
  },
  "/pay/aasa": {
    summary: "Apple App Site Association",
    description: "Fetch /.well-known/apple-app-site-association from a public origin. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com/.well-known/apple-app-site-association",
      status: 200,
      applinks: true,
      webcredentials: false,
    },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/.well-known/apple-app-site-association`;
      const { url, status, text } = await fetchPublic(target);
      let body = {};
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
      return {
        url,
        status,
        applinks: Boolean(body.applinks),
        webcredentials: Boolean(body.webcredentials),
        activitycontinuation: Boolean(body.activitycontinuation),
        body,
      };
    },
  },
  "/pay/naptr": {
    summary: "DNS NAPTR records",
    description: "NAPTR records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      naptr: [{ order: 10, preference: 100, flags: "u", service: "E2U+sip", regexp: "", replacement: "sip.example.com" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const naptr = (await doh(host, "NAPTR")).map((s) => {
        const m = String(s).trim().match(/^(\d+)\s+(\d+)\s+"?([^"]*)"?\s+"?([^"]*)"?\s+"?([^"]*)"?\s+(\S+)/);
        return m
          ? {
              order: Number(m[1]),
              preference: Number(m[2]),
              flags: m[3],
              service: m[4],
              regexp: m[5],
              replacement: m[6].replace(/\.$/, ""),
            }
          : { raw: String(s) };
      });
      return { host, naptr };
    },
  },
  "/pay/ptr": {
    summary: "Reverse DNS PTR",
    description: "PTR records for a public IPv4 address. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "ip", required: true }],
    queryExample: { ip: "1.1.1.1" },
    example: { ip: "1.1.1.1", ptr: ["one.one.one.one"] },
    handler: async (q) => {
      const ip = String(q.get("ip") || "").trim();
      if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(ip) || isPrivateHost(ip)) throw new Error("Invalid ip");
      const name = `${ip.split(".").reverse().join(".")}.in-addr.arpa`;
      const ptr = (await doh(name, "PTR")).map((s) => String(s).replace(/\.$/, ""));
      return { ip, ptr };
    },
  },
  "/pay/svcb": {
    summary: "DNS HTTPS/SVCB records",
    description: "HTTPS (SVCB) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", https: ["1 . alpn=\"h3,h2\""] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const https = await doh(host, "HTTPS");
      return { host, https };
    },
  },
  "/pay/hsts": {
    summary: "HSTS header",
    description: "Read Strict-Transport-Security from a public URL. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/", status: 200, hsts: "max-age=31536000; includeSubDomains" },
    handler: async (q) => {
      const { url, status, headers } = await fetchPublic(q.get("url"));
      return { url, status, hsts: headers.get("strict-transport-security") || "" };
    },
  },
  "/pay/cors": {
    summary: "CORS headers",
    description: "Read Access-Control response headers from a public URL. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com/",
      status: 200,
      allowOrigin: "*",
      allowMethods: "GET, POST",
      allowHeaders: "",
      exposeHeaders: "",
      allowCredentials: "",
      maxAge: "",
    },
    handler: async (q) => {
      const { url, status, headers } = await fetchPublic(q.get("url"));
      const pick = (name) => headers.get(name) || "";
      return {
        url,
        status,
        allowOrigin: pick("access-control-allow-origin"),
        allowMethods: pick("access-control-allow-methods"),
        allowHeaders: pick("access-control-allow-headers"),
        exposeHeaders: pick("access-control-expose-headers"),
        allowCredentials: pick("access-control-allow-credentials"),
        maxAge: pick("access-control-max-age"),
      };
    },
  },
  "/pay/chainid": {
    summary: "Base chain id",
    description: "eth_chainId for Base mainnet. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", chainId: 8453, chainIdHex: "0x2105" },
    handler: async () => {
      const hex = await rpc(BASE_RPC, "eth_chainId", []);
      return { network: "base", chainId: Number(hexToBigInt(hex)), chainIdHex: hex };
    },
  },
  "/pay/tlsa": {
    summary: "DNS TLSA records",
    description: "DANE TLSA records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "_443._tcp.example.com" },
    example: {
      host: "_443._tcp.example.com",
      tlsa: [{ usage: 3, selector: 1, matchingType: 1, certificate: "abcdef" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const tlsa = (await doh(host, "TLSA")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 4
          ? {
              usage: Number(parts[0]) || 0,
              selector: Number(parts[1]) || 0,
              matchingType: Number(parts[2]) || 0,
              certificate: parts.slice(3).join(""),
            }
          : { raw: String(s) };
      });
      return { host, tlsa };
    },
  },
  "/pay/sshfp": {
    summary: "DNS SSHFP records",
    description: "SSHFP records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", sshfp: [{ algorithm: 1, type: 1, fingerprint: "abcdef" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const sshfp = (await doh(host, "SSHFP")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 3
          ? { algorithm: Number(parts[0]) || 0, type: Number(parts[1]) || 0, fingerprint: parts.slice(2).join("") }
          : { raw: String(s) };
      });
      return { host, sshfp };
    },
  },
  "/pay/ds": {
    summary: "DNSSEC DS records",
    description: "DS records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", ds: [{ keyTag: 370, algorithm: 13, digestType: 2, digest: "abcdef" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const ds = (await doh(host, "DS")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 4
          ? {
              keyTag: Number(parts[0]) || 0,
              algorithm: Number(parts[1]) || 0,
              digestType: Number(parts[2]) || 0,
              digest: parts.slice(3).join(""),
            }
          : { raw: String(s) };
      });
      return { host, ds };
    },
  },
  "/pay/csp": {
    summary: "Content-Security-Policy header",
    description: "Read Content-Security-Policy from a public URL. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/", status: 200, csp: "default-src 'self'", reportOnly: "" },
    handler: async (q) => {
      const { url, status, headers } = await fetchPublic(q.get("url"));
      return {
        url,
        status,
        csp: headers.get("content-security-policy") || "",
        reportOnly: headers.get("content-security-policy-report-only") || "",
      };
    },
  },
  "/pay/webfinger": {
    summary: "WebFinger lookup",
    description: "Resolve a WebFinger resource via /.well-known/webfinger. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "resource", required: true }],
    queryExample: { resource: "acct:admin@example.com" },
    example: {
      resource: "acct:admin@example.com",
      url: "https://example.com/.well-known/webfinger?resource=acct%3Aadmin%40example.com",
      status: 200,
      subject: "acct:admin@example.com",
      aliases: [],
    },
    handler: async (q) => {
      const resource = String(q.get("resource") || "").trim();
      if (!resource || resource.length > 500) throw new Error("Invalid resource");
      let host = "";
      if (/^acct:/i.test(resource)) {
        const at = resource.lastIndexOf("@");
        host = at >= 0 ? resource.slice(at + 1).toLowerCase() : "";
      } else {
        const raw = /^https?:\/\//i.test(resource) ? resource : `https://${resource}`;
        host = assertPublicHttpUrl(raw).hostname.toLowerCase();
      }
      if (!host || isPrivateHost(host)) throw new Error("Invalid resource");
      const target = `https://${host}/.well-known/webfinger?resource=${encodeURIComponent(resource)}`;
      const { url, status, text } = await fetchPublic(target);
      let body = {};
      try {
        body = JSON.parse(text);
      } catch {
        body = {};
      }
      return {
        resource,
        url,
        status,
        subject: body.subject || "",
        aliases: Array.isArray(body.aliases) ? body.aliases.slice(0, 32) : [],
        links: Array.isArray(body.links) ? body.links.slice(0, 32) : [],
      };
    },
  },
  "/pay/blockhash": {
    summary: "Base latest block hash",
    description: "Latest Base block number and hash. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, hash: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        hash: block?.hash || "",
        parentHash: block?.parentHash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/dnskey": {
    summary: "DNSKEY records",
    description: "DNSSEC DNSKEY records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      dnskey: [{ flags: 257, protocol: 3, algorithm: 13, publicKey: "abcd" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const dnskey = (await doh(host, "DNSKEY")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 4
          ? {
              flags: Number(parts[0]) || 0,
              protocol: Number(parts[1]) || 0,
              algorithm: Number(parts[2]) || 0,
              publicKey: parts.slice(3).join(""),
            }
          : { raw: String(s) };
      });
      return { host, dnskey };
    },
  },
  "/pay/dkim": {
    summary: "DKIM TXT record",
    description: "DKIM public-key TXT for selector._domainkey.host. $0.002 USDC on Base.",
    price: "0.002",
    params: [
      { name: "host", required: true },
      { name: "selector", required: true },
    ],
    queryExample: { host: "example.com", selector: "default" },
    example: { host: "example.com", selector: "default", name: "default._domainkey.example.com", dkim: ["v=DKIM1; k=rsa; p=abcd"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      const selectorName = String(q.get("selector") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(selectorName)) throw new Error("Invalid selector");
      const name = `${selectorName}._domainkey.${host}`;
      const dkim = (await doh(name, "TXT")).map((s) => String(s).replace(/^"|"$/g, "").replace(/" "/g, ""));
      return { host, selector: selectorName, name, dkim };
    },
  },
  "/pay/mta-sts": {
    summary: "MTA-STS policy",
    description: "MTA-STS TXT id plus policy file for a public mail domain. $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      txt: ["v=STSv1; id=20260101"],
      policyUrl: "https://mta-sts.example.com/.well-known/mta-sts.txt",
      status: 200,
      policy: "version: STSv1\nmode: enforce\n",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host) || isPrivateHost(`mta-sts.${host}`)) throw new Error("Invalid host");
      const txt = (await doh(`_mta-sts.${host}`, "TXT")).map((s) =>
        String(s).replace(/^"|"$/g, "").replace(/" "/g, ""),
      );
      const policyUrl = `https://mta-sts.${host}/.well-known/mta-sts.txt`;
      let url = policyUrl;
      let status = 0;
      let policy = "";
      try {
        const fetched = await fetchPublic(policyUrl, { maxBytes: 8_000 });
        url = fetched.url;
        status = fetched.status;
        policy = fetched.text.slice(0, 4000);
      } catch {
        policy = "";
      }
      return { host, txt, policyUrl: url, status, policy };
    },
  },
  "/pay/nodeinfo": {
    summary: "NodeInfo discovery",
    description: "Resolve /.well-known/nodeinfo and the first schema document. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      discoveryUrl: "https://example.com/.well-known/nodeinfo",
      href: "https://example.com/nodeinfo/2.1",
      software: { name: "mastodon", version: "4.0.0" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const discoveryUrl = `https://${host}/.well-known/nodeinfo`;
      const discovery = await fetchPublic(discoveryUrl);
      let links = [];
      try {
        const body = JSON.parse(discovery.text);
        links = Array.isArray(body.links) ? body.links : [];
      } catch {
        links = [];
      }
      const picked = links.find((l) => typeof l?.href === "string");
      if (!picked) {
        return { host, discoveryUrl: discovery.url, status: discovery.status, links, href: "", nodeinfo: null };
      }
      const href = assertPublicHttpUrl(absUrl(`https://${host}/`, picked.href) || picked.href).toString();
      const doc = await fetchPublic(href);
      let nodeinfo = null;
      try {
        nodeinfo = JSON.parse(doc.text);
      } catch {
        nodeinfo = null;
      }
      return {
        host,
        discoveryUrl: discovery.url,
        status: doc.status,
        rel: picked.rel || "",
        href,
        software: nodeinfo?.software || null,
        protocols: Array.isArray(nodeinfo?.protocols) ? nodeinfo.protocols.slice(0, 16) : [],
        usage: nodeinfo?.usage || null,
      };
    },
  },
  "/pay/proxy": {
    summary: "EIP-1967 proxy slots",
    description: "Read EIP-1967 implementation, admin and beacon slots for a Base address. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "address", required: true }],
    queryExample: { address: USDC },
    example: {
      network: "base",
      address: USDC,
      implementation: "0x0000000000000000000000000000000000000000",
      admin: "0x0000000000000000000000000000000000000000",
      beacon: "0x0000000000000000000000000000000000000000",
    },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      const slots = {
        implementation: "0x360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc",
        admin: "0xb53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103",
        beacon: "0xa3f0ad74e5423aebfd80d3ef4346578335a9a72aeaee59ff6cb3582b35133d50",
      };
      const toAddr = (hex) => {
        const h = String(hex || "0x").replace(/^0x/, "").padStart(64, "0");
        return "0x" + h.slice(-40);
      };
      const [implementation, admin, beacon] = await Promise.all(
        Object.values(slots).map((slot) => rpc(BASE_RPC, "eth_getStorageAt", [address, slot, "latest"])),
      );
      return {
        network: "base",
        address,
        implementation: toAddr(implementation),
        admin: toAddr(admin),
        beacon: toAddr(beacon),
      };
    },
  },
  "/pay/blobbasefee": {
    summary: "Base blob base fee",
    description: "Current blob base fee on Base (EIP-4844). $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: {
      network: "base",
      blockNumber: 1,
      blobGasUsed: "0",
      excessBlobGas: "0",
      blobBaseFeeWei: "1",
      blobBaseFeeHex: "0x1",
    },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const excessBlobGas = hexToBigInt(block?.excessBlobGas);
      const blobGasUsed = hexToBigInt(block?.blobGasUsed);
      const blobBaseFee = blobBaseFeeFromExcess(excessBlobGas);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        blobGasUsed: String(blobGasUsed),
        excessBlobGas: String(excessBlobGas),
        blobBaseFeeWei: String(blobBaseFee),
        blobBaseFeeHex: "0x" + blobBaseFee.toString(16),
      };
    },
  },
  "/pay/cds": {
    summary: "DNSSEC CDS records",
    description: "Child DS (CDS) records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", cds: [{ keyTag: 370, algorithm: 13, digestType: 2, digest: "abcdef" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const cds = (await doh(host, "CDS")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 4
          ? {
              keyTag: Number(parts[0]) || 0,
              algorithm: Number(parts[1]) || 0,
              digestType: Number(parts[2]) || 0,
              digest: parts.slice(3).join(""),
            }
          : { raw: String(s) };
      });
      return { host, cds };
    },
  },
  "/pay/rrsig": {
    summary: "DNSSEC RRSIG records",
    description: "RRSIG records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      rrsig: [{ typeCovered: "DNSKEY", algorithm: 13, labels: 2, keyTag: 2371, signer: "example.com." }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const rrsig = (await doh(host, "RRSIG")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 8
          ? {
              typeCovered: parts[0],
              algorithm: Number(parts[1]) || 0,
              labels: Number(parts[2]) || 0,
              originalTtl: Number(parts[3]) || 0,
              expiration: parts[4] || "",
              inception: parts[5] || "",
              keyTag: Number(parts[6]) || 0,
              signer: parts[7] || "",
              signature: parts.slice(8).join(""),
            }
          : { raw: String(s) };
      });
      return { host, rrsig };
    },
  },
  "/pay/bimi": {
    summary: "BIMI TXT record",
    description: "BIMI assertion TXT at {selector}._bimi.{host}. $0.002 USDC on Base.",
    price: "0.002",
    params: [
      { name: "host", required: true },
      { name: "selector", required: false },
    ],
    queryExample: { host: "example.com", selector: "default" },
    example: {
      host: "example.com",
      selector: "default",
      name: "default._bimi.example.com",
      bimi: ["v=BIMI1; l=https://example.com/logo.svg"],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      const selectorName = String(q.get("selector") || "default").trim().toLowerCase() || "default";
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      if (!/^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?$/.test(selectorName)) throw new Error("Invalid selector");
      const name = `${selectorName}._bimi.${host}`;
      const bimi = (await doh(name, "TXT")).map((s) => String(s).replace(/^"|"$/g, "").replace(/" "/g, ""));
      return { host, selector: selectorName, name, bimi };
    },
  },
  "/pay/oembed": {
    summary: "oEmbed discovery",
    description: "Find and fetch a JSON oEmbed document from a public page. $0.003 USDC on Base.",
    price: "0.003",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/post" },
    example: {
      url: "https://example.com/post",
      oembedUrl: "https://example.com/oembed?url=https://example.com/post",
      type: "rich",
      title: "Example",
    },
    handler: async (q) => {
      const page = await fetchPublic(q.get("url"));
      const href = (
        page.text.match(
          /<link[^>]+type=["']application\/json\+oembed["'][^>]*href=["']([^"']+)["']/i,
        ) ||
        page.text.match(
          /<link[^>]+href=["']([^"']+)["'][^>]*type=["']application\/json\+oembed["']/i,
        ) ||
        []
      )[1];
      if (!href) {
        return { url: page.url, oembedUrl: "", type: "", title: "", oembed: null };
      }
      const oembedUrl = assertPublicHttpUrl(absUrl(page.url, href) || href).toString();
      const doc = await fetchPublic(oembedUrl, { maxBytes: 32_000 });
      let oembed = null;
      try {
        oembed = JSON.parse(doc.text);
      } catch {
        oembed = null;
      }
      return {
        url: page.url,
        oembedUrl: doc.url,
        status: doc.status,
        type: oembed?.type || "",
        title: oembed?.title || "",
        providerName: oembed?.provider_name || "",
        thumbnailUrl: oembed?.thumbnail_url || "",
        html: typeof oembed?.html === "string" ? oembed.html.slice(0, 2000) : "",
      };
    },
  },
  "/pay/storage": {
    summary: "Base storage slot",
    description: "Read one storage slot for an address on Base. $0.002 USDC on Base.",
    price: "0.002",
    params: [
      { name: "address", required: true },
      { name: "slot", required: true },
    ],
    queryExample: { address: USDC, slot: "0x0" },
    example: { network: "base", address: USDC, slot: "0x0", value: "0x" + "00".repeat(32) },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      const rawSlot = String(q.get("slot") || "").trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      let slot;
      if (/^0x[a-fA-F0-9]{1,64}$/.test(rawSlot)) {
        slot = "0x" + pad32(rawSlot);
      } else if (/^\d+$/.test(rawSlot)) {
        slot = "0x" + pad32(BigInt(rawSlot).toString(16));
      } else {
        throw new Error("Invalid slot");
      }
      const value = await rpc(BASE_RPC, "eth_getStorageAt", [address, slot, "latest"]);
      return { network: "base", address, slot, value };
    },
  },
  "/pay/feehistory": {
    summary: "Base fee history",
    description: "EIP-1559 base fee and priority fee percentiles on Base. $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "blocks", required: false }],
    queryExample: { blocks: "8" },
    example: {
      network: "base",
      oldestBlock: 1,
      baseFeePerGasWei: ["100"],
      rewardWei: [["1", "2", "3"]],
    },
    handler: async (q) => {
      const n = Math.min(20, Math.max(1, Number(q.get("blocks") || 8) || 8));
      const hist = await rpc(BASE_RPC, "eth_feeHistory", [n, "latest", [25, 50, 75]]);
      const toDec = (arr) => (Array.isArray(arr) ? arr.map((x) => hexToBigInt(x).toString()) : []);
      return {
        network: "base",
        blockCount: n,
        oldestBlock: Number(hexToBigInt(hist?.oldestBlock)),
        baseFeePerGasWei: toDec(hist?.baseFeePerGas),
        gasUsedRatio: Array.isArray(hist?.gasUsedRatio) ? hist.gasUsedRatio.slice(0, 20) : [],
        rewardWei: Array.isArray(hist?.reward)
          ? hist.reward.slice(0, 20).map((row) => (Array.isArray(row) ? row.map((x) => hexToBigInt(x).toString()) : []))
          : [],
      };
    },
  },
  "/pay/nsec": {
    summary: "DNSSEC NSEC records",
    description: "NSEC next-secure records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      nsec: [{ next: "www.example.com", types: ["A", "NS", "SOA", "MX", "TXT", "AAAA", "RRSIG", "NSEC", "DNSKEY"] }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nsec = (await doh(host, "NSEC")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 1
          ? { next: (parts[0] || "").replace(/\.$/, ""), types: parts.slice(1) }
          : { raw: String(s) };
      });
      return { host, nsec };
    },
  },
  "/pay/cdnskey": {
    summary: "DNSSEC CDNSKEY records",
    description: "Child DNSKEY (CDNSKEY) records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      cdnskey: [{ flags: 257, protocol: 3, algorithm: 13, publicKey: "abcd" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const cdnskey = (await doh(host, "CDNSKEY")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 4
          ? {
              flags: Number(parts[0]) || 0,
              protocol: Number(parts[1]) || 0,
              algorithm: Number(parts[2]) || 0,
              publicKey: parts.slice(3).join(""),
            }
          : { raw: String(s) };
      });
      return { host, cdnskey };
    },
  },
  "/pay/uri": {
    summary: "DNS URI records",
    description: "URI records (RFC 7553) for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      uri: [{ priority: 10, weight: 1, target: "https://example.com/" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const uri = (await doh(host, "URI")).map((s) => {
        const m = String(s).trim().match(/^(\d+)\s+(\d+)\s+"?([^"]*)"?$/);
        return m
          ? { priority: Number(m[1]), weight: Number(m[2]), target: m[3] }
          : { raw: String(s) };
      });
      return { host, uri };
    },
  },
  "/pay/host-meta": {
    summary: "host-meta discovery",
    description: "Fetch RFC 6415 /.well-known/host-meta(.json) for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/host-meta.json",
      status: 200,
      subject: "https://example.com",
      links: [],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const jsonUrl = `https://${host}/.well-known/host-meta.json`;
      const xrdUrl = `https://${host}/.well-known/host-meta`;
      let fetched;
      try {
        fetched = await fetchPublic(jsonUrl);
        if (fetched.status >= 400) throw new Error("fallback");
      } catch {
        fetched = await fetchPublic(xrdUrl);
      }
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      const links = Array.isArray(body.links)
        ? body.links.slice(0, 32)
        : [...fetched.text.matchAll(/<Link\b([^>]*)>/gi)].slice(0, 32).map((m) => {
            const tag = m[1];
            const rel = (tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "";
            const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1] || "";
            return { rel, href };
          });
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        subject: body.subject || "",
        links,
      };
    },
  },
  "/pay/maxpriority": {
    summary: "Base max priority fee",
    description: "Suggested EIP-1559 max priority fee per gas on Base. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", maxPriorityFeePerGasWei: "1000000", maxPriorityFeePerGasHex: "0xf4240" },
    handler: async () => {
      const hex = await rpc(BASE_RPC, "eth_maxPriorityFeePerGas", []);
      const wei = hexToBigInt(hex);
      return {
        network: "base",
        maxPriorityFeePerGasWei: String(wei),
        maxPriorityFeePerGasHex: "0x" + wei.toString(16),
      };
    },
  },
  "/pay/coinbase": {
    summary: "Base fee recipient",
    description: "Fee recipient (coinbase) of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, miner: "0x0000000000000000000000000000000000000000" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        miner: block?.miner || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/nsec3": {
    summary: "DNSSEC NSEC3 records",
    description: "NSEC3 hashed next-secure records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      nsec3: [
        {
          hashAlgorithm: 1,
          flags: 0,
          iterations: 0,
          salt: "-",
          next: "2T7B4G4VSA5SMI47K61MV5BV1A22BOJR",
          types: ["A", "NS", "SOA", "MX", "TXT", "RRSIG", "DNSKEY", "NSEC3PARAM"],
        },
      ],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nsec3 = (await doh(host, "NSEC3")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 5) return { raw: String(s) };
        const types = parts.slice(5).filter((t) => /^[A-Z][A-Z0-9]*$/.test(t));
        return {
          hashAlgorithm: Number(parts[0]) || 0,
          flags: Number(parts[1]) || 0,
          iterations: Number(parts[2]) || 0,
          salt: parts[3] || "-",
          next: (parts[4] || "").replace(/\.$/, ""),
          types,
        };
      });
      return { host, nsec3 };
    },
  },
  "/pay/smimea": {
    summary: "DNS SMIMEA records",
    description: "S/MIME certificate association (SMIMEA) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      smimea: [{ usage: 3, selector: 0, matchingType: 1, certificate: "abcdef" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const smimea = (await doh(host, "SMIMEA")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        return parts.length >= 4
          ? {
              usage: Number(parts[0]) || 0,
              selector: Number(parts[1]) || 0,
              matchingType: Number(parts[2]) || 0,
              certificate: parts.slice(3).join(""),
            }
          : { raw: String(s) };
      });
      return { host, smimea };
    },
  },
  "/pay/loc": {
    summary: "DNS LOC records",
    description: "LOC geographic location records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      loc: [{ raw: "37 46 30.000 N 122 25 10.000 W 7.00m 100m 100m 10m" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const loc = (await doh(host, "LOC")).map((s) => {
        const raw = String(s).trim();
        const m = raw.match(
          /^(\d+)\s+(\d+)\s+([\d.]+)\s+([NS])\s+(\d+)\s+(\d+)\s+([\d.]+)\s+([EW])\s+(-?[\d.]+m)\s+([\d.]+m)\s+([\d.]+m)\s+([\d.]+m)$/i,
        );
        if (!m) return { raw };
        return {
          latitude: { degrees: Number(m[1]), minutes: Number(m[2]), seconds: Number(m[3]), hemisphere: m[4].toUpperCase() },
          longitude: { degrees: Number(m[5]), minutes: Number(m[6]), seconds: Number(m[7]), hemisphere: m[8].toUpperCase() },
          altitude: m[9],
          size: m[10],
          horizontalPrecision: m[11],
          verticalPrecision: m[12],
          raw,
        };
      });
      return { host, loc };
    },
  },
  "/pay/atproto": {
    summary: "AT Protocol DID",
    description: "Fetch /.well-known/atproto-did for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", url: "https://example.com/.well-known/atproto-did", status: 200, did: "did:plc:abcd" },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/atproto-did`);
      const did = fetched.text.split(/\r?\n/).map((l) => l.trim()).find((l) => l.startsWith("did:")) || "";
      return { host, url: fetched.url, status: fetched.status, did, body: fetched.text.slice(0, 400) };
    },
  },
  "/pay/gasused": {
    summary: "Base latest gas used",
    description: "Gas used in the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, gasUsed: "21000", gasLimit: "30000000" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        gasUsed: hexToBigInt(block?.gasUsed).toString(),
        gasLimit: hexToBigInt(block?.gasLimit).toString(),
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/txcount": {
    summary: "Base latest tx count",
    description: "Transaction count of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, transactionCount: 12 },
    handler: async () => {
      const countHex = await rpc(BASE_RPC, "eth_getBlockTransactionCountByNumber", ["latest"]);
      const numberHex = await rpc(BASE_RPC, "eth_blockNumber", []);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(numberHex)),
        transactionCount: Number(hexToBigInt(countHex)),
      };
    },
  },
  "/pay/nsec3param": {
    summary: "DNSSEC NSEC3PARAM records",
    description: "NSEC3PARAM hashing parameters for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      nsec3param: [{ hashAlgorithm: 1, flags: 0, iterations: 0, salt: "-" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nsec3param = (await doh(host, "NSEC3PARAM")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4) return { raw: String(s) };
        return {
          hashAlgorithm: Number(parts[0]) || 0,
          flags: Number(parts[1]) || 0,
          iterations: Number(parts[2]) || 0,
          salt: parts[3] || "-",
        };
      });
      return { host, nsec3param };
    },
  },
  "/pay/openpgpkey": {
    summary: "DNS OPENPGPKEY records",
    description: "OPENPGPKEY OpenPGP public-key records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", openpgpkey: [{ key: "mQINBF..." }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const openpgpkey = (await doh(host, "OPENPGPKEY")).map((s) => {
        const key = String(s).replace(/\s+/g, "");
        return { key: key.slice(0, 4000), bytes: key.length };
      });
      return { host, openpgpkey };
    },
  },
  "/pay/dname": {
    summary: "DNS DNAME records",
    description: "DNAME delegation-name aliases for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", dname: ["target.example.net"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const dname = (await doh(host, "DNAME")).map((s) => String(s).replace(/\.$/, ""));
      return { host, dname };
    },
  },
  "/pay/did": {
    summary: "DID document",
    description: "Fetch /.well-known/did.json for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/did.json",
      status: 200,
      id: "did:web:example.com",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/did.json`);
      let doc = {};
      try {
        doc = JSON.parse(fetched.text);
      } catch {
        doc = {};
      }
      const verificationMethod = Array.isArray(doc.verificationMethod)
        ? doc.verificationMethod.slice(0, 8).map((m) => ({
            id: m?.id || "",
            type: m?.type || "",
            controller: m?.controller || "",
          }))
        : [];
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        id: doc.id || "",
        alsoKnownAs: Array.isArray(doc.alsoKnownAs) ? doc.alsoKnownAs.slice(0, 16) : [],
        verificationMethod,
      };
    },
  },
  "/pay/nostr": {
    summary: "Nostr NIP-05 names",
    description: "Fetch /.well-known/nostr.json NIP-05 names for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/nostr.json",
      status: 200,
      names: { alice: "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/nostr.json`);
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      const rawNames = body && typeof body.names === "object" && body.names ? body.names : {};
      const names = {};
      for (const [name, pubkey] of Object.entries(rawNames).slice(0, 32)) {
        names[String(name)] = String(pubkey);
      }
      const relays = body && typeof body.relays === "object" && body.relays ? Object.keys(body.relays).slice(0, 16) : [];
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        names,
        nameCount: Object.keys(rawNames).length,
        relays,
      };
    },
  },
  "/pay/blocksize": {
    summary: "Base latest block size",
    description: "Size in bytes of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, size: 12345 },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        size: Number(hexToBigInt(block?.size)),
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/zonemd": {
    summary: "DNSSEC ZONEMD records",
    description: "ZONEMD zone message digest records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      zonemd: [{ serial: 2026010100, scheme: 1, hashAlgorithm: 1, digest: "febe3d4c" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const zonemd = (await doh(host, "ZONEMD")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4) return { raw: String(s) };
        return {
          serial: Number(parts[0]) || 0,
          scheme: Number(parts[1]) || 0,
          hashAlgorithm: Number(parts[2]) || 0,
          digest: parts.slice(3).join("").slice(0, 4000),
        };
      });
      return { host, zonemd };
    },
  },
  "/pay/hinfo": {
    summary: "DNS HINFO records",
    description: "HINFO CPU and OS records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", hinfo: [{ cpu: "INTEL-386", os: "Linux" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const hinfo = (await doh(host, "HINFO")).map((s) => {
        const raw = String(s).trim();
        const quoted = [...raw.matchAll(/"((?:\\.|[^"\\])*)"/g)].map((m) => m[1]);
        if (quoted.length >= 2) return { cpu: quoted[0], os: quoted[1] };
        const parts = raw.split(/\s+/);
        if (parts.length >= 2) return { cpu: parts[0], os: parts.slice(1).join(" ") };
        return { raw };
      });
      return { host, hinfo };
    },
  },
  "/pay/rp": {
    summary: "DNS RP records",
    description: "RP responsible-person mailbox and TXT domain for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", rp: [{ mailbox: "admin.example.com", txt: "more.example.com" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const rp = (await doh(host, "RP")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 2) return { raw: String(s) };
        return {
          mailbox: String(parts[0]).replace(/\.$/, ""),
          txt: String(parts[1]).replace(/\.$/, ""),
        };
      });
      return { host, rp };
    },
  },
  "/pay/jwks": {
    summary: "JWKS document",
    description: "Fetch /.well-known/jwks.json for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/jwks.json",
      status: 200,
      keys: [{ kid: "key-1", kty: "RSA", use: "sig", alg: "RS256" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/jwks.json`);
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      const rawKeys = Array.isArray(body.keys) ? body.keys : [];
      const keys = rawKeys.slice(0, 16).map((k) => ({
        kid: k?.kid || "",
        kty: k?.kty || "",
        use: k?.use || "",
        alg: k?.alg || "",
        crv: k?.crv || "",
        n: typeof k?.n === "string" ? k.n.slice(0, 80) : "",
      }));
      return { host, url: fetched.url, status: fetched.status, keyCount: rawKeys.length, keys };
    },
  },
  "/pay/farcaster": {
    summary: "Farcaster well-known",
    description: "Fetch /.well-known/farcaster.json account association for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/farcaster.json",
      status: 200,
      fid: 1,
      name: "Example",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/farcaster.json`);
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      const assoc = body.accountAssociation && typeof body.accountAssociation === "object" ? body.accountAssociation : {};
      const frame = (body.frame && typeof body.frame === "object" && body.frame) ||
        (body.miniapp && typeof body.miniapp === "object" && body.miniapp) ||
        {};
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        hasAccountAssociation: Boolean(assoc.header || assoc.payload || assoc.signature),
        name: frame.name || "",
        homeUrl: frame.homeUrl || frame.home_url || "",
        iconUrl: frame.iconUrl || frame.icon_url || "",
      };
    },
  },
  "/pay/clientversion": {
    summary: "Base RPC client version",
    description: "web3_clientVersion of the Base JSON-RPC endpoint. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", clientVersion: "reth/v1.0.0" },
    handler: async () => {
      const clientVersion = await rpc(BASE_RPC, "web3_clientVersion", []);
      return { network: "base", clientVersion: String(clientVersion || "") };
    },
  },
  "/pay/csync": {
    summary: "DNS CSYNC records",
    description: "Child-to-parent synchronization (CSYNC) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", csync: [{ serial: 2026010101, flags: 0, types: ["A", "NS", "AAAA"] }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const csync = (await doh(host, "CSYNC")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 3) return { raw: String(s) };
        return {
          serial: Number(parts[0]) || 0,
          flags: Number(parts[1]) || 0,
          types: parts.slice(2).filter((t) => /^[A-Z][A-Z0-9]*$/.test(t)),
        };
      });
      return { host, csync };
    },
  },
  "/pay/kx": {
    summary: "DNS KX records",
    description: "Key exchanger (KX) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", kx: [{ preference: 10, exchanger: "kx.example.com" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const kx = (await doh(host, "KX")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 2) return { raw: String(s) };
        return {
          preference: Number(parts[0]) || 0,
          exchanger: String(parts[1]).replace(/\.$/, ""),
        };
      });
      return { host, kx };
    },
  },
  "/pay/dhcid": {
    summary: "DNS DHCID records",
    description: "DHCP identifier (DHCID) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", dhcid: [{ identifierType: 0, digestType: 1, digest: "aabbcc" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const dhcid = (await doh(host, "DHCID")).map((s) => {
        const raw = String(s).trim().replace(/["\s]/g, "");
        const hex = raw.replace(/^\\#\d+/, "").replace(/[^0-9a-fA-F]/g, "");
        if (hex.length < 6) return { raw: String(s) };
        return {
          identifierType: Number.parseInt(hex.slice(0, 4), 16) || 0,
          digestType: Number.parseInt(hex.slice(4, 6), 16) || 0,
          digest: hex.slice(6, 4006).toLowerCase(),
        };
      });
      return { host, dhcid };
    },
  },
  "/pay/oauth": {
    summary: "OAuth Authorization Server Metadata",
    description: "Fetch /.well-known/oauth-authorization-server for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/oauth-authorization-server",
      status: 200,
      issuer: "https://example.com",
      authorization_endpoint: "https://example.com/authorize",
      token_endpoint: "https://example.com/token",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/oauth-authorization-server`);
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        issuer: body.issuer || "",
        authorization_endpoint: body.authorization_endpoint || "",
        token_endpoint: body.token_endpoint || "",
        jwks_uri: body.jwks_uri || "",
        registration_endpoint: body.registration_endpoint || "",
        grant_types_supported: Array.isArray(body.grant_types_supported)
          ? body.grant_types_supported.map(String).slice(0, 16)
          : [],
      };
    },
  },
  "/pay/gpc": {
    summary: "Global Privacy Control",
    description: "Fetch /.well-known/gpc.json Global Privacy Control signal for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/gpc.json",
      status: 200,
      gpc: true,
      lastUpdate: "2026-01-01",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/gpc.json`);
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        gpc: body.gpc === true,
        lastUpdate: body.lastUpdate || body.last_update || "",
      };
    },
  },
  "/pay/syncing": {
    summary: "Base RPC sync status",
    description: "eth_syncing status of the Base JSON-RPC endpoint. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", syncing: false },
    handler: async () => {
      const result = await rpc(BASE_RPC, "eth_syncing", []);
      if (!result) return { network: "base", syncing: false };
      return {
        network: "base",
        syncing: true,
        startingBlock: Number(hexToBigInt(result.startingBlock)),
        currentBlock: Number(hexToBigInt(result.currentBlock)),
        highestBlock: Number(hexToBigInt(result.highestBlock)),
      };
    },
  },
  "/pay/hip": {
    summary: "DNS HIP records",
    description: "Host Identity Protocol (HIP) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      hip: [
        {
          algorithm: 2,
          hit: "200100107b1a74df043576d234aa6ea7",
          publicKey: "AwEAAbdw",
          rendezvous: ["rendezvous.example.com"],
        },
      ],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const hip = (await doh(host, "HIP")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 3 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          algorithm: Number(parts[0]) || 0,
          hit: String(parts[1]).toLowerCase().replace(/^0x/, ""),
          publicKey: parts[2],
          rendezvous: parts.slice(3).map((n) => String(n).replace(/\.$/, "")),
        };
      });
      return { host, hip };
    },
  },
  "/pay/ipseckey": {
    summary: "DNS IPSECKEY records",
    description: "IPsec public key (IPSECKEY) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      ipseckey: [
        {
          precedence: 10,
          gatewayType: 3,
          algorithm: 2,
          gateway: "mygateway.example.com",
          publicKey: "AQNRU3mG7TVTO2BkR47usowsrIpweFA=",
        },
      ],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const ipseckey = (await doh(host, "IPSECKEY")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 5 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          precedence: Number(parts[0]) || 0,
          gatewayType: Number(parts[1]) || 0,
          algorithm: Number(parts[2]) || 0,
          gateway: String(parts[3]).replace(/\.$/, ""),
          publicKey: parts.slice(4).join(""),
        };
      });
      return { host, ipseckey };
    },
  },
  "/pay/eui64": {
    summary: "DNS EUI64 records",
    description: "64-bit Extended Unique Identifier (EUI64) mapping records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", eui64: [{ identifier: "00-00-5E-EF-10-00-00-2A" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const eui64 = (await doh(host, "EUI64")).map((s) => {
        const hex = String(s).trim().replace(/[^0-9a-fA-F]/g, "").toUpperCase();
        if (hex.length !== 16) return { raw: String(s) };
        return {
          identifier: hex.match(/.{2}/g).join("-"),
        };
      });
      return { host, eui64 };
    },
  },
  "/pay/matrix": {
    summary: "Matrix server delegation",
    description: "Fetch /.well-known/matrix/server federation delegation for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/matrix/server",
      status: 200,
      server: "matrix.example.com:443",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/matrix/server`);
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        server: body["m.server"] || "",
      };
    },
  },
  "/pay/passkey": {
    summary: "Passkey endpoints",
    description: "Fetch /.well-known/passkey-endpoints enroll and manage URLs for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/passkey-endpoints",
      status: 200,
      enroll: "https://example.com/account/manage/passkeys/create",
      manage: "https://example.com/account/manage/passkeys",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/passkey-endpoints`);
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        enroll: body.enroll || "",
        manage: body.manage || "",
        prfUsageDetails: body.prfUsageDetails || "",
      };
    },
  },
  "/pay/peercount": {
    summary: "Base RPC peer count",
    description: "net_peerCount of the Base JSON-RPC endpoint. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", peerCount: 50, peerCountHex: "0x32" },
    handler: async () => {
      const hex = await rpc(BASE_RPC, "net_peerCount", []);
      const n = hexToBigInt(hex);
      return {
        network: "base",
        peerCount: Number(n),
        peerCountHex: "0x" + n.toString(16),
      };
    },
  },
  "/pay/eui48": {
    summary: "DNS EUI48 records",
    description: "48-bit Extended Unique Identifier (EUI48) mapping records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", eui48: [{ identifier: "00-00-5E-00-53-2F" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const eui48 = (await doh(host, "EUI48")).map((s) => {
        const hex = String(s).trim().replace(/[^0-9a-fA-F]/g, "").toUpperCase();
        if (hex.length !== 12) return { raw: String(s) };
        return { identifier: hex.match(/.{2}/g).join("-") };
      });
      return { host, eui48 };
    },
  },
  "/pay/nid": {
    summary: "DNS NID records",
    description: "ILNP Node Identifier (NID) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      nid: [{ preference: 10, algorithm: 1, nodeId: "0002000102030405" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nid = (await doh(host, "NID")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 3 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          preference: Number(parts[0]) || 0,
          algorithm: Number(parts[1]) || 0,
          nodeId: String(parts[2]).toLowerCase().replace(/^0x/, "").replace(/:/g, ""),
        };
      });
      return { host, nid };
    },
  },
  "/pay/webauthn": {
    summary: "WebAuthn related origins",
    description: "Fetch /.well-known/webauthn related origins for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/webauthn",
      status: 200,
      origins: ["https://login.example.com"],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/webauthn`);
      let body = {};
      try {
        body = JSON.parse(fetched.text);
      } catch {
        body = {};
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        origins: Array.isArray(body.origins) ? body.origins.slice(0, 64) : [],
      };
    },
  },
  "/pay/caldav": {
    summary: "CalDAV service discovery",
    description: "Resolve /.well-known/caldav Location for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/caldav",
      status: 301,
      location: "https://caldav.example.com/",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/caldav`, { redirect: "manual" });
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        location: fetched.headers.get("location") || "",
      };
    },
  },
  "/pay/carddav": {
    summary: "CardDAV service discovery",
    description: "Resolve /.well-known/carddav Location for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/carddav",
      status: 301,
      location: "https://carddav.example.com/",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/carddav`, { redirect: "manual" });
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        location: fetched.headers.get("location") || "",
      };
    },
  },
  "/pay/listening": {
    summary: "Base RPC listening",
    description: "net_listening of the Base JSON-RPC endpoint. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", listening: true },
    handler: async () => {
      const listening = await rpc(BASE_RPC, "net_listening", []);
      return { network: "base", listening: Boolean(listening) };
    },
  },
  "/pay/l32": {
    summary: "DNS L32 records",
    description: "ILNP 32-bit Locator (L32) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", l32: [{ preference: 10, locator: "192.0.2.1" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const l32 = (await doh(host, "L32")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 2 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return { preference: Number(parts[0]) || 0, locator: parts[1] };
      });
      return { host, l32 };
    },
  },
  "/pay/l64": {
    summary: "DNS L64 records",
    description: "ILNP 64-bit Locator (L64) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", l64: [{ preference: 10, locator: "2001:0db8:1140:1000" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const l64 = (await doh(host, "L64")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 2 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          preference: Number(parts[0]) || 0,
          locator: String(parts[1]).toLowerCase().replace(/^0x/, ""),
        };
      });
      return { host, l64 };
    },
  },
  "/pay/lp": {
    summary: "DNS LP records",
    description: "ILNP Locator Pointer (LP) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", lp: [{ preference: 10, pointer: "l64.example.com" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const lp = (await doh(host, "LP")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 2 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          preference: Number(parts[0]) || 0,
          pointer: String(parts[1]).replace(/\.$/, ""),
        };
      });
      return { host, lp };
    },
  },
  "/pay/opensearch": {
    summary: "OpenSearch description",
    description: "Discover OpenSearch description documents from a public page. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      href: "https://example.com/opensearch.xml",
      title: "Example Search",
      type: "application/opensearchdescription+xml",
    },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const re = /<link\b([^>]+)>/gi;
      let href = "";
      let title = "";
      let type = "";
      let m;
      while ((m = re.exec(text))) {
        const tag = m[1];
        const rel = (tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "";
        const t = (tag.match(/\btype=["']([^"']+)["']/i) || [])[1] || "";
        const h = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        if (/search/i.test(rel) && /opensearch/i.test(t) && h) {
          href = absUrl(url, h);
          title = (tag.match(/\btitle=["']([^"']+)["']/i) || [])[1] || "";
          type = t;
          break;
        }
      }
      return { url, href, title, type };
    },
  },
  "/pay/keybase": {
    summary: "Keybase site proof",
    description: "Fetch /.well-known/keybase.txt from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/keybase.txt",
      status: 200,
      text: "==================================================================",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/keybase.txt`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/blobgasused": {
    summary: "Base latest blob gas used",
    description: "blobGasUsed and excessBlobGas of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, blobGasUsed: "131072", excessBlobGas: "0" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        blobGasUsed: hexToBigInt(block?.blobGasUsed).toString(),
        excessBlobGas: hexToBigInt(block?.excessBlobGas).toString(),
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/afsdb": {
    summary: "DNS AFSDB records",
    description: "AFS Database (AFSDB) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", afsdb: [{ preference: 1, subtype: 1, hostname: "afsdb.example.com" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const afsdb = (await doh(host, "AFSDB")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 3 || !/^\d+$/.test(parts[0]) || !/^\d+$/.test(parts[1])) return { raw: String(s) };
        return {
          preference: Number(parts[0]) || 0,
          subtype: Number(parts[1]) || 0,
          hostname: String(parts[2]).replace(/\.$/, ""),
        };
      });
      return { host, afsdb };
    },
  },
  "/pay/dlv": {
    summary: "DNS DLV records",
    description: "DNSSEC Lookaside Validation (DLV) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", dlv: [{ keyTag: 12345, algorithm: 8, digestType: 2, digest: "abcd" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const dlv = (await doh(host, "DLV")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          keyTag: Number(parts[0]) || 0,
          algorithm: Number(parts[1]) || 0,
          digestType: Number(parts[2]) || 0,
          digest: String(parts.slice(3).join("")).replace(/\s+/g, "").toLowerCase(),
        };
      });
      return { host, dlv };
    },
  },
  "/pay/amtrelay": {
    summary: "DNS AMTRELAY records",
    description: "Automatic Multicast Tunneling Relay (AMTRELAY) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", amtrelay: [{ precedence: 10, discoveryOptional: false, type: 2, relay: "203.0.113.15" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const amtrelay = (await doh(host, "AMTRELAY")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          precedence: Number(parts[0]) || 0,
          discoveryOptional: parts[1] === "1" || /^true$/i.test(parts[1]),
          type: Number(parts[2]) || 0,
          relay: String(parts.slice(3).join(" ")).replace(/\.$/, ""),
        };
      });
      return { host, amtrelay };
    },
  },
  "/pay/stellar": {
    summary: "Stellar TOML",
    description: "Fetch /.well-known/stellar.toml from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/stellar.toml",
      status: 200,
      text: "NETWORK_PASSPHRASE = \"Public Global Stellar Network ; September 2015\"",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/stellar.toml`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/tdmrep": {
    summary: "TDM Reservation Protocol",
    description: "Fetch /.well-known/tdmrep.json text-and-data mining reservation from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/tdmrep.json",
      status: 200,
      json: { tdm: [{ location: "/", policy: "must-consult-rights" }] },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/tdmrep.json`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/code": {
    summary: "Base contract bytecode",
    description: "eth_getCode size and keccak-256 for an address on Base. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "address", required: true }],
    queryExample: { address: USDC },
    example: { network: "base", address: USDC, bytes: 12, keccak256: "0x", contract: true },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      const code = await rpc(BASE_RPC, "eth_getCode", [address, "latest"]);
      const hex = String(code || "0x").replace(/^0x/, "");
      const bytes = hex.length / 2;
      return {
        network: "base",
        address,
        bytes,
        keccak256: bytes ? "0x" + keccak256Hex(Buffer.from(hex, "hex")) : "0x",
        contract: bytes > 0,
      };
    },
  },
  "/pay/apl": {
    summary: "DNS APL records",
    description: "Address Prefix List (APL) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", apl: [{ family: 1, negation: false, prefix: 24, address: "192.0.2.0" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const apl = (await doh(host, "APL")).map((s) => {
        const raw = String(s).trim();
        const m = raw.match(/^(!?)(\d+):(\S+)$/);
        if (!m) return { raw };
        const [address, prefix] = m[3].split("/");
        return {
          family: Number(m[2]) || 0,
          negation: m[1] === "!",
          prefix: Number(prefix) || 0,
          address: address || "",
        };
      });
      return { host, apl };
    },
  },
  "/pay/ta": {
    summary: "DNS TA records",
    description: "DNSSEC Trust Anchor (TA) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", ta: [{ keyTag: 12345, algorithm: 13, digestType: 2, digest: "abcd" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const ta = (await doh(host, "TA")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          keyTag: Number(parts[0]) || 0,
          algorithm: Number(parts[1]) || 0,
          digestType: Number(parts[2]) || 0,
          digest: parts.slice(3).join(""),
        };
      });
      return { host, ta };
    },
  },
  "/pay/doa": {
    summary: "DNS DOA records",
    description: "Digital Object Architecture (DOA) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      doa: [{ enterprise: 0, type: 1, location: 1, mediaType: "text/plain", data: "handle" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const doa = (await doh(host, "DOA")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 5 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          enterprise: Number(parts[0]) || 0,
          type: Number(parts[1]) || 0,
          location: Number(parts[2]) || 0,
          mediaType: String(parts[3] || "").replace(/^"|"$/g, ""),
          data: parts.slice(4).join(" "),
        };
      });
      return { host, doa };
    },
  },
  "/pay/mcp": {
    summary: "MCP well-known",
    description: "Fetch /.well-known/mcp.json Model Context Protocol discovery from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/mcp.json",
      status: 200,
      json: { mcpServers: [{ url: "https://example.com/mcp" }] },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/mcp.json`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/protected": {
    summary: "OAuth protected resource",
    description: "Fetch RFC 9728 /.well-known/oauth-protected-resource metadata from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/oauth-protected-resource",
      status: 200,
      json: { resource: "https://example.com/", authorization_servers: ["https://auth.example.com"] },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/oauth-protected-resource`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/stateroot": {
    summary: "Base latest state root",
    description: "stateRoot of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, stateRoot: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        stateRoot: block?.stateRoot || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/wallet": {
    summary: "DNS WALLET records",
    description: "Cryptocurrency WALLET records (currency + address) for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", wallet: [{ currency: "ETH", address: "0xdD1729943bf7C408456cef52886ad12B05B57dC2" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const wallet = (await doh(host, "WALLET")).map((s) => {
        const raw = String(s).trim();
        const quoted = [...raw.matchAll(/"([^"]*)"/g)].map((m) => m[1]);
        if (quoted.length >= 2) return { currency: quoted[0], address: quoted[1] };
        const parts = raw.split(/\s+/);
        if (parts.length >= 2) {
          return {
            currency: parts[0].replace(/^"|"$/g, ""),
            address: parts.slice(1).join(" ").replace(/^"|"$/g, ""),
          };
        }
        return { raw };
      });
      return { host, wallet };
    },
  },
  "/pay/dsync": {
    summary: "DNS DSYNC records",
    description: "Delegation synchronization (DSYNC) endpoint records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", dsync: [{ rrtype: "CDS", scheme: 1, port: 53, target: "ds.example.net" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const dsync = (await doh(host, "DSYNC")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4) return { raw: String(s) };
        return {
          rrtype: parts[0],
          scheme: Number(parts[1]) || 0,
          port: Number(parts[2]) || 0,
          target: parts.slice(3).join(" ").replace(/\.$/, ""),
        };
      });
      return { host, dsync };
    },
  },
  "/pay/resinfo": {
    summary: "DNS RESINFO records",
    description: "Resolver information (RESINFO) key=value records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", resinfo: [{ qnamemin: "true", exterr: "15 16 17" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const resinfo = (await doh(host, "RESINFO")).map((s) => {
        const raw = String(s).trim().replace(/^"|"$/g, "");
        const pairs = {};
        for (const tok of raw.split(/\s+/)) {
          const i = tok.indexOf("=");
          if (i > 0) pairs[tok.slice(0, i)] = tok.slice(i + 1).replace(/^"|"$/g, "");
        }
        return Object.keys(pairs).length ? pairs : { raw: String(s) };
      });
      return { host, resinfo };
    },
  },
  "/pay/agent-card": {
    summary: "A2A agent card",
    description: "Fetch /.well-known/agent-card.json Agent-to-Agent discovery from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/agent-card.json",
      status: 200,
      json: { name: "Example Agent", url: "https://example.com/a2a" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/agent-card.json`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/trust": {
    summary: "trust.txt",
    description: "Fetch /.well-known/trust.txt publisher control file from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/trust.txt",
      status: 200,
      text: "member=https://example.com",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/trust.txt`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/receiptsroot": {
    summary: "Base latest receipts root",
    description: "receiptsRoot of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, receiptsRoot: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        receiptsRoot: block?.receiptsRoot || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/key": {
    summary: "DNS KEY records",
    description: "RFC 2535 public KEY records (flags, protocol, algorithm, key) for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", key: [{ flags: 256, protocol: 3, algorithm: 13, publicKey: "abcd" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const key = (await doh(host, "KEY")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          flags: Number(parts[0]) || 0,
          protocol: Number(parts[1]) || 0,
          algorithm: Number(parts[2]) || 0,
          publicKey: parts.slice(3).join(""),
        };
      });
      return { host, key };
    },
  },
  "/pay/sig": {
    summary: "DNS SIG records",
    description: "RFC 2535 SIG (signature) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      sig: [{
        typeCovered: "A",
        algorithm: 13,
        labels: 2,
        originalTtl: 3600,
        expiration: 0,
        inception: 0,
        keyTag: 12345,
        signer: "example.com",
        signature: "abcd",
      }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const sig = (await doh(host, "SIG")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 9) return { raw: String(s) };
        return {
          typeCovered: parts[0],
          algorithm: Number(parts[1]) || 0,
          labels: Number(parts[2]) || 0,
          originalTtl: Number(parts[3]) || 0,
          expiration: Number(parts[4]) || 0,
          inception: Number(parts[5]) || 0,
          keyTag: Number(parts[6]) || 0,
          signer: String(parts[7] || "").replace(/\.$/, ""),
          signature: parts.slice(8).join(""),
        };
      });
      return { host, sig };
    },
  },
  "/pay/nxt": {
    summary: "DNS NXT records",
    description: "Next-domain (NXT) type-bitmap records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", nxt: [{ next: "www.example.com", types: ["A", "NS", "SOA"] }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nxt = (await doh(host, "NXT")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (!parts[0]) return { raw: String(s) };
        return {
          next: parts[0].replace(/\.$/, ""),
          types: parts.slice(1).filter(Boolean),
        };
      });
      return { host, nxt };
    },
  },
  "/pay/ai-plugin": {
    summary: "OpenAI plugin manifest",
    description: "Fetch /.well-known/ai-plugin.json ChatGPT/OpenAI plugin manifest from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/ai-plugin.json",
      status: 200,
      json: { schema_version: "v1", name_for_human: "Example", api: { url: "https://example.com/openapi.json" } },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/ai-plugin.json`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/related": {
    summary: "Related Website Sets",
    description: "Fetch /.well-known/related-website-set.json first-party set membership from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/related-website-set.json",
      status: 200,
      json: { primary: "https://example.com", associatedSites: ["https://shop.example.com"] },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/related-website-set.json`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/txroot": {
    summary: "Base latest transactions root",
    description: "transactionsRoot of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, transactionsRoot: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        transactionsRoot: block?.transactionsRoot || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/tlsrpt": {
    summary: "DNS TLSRPT records",
    description: "SMTP TLS reporting (TLSRPT) policy at _smtp._tls for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      name: "_smtp._tls.example.com",
      tlsrpt: [{ version: "TLSRPTv1", rua: "mailto:tlsrpt@example.com", raw: "v=TLSRPTv1; rua=mailto:tlsrpt@example.com" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const name = `_smtp._tls.${host}`;
      const tlsrpt = (await doh(name, "TLSRPT")).map((s) => {
        const raw = String(s).trim().replace(/^"|"$/g, "").replace(/" "/g, "");
        const pairs = {};
        for (const tok of raw.split(";")) {
          const part = tok.trim();
          const i = part.indexOf("=");
          if (i > 0) pairs[part.slice(0, i).trim().toLowerCase()] = part.slice(i + 1).trim();
        }
        if (pairs.v || pairs.rua) {
          return { version: String(pairs.v || "").replace(/^v=/i, ""), rua: pairs.rua || "", raw };
        }
        return { raw };
      });
      return { host, name, tlsrpt };
    },
  },
  "/pay/wks": {
    summary: "DNS WKS records",
    description: "Well-known service (WKS) protocol/port bitmaps for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", wks: [{ address: "93.184.216.34", protocol: 6, bitmap: "0 0 0 0" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const wks = (await doh(host, "WKS")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 2) return { raw: String(s) };
        const address = parts[0];
        const protocol = /^\d+$/.test(parts[1]) ? Number(parts[1]) : parts[1];
        return { address, protocol, bitmap: parts.slice(2).join(" ") };
      });
      return { host, wks };
    },
  },
  "/pay/rt": {
    summary: "DNS RT records",
    description: "Route-through (RT) preference and intermediate-host records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", rt: [{ preference: 10, intermediate: "relay.example.net" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const rt = (await doh(host, "RT")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 2 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          preference: Number(parts[0]) || 0,
          intermediate: parts.slice(1).join(" ").replace(/\.$/, ""),
        };
      });
      return { host, rt };
    },
  },
  "/pay/dnt": {
    summary: "DNT policy",
    description: "Fetch /.well-known/dnt-policy.txt Do Not Track policy from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/dnt-policy.txt",
      status: 200,
      text: "DNT is honored.",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/dnt-policy.txt`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/did-config": {
    summary: "DID configuration",
    description: "Fetch /.well-known/did-configuration.json well-known DID configuration from a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/did-configuration.json",
      status: 200,
      json: { "@context": "https://identity.foundation/.well-known/did-configuration/v1", linked_dids: [] },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/did-configuration.json`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/logsbloom": {
    summary: "Base latest logs bloom",
    description: "logsBloom of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, logsBloom: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        logsBloom: block?.logsBloom || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/dnscert": {
    summary: "DNS CERT records",
    description: "DNS CERT (RFC 4398) certificate records for a public hostname. Distinct from TLS /pay/cert. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      cert: [{ certType: 1, keyTag: 12345, algorithm: 8, certificate: "MIIB" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const cert = (await doh(host, "CERT")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4) return { raw: String(s) };
        const certType = /^\d+$/.test(parts[0]) ? Number(parts[0]) : parts[0];
        const keyTag = /^\d+$/.test(parts[1]) ? Number(parts[1]) : parts[1];
        const algorithm = /^\d+$/.test(parts[2]) ? Number(parts[2]) : parts[2];
        return { certType, keyTag, algorithm, certificate: parts.slice(3).join("") };
      });
      return { host, cert };
    },
  },
  "/pay/avc": {
    summary: "DNS AVC records",
    description: "Application Visibility and Control (AVC) records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", avc: [{ app: "example", value: "enabled" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const avc = (await doh(host, "AVC")).map((s) => {
        const raw = String(s).trim();
        const tokens = [...raw.matchAll(/"([^"]*)"|(\S+)/g)].map((m) => m[1] ?? m[2]);
        if (tokens.length >= 2) return { app: tokens[0], value: tokens.slice(1).join(" "), raw };
        return { raw };
      });
      return { host, avc };
    },
  },
  "/pay/nsap": {
    summary: "DNS NSAP records",
    description: "NSAP (Network Service Access Point) address records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", nsap: ["47.0005.80.005a00.0000.0001.e133.ffffff000161.00"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nsap = (await doh(host, "NSAP")).map((s) => String(s).trim().replace(/\.$/, ""));
      return { host, nsap };
    },
  },
  "/pay/change-password": {
    summary: "Change-password discovery",
    description: "Resolve /.well-known/change-password Location for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/change-password",
      status: 302,
      location: "https://example.com/account/password",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/change-password`, { redirect: "manual" });
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        location: fetched.headers.get("location") || "",
      };
    },
  },
  "/pay/web-identity": {
    summary: "FedCM web identity",
    description: "Fetch /.well-known/web-identity FedCM IdP discovery for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/web-identity",
      status: 200,
      json: { provider_urls: ["https://example.com/fedcm.json"] },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/web-identity`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/extradata": {
    summary: "Base latest extraData",
    description: "extraData of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, extraData: "0x" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        extraData: block?.extraData || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/gpos": {
    summary: "DNS GPOS records",
    description: "GPOS (RFC 1712) geographical position records for a public hostname. Distinct from LOC /pay/loc. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", gpos: [{ longitude: "-122.4194", latitude: "37.7749", altitude: "16.0" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const gpos = (await doh(host, "GPOS")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 3) return { raw: String(s) };
        return { longitude: parts[0], latitude: parts[1], altitude: parts[2], raw: String(s) };
      });
      return { host, gpos };
    },
  },
  "/pay/px": {
    summary: "DNS PX records",
    description: "PX (RFC 2163) X.400 to RFC 822 mapping records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", px: [{ preference: 10, map822: "example.com", mapx400: "PRMD.example.ADMD.C.US." }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const px = (await doh(host, "PX")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 3) return { raw: String(s) };
        const preference = /^\d+$/.test(parts[0]) ? Number(parts[0]) : parts[0];
        return {
          preference,
          map822: parts[1].replace(/\.$/, ""),
          mapx400: parts.slice(2).join(" ").replace(/\.$/, ""),
        };
      });
      return { host, px };
    },
  },
  "/pay/minfo": {
    summary: "DNS MINFO records",
    description: "MINFO mailbox information records (responsible mailbox + error mailbox) for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", minfo: [{ rmailbx: "admin.example.com", emailbx: "errors.example.com" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const minfo = (await doh(host, "MINFO")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 2) return { raw: String(s) };
        return {
          rmailbx: parts[0].replace(/\.$/, ""),
          emailbx: parts[1].replace(/\.$/, ""),
        };
      });
      return { host, minfo };
    },
  },
  "/pay/webmention": {
    summary: "Webmention discovery",
    description: "Fetch /.well-known/webmention endpoint discovery for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/webmention",
      status: 200,
      location: "https://example.com/webmention",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/webmention`, { redirect: "manual" });
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        location: fetched.headers.get("location") || "",
        link: fetched.headers.get("link") || "",
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/oid4vci": {
    summary: "OpenID credential issuer",
    description: "Fetch /.well-known/openid-credential-issuer OID4VCI metadata for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/openid-credential-issuer",
      status: 200,
      json: { credential_issuer: "https://example.com", credential_endpoint: "https://example.com/credential" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/openid-credential-issuer`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/withdrawals": {
    summary: "Base latest withdrawals root",
    description: "withdrawalsRoot of the latest Base block. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, withdrawalsRoot: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        withdrawalsRoot: block?.withdrawalsRoot || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/x25": {
    summary: "DNS X25 records",
    description: "X25 (RFC 1183) PSDN address records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", x25: ["311061700956"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const x25 = (await doh(host, "X25")).map((s) => String(s).trim().replace(/^"|"$/g, ""));
      return { host, x25 };
    },
  },
  "/pay/isdn": {
    summary: "DNS ISDN records",
    description: "ISDN (RFC 1183) ISDN address records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", isdn: [{ address: "150862028003217", sa: "004" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const isdn = (await doh(host, "ISDN")).map((s) => {
        const parts = String(s).trim().replace(/"/g, "").split(/\s+/).filter(Boolean);
        if (!parts.length) return { raw: String(s) };
        return { address: parts[0], sa: parts[1] || "" };
      });
      return { host, isdn };
    },
  },
  "/pay/ninfo": {
    summary: "DNS NINFO records",
    description: "NINFO zone status information records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", ninfo: ["status=ok"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const ninfo = (await doh(host, "NINFO")).map((s) => String(s).trim().replace(/^"|"$/g, ""));
      return { host, ninfo };
    },
  },
  "/pay/jmap": {
    summary: "JMAP session discovery",
    description: "Fetch /.well-known/jmap session resource for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/jmap",
      status: 200,
      json: { apiUrl: "https://jmap.example.com/api", username: "user@example.com" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/jmap`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        location: fetched.headers.get("location") || "",
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/csaf": {
    summary: "CSAF provider metadata",
    description: "Fetch /.well-known/csaf/provider-metadata.json for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/csaf/provider-metadata.json",
      status: 200,
      json: { canonical_url: "https://example.com/.well-known/csaf/provider-metadata.json" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/csaf/provider-metadata.json`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/mixhash": {
    summary: "Base latest mixHash",
    description: "mixHash (prevRandao) of the latest Base block. Distinct from content /pay/hash and block /pay/blockhash. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, mixHash: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        mixHash: block?.mixHash || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/eid": {
    summary: "DNS EID records",
    description: "EID (RFC 1706 NIMROD) endpoint identifier records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", eid: ["0x0123456789abcdef"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const eid = (await doh(host, "EID")).map((s) => String(s).trim().replace(/^"|"$/g, ""));
      return { host, eid };
    },
  },
  "/pay/nimloc": {
    summary: "DNS NIMLOC records",
    description: "NIMLOC (RFC 1706 NIMROD) locator records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", nimloc: ["0xfeedface"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nimloc = (await doh(host, "NIMLOC")).map((s) => String(s).trim().replace(/^"|"$/g, ""));
      return { host, nimloc };
    },
  },
  "/pay/atma": {
    summary: "DNS ATMA records",
    description: "ATMA ATM address records for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", atma: [{ format: "e164", address: "390117123456789" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const atma = (await doh(host, "ATMA")).map((s) => {
        const parts = String(s).trim().replace(/"/g, "").split(/\s+/).filter(Boolean);
        if (!parts.length) return { raw: String(s) };
        if (parts.length === 1) return { address: parts[0] };
        return { format: parts[0], address: parts.slice(1).join(" ") };
      });
      return { host, atma };
    },
  },
  "/pay/core": {
    summary: "CoRE link format discovery",
    description: "Fetch /.well-known/core CoRE Link Format (RFC 6690) for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/core",
      status: 200,
      text: '</sensors/temp>;rt="temperature-c";if="sensor"',
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/core`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        contentType: fetched.headers.get("content-type") || "",
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/uma": {
    summary: "UMA 2.0 configuration",
    description: "Fetch /.well-known/uma2-configuration User-Managed Access metadata for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/uma2-configuration",
      status: 200,
      json: { issuer: "https://example.com", permission_endpoint: "https://example.com/perm" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/uma2-configuration`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/uncles": {
    summary: "Base latest sha3Uncles",
    description: "sha3Uncles of the latest Base block. Distinct from content /pay/hash and block /pay/blockhash. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, sha3Uncles: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        sha3Uncles: block?.sha3Uncles || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
};

function paymentRequired(routePath, route) {
  const body = {
    x402Version: 2,
    error: "Payment required",
    resource: {
      url: `${ORIGIN}${routePath}`,
      description: route.description,
      mimeType: "application/json",
      serviceName: "CashSprint Fetch",
      tags: TAGS,
    },
    accepts: [
      {
        scheme: "exact",
        network: NETWORK,
        amount: usdToAtomic(route.price),
        asset: USDC,
        payTo: PAY_TO,
        maxTimeoutSeconds: 300,
        extra: { name: "USD Coin", version: "2" },
      },
    ],
    extensions: {
      bazaar: {
        info: {
          input: { type: "http", method: "GET", queryParams: route.queryExample },
          output: { type: "json", example: route.example },
        },
        schema: bazaarSchema,
      },
    },
  };
  return json(402, body, { "cache-control": "no-store", "payment-required": b64json(body) });
}

async function settlePayment(headerValue, route) {
  const paymentPayload = decodePaymentHeader(headerValue);
  if (!paymentPayload) return { ok: false };
  const paymentRequirements = {
    scheme: "exact",
    network: NETWORK,
    amount: usdToAtomic(route.price),
    asset: USDC,
    payTo: PAY_TO,
    maxTimeoutSeconds: 300,
    extra: { name: "USD Coin", version: "2" },
  };
  const body = { x402Version: 2, paymentPayload, paymentRequirements };
  const verify = await fetch(`${FACILITATOR}/verify`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(12_000),
  });
  const verifyJson = await verify.json().catch(() => ({}));
  if (!verify.ok || verifyJson.isValid === false || verifyJson.success === false) return { ok: false };
  const settle = await fetch(`${FACILITATOR}/settle`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  const settleJson = await settle.json().catch(() => ({}));
  if (!settle.ok || settleJson.success === false) return { ok: false };
  return { ok: true, settle: settleJson };
}

function wellKnown() {
  return {
    version: 1,
    ownershipProofs: [PAY_TO],
    resources: Object.keys(ROUTES).map((p) => `${ORIGIN}${p}`),
  };
}

function openApi() {
  const paths = {};
  for (const [path, route] of Object.entries(ROUTES)) {
    paths[path] = {
      get: {
        summary: route.summary,
        description: route.description,
        parameters: route.params.map((p) => ({
          name: p.name,
          in: "query",
          required: !!p.required,
          schema: { type: "string" },
        })),
        security: [{ x402: [] }],
        "x-payment-info": {
          protocols: ["x402"],
          price: { mode: "fixed", currency: "USD", amount: route.price },
          network: "base",
          payTo: PAY_TO,
        },
        responses: {
          200: { description: "Paid response" },
          402: { description: "Payment required" },
        },
      },
    };
  }
  return {
    openapi: "3.1.0",
    info: {
      title: "CashSprint Fetch",
      version: VERSION,
      description: "Pay-per-request fetch, IPFS, DNS, Base and JSON APIs. USDC on Base via x402.",
    },
    "x-discovery": { ownershipProofs: [PAY_TO] },
    paths,
  };
}

export { keccak256Hex, toChecksumAddress, selector, VERSION, PAY_TO };

const server = import.meta.main
  ? Bun.serve({
  port: PORT,
  async fetch(req) {
    const url = new URL(req.url);
    const path = url.pathname.replace(/\/+$/, "") || "/";

    if (req.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET, OPTIONS",
          "access-control-allow-headers": "Content-Type, X-PAYMENT, PAYMENT-SIGNATURE, Payment-Signature",
          "access-control-expose-headers": "Payment-Required, Payment-Response, X-PAYMENT-RESPONSE",
        },
      });
    }

    if (req.method !== "GET") return json(405, { error: "Method not allowed" });

    if (path === "/.well-known/x402") return json(200, wellKnown());
    if (path === "/openapi.json" || path === "/openapi") return json(200, openApi());

    const route = ROUTES[path];
    if (!route) return json(404, { error: "Not found" });

    const payHeader =
      req.headers.get("PAYMENT-SIGNATURE") ||
      req.headers.get("Payment-Signature") ||
      req.headers.get("X-PAYMENT") ||
      req.headers.get("x-payment");

    if (!payHeader) return paymentRequired(path, route);

    try {
      const settled = await settlePayment(payHeader, route);
      if (!settled.ok) return paymentRequired(path, route);
      const data = await route.handler(url.searchParams);
      const headers = {};
      if (settled.settle) headers["payment-response"] = b64json(settled.settle);
      return json(200, data, headers);
    } catch (err) {
      return json(400, { error: err.message || "Request failed" });
    }
  },
})
  : null;

if (server) console.log(`x402-shop ${VERSION} listening on ${server.port}`);
