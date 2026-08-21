const PAY_TO = "0xdD1729943bf7C408456cef52886ad12B05B57dC2";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const NETWORK = "eip155:8453";
const ORIGIN = process.env.ORIGIN || "https://volkov.evgeny.m2.fvds.ru";
const VERSION = "1.67.0";
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
    headers: { "user-agent": "CashSprint-Fetch/1.66" },
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

function relHrefs(html, base, relName) {
  const tags = html.match(/<(?:link|a)\b[^>]*>/gi) || [];
  const relRe = new RegExp(`\\brel=["'][^"']*\\b${relName}\\b[^"']*["']`, "i");
  const out = [];
  for (const tag of tags) {
    if (!relRe.test(tag)) continue;
    const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
    if (!href) continue;
    const abs = absUrl(base, href);
    if (abs) out.push(abs);
  }
  return [...new Set(out)];
}

function relFromLinkHeader(header, base, relName) {
  if (!header) return [];
  const out = [];
  const re = /<([^>]+)>\s*;\s*([^,]*)/g;
  let m;
  const relRe = new RegExp(`(?:^|;)\\s*rel\\s*=\\s*["']?\\b${relName}\\b["']?`, "i");
  while ((m = re.exec(header))) {
    if (!relRe.test(m[2] || "")) continue;
    const abs = absUrl(base, m[1].trim());
    if (abs) out.push(abs);
  }
  return [...new Set(out)];
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
  "/pay/nsap-ptr": {
    summary: "DNS NSAP-PTR records",
    description: "NSAP-PTR (RFC 1348) pointer records for a public hostname. Distinct from IPv4 /pay/ptr and address /pay/nsap. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", nsapPtr: ["host.example.net"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nsapPtr = (await doh(host, "NSAP-PTR")).map((s) => String(s).replace(/\.$/, ""));
      return { host, nsapPtr };
    },
  },
  "/pay/rkey": {
    summary: "DNS RKEY records",
    description: "RKEY resource records (flags, protocol, algorithm, key) for a public hostname. Distinct from /pay/key and /pay/dnskey. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", rkey: [{ flags: 256, protocol: 3, algorithm: 13, publicKey: "abcd" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const rkey = (await doh(host, "RKEY")).map((s) => {
        const parts = String(s).trim().split(/\s+/);
        if (parts.length < 4 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          flags: Number(parts[0]) || 0,
          protocol: Number(parts[1]) || 0,
          algorithm: Number(parts[2]) || 0,
          publicKey: parts.slice(3).join(""),
        };
      });
      return { host, rkey };
    },
  },
  "/pay/talink": {
    summary: "DNS TALINK records",
    description: "TALINK trust-anchor link records (previous and next domain) for a public hostname. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", talink: [{ previous: "prev.example.net", next: "next.example.net" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const talink = (await doh(host, "TALINK")).map((s) => {
        const parts = String(s).trim().replace(/"/g, "").split(/\s+/).filter(Boolean);
        if (parts.length < 2) return { raw: String(s).replace(/\.$/, "") };
        return {
          previous: parts[0].replace(/\.$/, ""),
          next: parts[1].replace(/\.$/, ""),
        };
      });
      return { host, talink };
    },
  },
  "/pay/xrpl": {
    summary: "XRP Ledger TOML",
    description: "Fetch /.well-known/xrp-ledger.toml validator/exchange metadata for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/xrp-ledger.toml",
      status: 200,
      text: "[VALIDATORS]\n",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/xrp-ledger.toml`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/publiccode": {
    summary: "publiccode.yml discovery",
    description: "Fetch /.well-known/publiccode.yml software catalog metadata for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/publiccode.yml",
      status: 200,
      text: "publiccodeYmlVersion: \"0.4\"\nname: Example\n",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/publiccode.yml`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        contentType: fetched.headers.get("content-type") || "",
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/difficulty": {
    summary: "Base latest difficulty",
    description: "difficulty and totalDifficulty of the latest Base block. Distinct from /pay/basefee and /pay/priority. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, difficulty: "0x0", totalDifficulty: "0x0" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        difficulty: block?.difficulty || "0x0",
        totalDifficulty: block?.totalDifficulty || "0x0",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/a6": {
    summary: "DNS A6 records",
    description: "A6 (RFC 2874) IPv6 prefix records for a public hostname. Distinct from /pay/aaaa and generic /pay/dns. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", a6: [{ prefixLength: 64, suffix: "0:0:0:1", prefix: "example.net" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const a6 = (await doh(host, "A6")).map((s) => {
        const parts = String(s).trim().split(/\s+/).filter(Boolean);
        if (parts.length < 2 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          prefixLength: Number(parts[0]) || 0,
          suffix: parts[1] || "",
          prefix: (parts[2] || "").replace(/\.$/, ""),
        };
      });
      return { host, a6 };
    },
  },
  "/pay/sink": {
    summary: "DNS SINK records",
    description: "SINK experimental coding records for a public hostname. Distinct from /pay/txt and /pay/ninfo. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", sink: [{ coding: 1, subcoding: 0, data: "abcd" }] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const sink = (await doh(host, "SINK")).map((s) => {
        const parts = String(s).trim().split(/\s+/).filter(Boolean);
        if (parts.length < 3 || !/^\d+$/.test(parts[0])) return { raw: String(s) };
        return {
          coding: Number(parts[0]) || 0,
          subcoding: Number(parts[1]) || 0,
          data: parts.slice(2).join(""),
        };
      });
      return { host, sink };
    },
  },
  "/pay/mb": {
    summary: "DNS MB records",
    description: "MB (RFC 1035) mailbox domain name records for a public hostname. Distinct from /pay/minfo and /pay/mx. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", mb: ["mailbox.example.net"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const mb = (await doh(host, "MB")).map((s) => String(s).replace(/\.$/, ""));
      return { host, mb };
    },
  },
  "/pay/funding": {
    summary: "funding manifest URLs",
    description: "Fetch /.well-known/funding-manifest-urls FLOSS funding pointers for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/funding-manifest-urls",
      status: 200,
      text: "https://example.com/funding.json\n",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/funding-manifest-urls`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        contentType: fetched.headers.get("content-type") || "",
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/gnap": {
    summary: "GNAP AS/RS discovery",
    description: "Fetch /.well-known/gnap-as-rs Grant Negotiation and Authorization Protocol metadata for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/gnap-as-rs",
      status: 200,
      json: { grant_request_endpoint: "https://example.com/gnap" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/gnap-as-rs`);
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
  "/pay/excessblobgas": {
    summary: "Base latest excessBlobGas",
    description: "excessBlobGas of the latest Base block. Distinct from computed /pay/blobbasefee and /pay/blobgasused. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, excessBlobGas: "0x0" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        excessBlobGas: block?.excessBlobGas || "0x0",
        blobGasUsed: block?.blobGasUsed || "0x0",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/mg": {
    summary: "DNS MG records",
    description: "MG (RFC 1035) mail group member records for a public hostname. Distinct from /pay/mb, /pay/mx, and /pay/minfo. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", mg: ["list-member.example.net"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const mg = (await doh(host, "MG")).map((s) => String(s).replace(/\.$/, ""));
      return { host, mg };
    },
  },
  "/pay/mr": {
    summary: "DNS MR records",
    description: "MR (RFC 1035) mail rename domain records for a public hostname. Distinct from /pay/mb, /pay/mg, and /pay/mx. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", mr: ["new-mailbox.example.net"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const mr = (await doh(host, "MR")).map((s) => String(s).replace(/\.$/, ""));
      return { host, mr };
    },
  },
  "/pay/md": {
    summary: "DNS MD records",
    description: "MD (RFC 1035) mail destination records for a public hostname. Obsolete but distinct from /pay/mx and /pay/mb. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", md: ["mail.example.net"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const md = (await doh(host, "MD")).map((s) => String(s).replace(/\.$/, ""));
      return { host, md };
    },
  },
  "/pay/masque": {
    summary: "MASQUE well-known",
    description: "Fetch /.well-known/masque HTTP datagram / CONNECT-UDP discovery for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/masque",
      status: 200,
      text: "connect-udp\n",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/masque`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        contentType: fetched.headers.get("content-type") || "",
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/mercure": {
    summary: "Mercure hub discovery",
    description: "Fetch /.well-known/mercure publisher hub metadata for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/mercure",
      status: 200,
      json: { hub: "https://example.com/.well-known/mercure" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/mercure`);
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
  "/pay/beaconroot": {
    summary: "Base latest parentBeaconBlockRoot",
    description: "parentBeaconBlockRoot of the latest Base block. Distinct from /pay/blockhash, /pay/stateroot, and /pay/txroot. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, parentBeaconBlockRoot: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        parentBeaconBlockRoot: block?.parentBeaconBlockRoot || "",
        parentHash: block?.parentHash || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/mf": {
    summary: "DNS MF records",
    description: "MF (RFC 1035) mail forwarder records for a public hostname. Obsolete but distinct from /pay/md, /pay/mx, and /pay/mb. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", mf: ["forward.example.net"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const mf = (await doh(host, "MF")).map((s) => String(s).replace(/\.$/, ""));
      return { host, mf };
    },
  },
  "/pay/uid": {
    summary: "DNS UID records",
    description: "UID (RFC 1035 / IANA type 101) user identifier records for a public hostname. Distinct from /pay/gid and /pay/rp. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", uid: ["1000"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const uid = (await doh(host, "UID")).map((s) => String(s));
      return { host, uid };
    },
  },
  "/pay/gid": {
    summary: "DNS GID records",
    description: "GID (RFC 1035 / IANA type 102) group identifier records for a public hostname. Distinct from /pay/uid. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", gid: ["1000"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const gid = (await doh(host, "GID")).map((s) => String(s));
      return { host, gid };
    },
  },
  "/pay/lnurlp": {
    summary: "Lightning LNURL-pay",
    description: "Fetch /.well-known/lnurlp/{name} Lightning Address pay metadata for a public host. $0.002 USDC on Base.",
    price: "0.002",
    params: [
      { name: "host", required: true },
      { name: "name", required: true },
    ],
    queryExample: { host: "example.com", name: "alice" },
    example: {
      host: "example.com",
      name: "alice",
      url: "https://example.com/.well-known/lnurlp/alice",
      status: 200,
      json: { tag: "payRequest", callback: "https://example.com/lnurlp/callback" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      const name = String(q.get("name") || "").trim();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      if (!/^[a-zA-Z0-9._-]{1,64}$/.test(name)) throw new Error("Invalid name");
      const fetched = await fetchPublic(`https://${host}/.well-known/lnurlp/${encodeURIComponent(name)}`);
      let parsed = null;
      try {
        parsed = JSON.parse(fetched.text);
      } catch {
        parsed = null;
      }
      return {
        host,
        name,
        url: fetched.url,
        status: fetched.status,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/oauth-as": {
    summary: "OAuth authorization server metadata",
    description: "Fetch /.well-known/oauth-authorization-server (RFC 8414) for a public host. Distinct from /pay/oauth, /pay/openid, and /pay/jwks. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/oauth-authorization-server",
      status: 200,
      json: { issuer: "https://example.com", token_endpoint: "https://example.com/token" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/oauth-authorization-server`);
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
  "/pay/requestshash": {
    summary: "Base latest requestsHash",
    description: "requestsHash of the latest Base block (EIP-7685). Distinct from /pay/beaconroot, /pay/stateroot, and /pay/txroot. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, requestsHash: "0xabc" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        requestsHash: block?.requestsHash || "",
        parentBeaconBlockRoot: block?.parentBeaconBlockRoot || "",
        hash: block?.hash || "",
        timestamp: Number(hexToBigInt(block?.timestamp)),
      };
    },
  },
  "/pay/uinfo": {
    summary: "DNS UINFO records",
    description: "UINFO (IANA type 100) user information records for a public hostname. Distinct from /pay/uid, /pay/gid, and /pay/rp. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", uinfo: ["operator"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const uinfo = (await doh(host, "UINFO")).map((s) => String(s));
      return { host, uinfo };
    },
  },
  "/pay/unspec": {
    summary: "DNS UNSPEC records",
    description: "UNSPEC (IANA type 103) unspecified records for a public hostname. Distinct from /pay/uid, /pay/ninfo, and /pay/nid. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", unspec: ["0x00"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const unspec = (await doh(host, "UNSPEC")).map((s) => String(s));
      return { host, unspec };
    },
  },
  "/pay/tkey": {
    summary: "DNS TKEY records",
    description: "TKEY (RFC 2930) transaction key records for a public hostname. Distinct from /pay/key, /pay/dnskey, and /pay/rkey. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", tkey: ["alg 2"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const tkey = (await doh(host, "TKEY")).map((s) => String(s));
      return { host, tkey };
    },
  },
  "/pay/api-catalog": {
    summary: "API catalog linkset",
    description: "Fetch /.well-known/api-catalog (RFC 9727) for a public host. Distinct from /pay/llms, /pay/mcp, and /pay/agent-card. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/api-catalog",
      status: 200,
      json: { linkset: [{ anchor: "https://example.com", "https://www.iana.org/assignments/link-relations/api-catalog": [{ href: "https://example.com/openapi.json" }] }] },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/api-catalog`);
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
  "/pay/oauth-pr": {
    summary: "OAuth protected resource metadata",
    description: "Fetch /.well-known/oauth-protected-resource (RFC 9728) for a public host. Distinct from /pay/oauth, /pay/oauth-as, and /pay/openid. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/oauth-protected-resource",
      status: 200,
      json: { resource: "https://api.example.com", authorization_servers: ["https://example.com"] },
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
  "/pay/hashrate": {
    summary: "Base eth_hashrate",
    description: "eth_hashrate from Base RPC. Distinct from /pay/hash, /pay/difficulty, and /pay/gas. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", hashrate: "0x0", hashrateDecimal: 0, blockNumber: 1 },
    handler: async () => {
      const [rate, block] = await Promise.all([
        rpc(BASE_RPC, "eth_hashrate", []),
        rpc(BASE_RPC, "eth_blockNumber", []),
      ]);
      return {
        network: "base",
        hashrate: rate || "0x0",
        hashrateDecimal: Number(hexToBigInt(rate || "0x0")),
        blockNumber: Number(hexToBigInt(block)),
      };
    },
  },
  "/pay/tsig": {
    summary: "DNS TSIG records",
    description: "TSIG (RFC 2845) transaction signature records for a public hostname. Distinct from /pay/tkey, /pay/sig, and /pay/rrsig. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", tsig: ["hmac-sha256. 0"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const tsig = (await doh(host, "TSIG")).map((s) => String(s));
      return { host, tsig };
    },
  },
  "/pay/opt": {
    summary: "DNS OPT/EDNS records",
    description: "OPT (RFC 6891) EDNS pseudo-records for a public hostname. Distinct from /pay/openid, /pay/oauth, and /pay/uri. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", opt: ["4096"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const opt = (await doh(host, "OPT")).map((s) => String(s));
      return { host, opt };
    },
  },
  "/pay/nxname": {
    summary: "DNS NXNAME records",
    description: "NXNAME (RFC 9471, IANA type 128) compact denial records for a public hostname. Distinct from /pay/nsec, /pay/nsec3, and /pay/nxt. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", nxname: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nxname = (await doh(host, "NXNAME")).map((s) => String(s));
      return { host, nxname };
    },
  },
  "/pay/privacy": {
    summary: "Privacy well-known",
    description: "Fetch /.well-known/privacy.txt for a public host. Distinct from /pay/security, /pay/gpc, and /pay/dnt. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/privacy.txt",
      status: 200,
      text: "Privacy-Policy: https://example.com/privacy",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/privacy.txt`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/timezone": {
    summary: "Timezone well-known",
    description: "Fetch /.well-known/timezone for a public host. Distinct from /pay/loc and /pay/block. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/timezone",
      status: 200,
      text: "America/New_York",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/timezone`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000).trim(),
      };
    },
  },
  "/pay/protocol": {
    summary: "Base eth_protocolVersion",
    description: "eth_protocolVersion from Base RPC. Distinct from /pay/clientversion, /pay/chainid, and /pay/syncing. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", protocolVersion: "0x41", protocolVersionDecimal: 65, blockNumber: 1 },
    handler: async () => {
      const [version, block] = await Promise.all([
        rpc(BASE_RPC, "eth_protocolVersion", []),
        rpc(BASE_RPC, "eth_blockNumber", []),
      ]);
      const hex = typeof version === "string" ? version : "0x0";
      return {
        network: "base",
        protocolVersion: hex,
        protocolVersionDecimal: Number(hexToBigInt(hex.startsWith("0x") ? hex : `0x${hex}`)),
        blockNumber: Number(hexToBigInt(block)),
      };
    },
  },
  "/pay/null": {
    summary: "DNS NULL records",
    description: "NULL (RFC 1035 type 10) experimental records for a public hostname. Distinct from /pay/nxname, /pay/nsec, and /pay/opt. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", nullRecords: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const nullRecords = (await doh(host, "NULL")).map((s) => String(s));
      return { host, nullRecords };
    },
  },
  "/pay/any": {
    summary: "DNS ANY records",
    description: "ANY/ALL (IANA type 255) query for a public hostname. Distinct from /pay/dns, /pay/ns, and /pay/txt. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", any: ["93.184.216.34"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const any = (await doh(host, "ANY")).map((s) => String(s));
      return { host, any };
    },
  },
  "/pay/time": {
    summary: "Time well-known",
    description: "Fetch /.well-known/time for a public host. Distinct from /pay/timezone and /pay/block. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/time",
      status: 200,
      text: "2026-08-19T18:00:00Z",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/time`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000).trim(),
      };
    },
  },
  "/pay/posh": {
    summary: "POSH well-known",
    description: "Fetch PKIX over HTTPS (RFC 7711) /.well-known/posh/{service}.json for a public host. Distinct from /pay/cert, /pay/tlsrpt, and /pay/security. $0.002 USDC on Base.",
    price: "0.002",
    params: [
      { name: "host", required: true },
      { name: "service", required: false },
    ],
    queryExample: { host: "example.com", service: "xmpp" },
    example: {
      host: "example.com",
      service: "xmpp",
      url: "https://example.com/.well-known/posh/xmpp.json",
      status: 200,
      text: "{\"fingerprints\":[]}",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const service = String(q.get("service") || "xmpp").trim().toLowerCase();
      if (!/^[a-z0-9][a-z0-9-]{0,62}$/.test(service)) throw new Error("Invalid service");
      const fetched = await fetchPublic(`https://${host}/.well-known/posh/${service}.json`);
      return {
        host,
        service,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/cmp": {
    summary: "CMP well-known",
    description: "Fetch Certificate Management Protocol (RFC 9811) /.well-known/cmp for a public host. Distinct from /pay/cert, /pay/posh, and /pay/assetlinks. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/cmp",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/cmp`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/mining": {
    summary: "Base eth_mining",
    description: "eth_mining from Base RPC. Distinct from /pay/hashrate, /pay/difficulty, and /pay/coinbase. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", mining: false, blockNumber: 1 },
    handler: async () => {
      const [mining, block] = await Promise.all([
        rpc(BASE_RPC, "eth_mining", []),
        rpc(BASE_RPC, "eth_blockNumber", []),
      ]);
      return {
        network: "base",
        mining: Boolean(mining),
        blockNumber: Number(hexToBigInt(block)),
      };
    },
  },
  "/pay/ixfr": {
    summary: "DNS IXFR records",
    description: "IXFR (RFC 1995 type 251) incremental zone transfer query for a public hostname. Distinct from /pay/axfr, /pay/soa, and /pay/any. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", ixfr: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const ixfr = (await doh(host, "IXFR")).map((s) => String(s));
      return { host, ixfr };
    },
  },
  "/pay/axfr": {
    summary: "DNS AXFR records",
    description: "AXFR (RFC 5936 type 252) full zone transfer query for a public hostname. Distinct from /pay/ixfr, /pay/soa, and /pay/any. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", axfr: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const axfr = (await doh(host, "AXFR")).map((s) => String(s));
      return { host, axfr };
    },
  },
  "/pay/mailb": {
    summary: "DNS MAILB records",
    description: "MAILB (RFC 1035 type 253) mailbox-related records for a public hostname. Distinct from /pay/mb, /pay/mx, and /pay/minfo. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", mailb: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const mailb = (await doh(host, "MAILB")).map((s) => String(s));
      return { host, mailb };
    },
  },
  "/pay/est": {
    summary: "EST well-known",
    description: "Fetch Enrollment over Secure Transport (RFC 7030) /.well-known/est for a public host. Distinct from /pay/cert, /pay/cmp, and /pay/posh. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/est",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/est`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/hoba": {
    summary: "HOBA well-known",
    description: "Fetch HTTP Origin-Bound Authentication (RFC 7486) /.well-known/hoba for a public host. Distinct from /pay/webauthn, /pay/passkey, and /pay/openid. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/hoba",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/hoba`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/accounts": {
    summary: "Base eth_accounts",
    description: "eth_accounts from Base RPC. Distinct from /pay/balance, /pay/coinbase, and /pay/nonce. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", accounts: [], blockNumber: 1 },
    handler: async () => {
      const [accounts, block] = await Promise.all([
        rpc(BASE_RPC, "eth_accounts", []),
        rpc(BASE_RPC, "eth_blockNumber", []),
      ]);
      return {
        network: "base",
        accounts: Array.isArray(accounts) ? accounts.map((a) => String(a)) : [],
        blockNumber: Number(hexToBigInt(block)),
      };
    },
  },
  "/pay/maila": {
    summary: "DNS MAILA records",
    description: "MAILA (RFC 1035 type 254) mail agent records for a public hostname. Distinct from /pay/mailb, /pay/mb, and /pay/mx. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", maila: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const maila = (await doh(host, "MAILA")).map((s) => String(s));
      return { host, maila };
    },
  },
  "/pay/acme": {
    summary: "ACME well-known",
    description: "Fetch ACME HTTP-01 (RFC 8555) /.well-known/acme-challenge for a public host. Distinct from /pay/est, /pay/cmp, and /pay/cert. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/acme-challenge",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/acme-challenge`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/ni": {
    summary: "Named Information well-known",
    description: "Fetch Named Information (RFC 6920) /.well-known/ni for a public host. Distinct from /pay/hash, /pay/checksum, and /pay/keccak. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/ni",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/ni`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/stun-key": {
    summary: "STUN key well-known",
    description: "Fetch STUN (RFC 8489) /.well-known/stun-key for a public host. Distinct from /pay/key, /pay/sshfp, and /pay/tlsa. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/stun-key",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/stun-key`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/looking-glass": {
    summary: "Looking glass well-known",
    description: "Fetch looking-glass (RFC 8522) /.well-known/looking-glass for a public host. Distinct from /pay/whois, /pay/headers, and /pay/proxy. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/looking-glass",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/looking-glass`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/netversion": {
    summary: "Base net_version",
    description: "net_version from Base RPC. Distinct from /pay/chainid, /pay/protocol, and /pay/clientversion. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", netVersion: "8453", blockNumber: 1 },
    handler: async () => {
      const [netVersion, block] = await Promise.all([
        rpc(BASE_RPC, "net_version", []),
        rpc(BASE_RPC, "eth_blockNumber", []),
      ]);
      return {
        network: "base",
        netVersion: String(netVersion),
        blockNumber: Number(hexToBigInt(block)),
      };
    },
  },
  "/pay/http-opportunistic": {
    summary: "HTTP opportunistic well-known",
    description: "Fetch RFC 8164 /.well-known/http-opportunistic for a public host. Distinct from /pay/hsts, /pay/headers, and /pay/security. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/http-opportunistic",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/http-opportunistic`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/repute": {
    summary: "Repute template well-known",
    description: "Fetch RFC 7071 /.well-known/repute-template for a public host. Distinct from /pay/trust, /pay/security, and /pay/related. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/repute-template",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/repute-template`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/reload": {
    summary: "RELOAD config well-known",
    description: "Fetch RFC 6940 /.well-known/reload-config for a public host. Distinct from /pay/manifest, /pay/nodeinfo, and /pay/looking-glass. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/reload-config",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/reload-config`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/void": {
    summary: "VoID well-known",
    description: "Fetch W3C VoID /.well-known/void dataset description for a public host. Distinct from /pay/jsonld, /pay/feeds, and /pay/sitemap. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/void",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/void`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/pki-validation": {
    summary: "PKI validation well-known",
    description: "Fetch CA /.well-known/pki-validation for a public host. Distinct from /pay/cert, /pay/acme, and /pay/est. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/pki-validation",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/pki-validation`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/blocknonce": {
    summary: "Base block nonce",
    description: "8-byte proof-of-work nonce of the latest Base block. Distinct from account /pay/nonce, /pay/mixhash, and /pay/blockhash. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, nonce: "0x0000000000000000" },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        nonce: block?.nonce || "0x0",
        mixHash: block?.mixHash || "",
      };
    },
  },
  "/pay/openid-federation": {
    summary: "OpenID Federation entity config",
    description: "Fetch OpenID Federation 1.0 /.well-known/openid-federation for a public host. Distinct from /pay/openid, /pay/oauth-as, and /pay/oid4vci. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/openid-federation",
      status: 200,
      json: { iss: "https://example.com", sub: "https://example.com" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/openid-federation`);
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
  "/pay/traffic-advice": {
    summary: "Origin traffic advice",
    description: "Fetch IETF HTTP Origin Traffic Advice /.well-known/traffic-advice for a public host. Distinct from /pay/headers, /pay/hsts, and /pay/proxy. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/traffic-advice",
      status: 200,
      json: [{ user_agent: "prefetch-proxy", disallow: true }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/traffic-advice`);
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
  "/pay/csaf-aggregator": {
    summary: "CSAF aggregator metadata",
    description: "Fetch OASIS CSAF /.well-known/csaf-aggregator/aggregator.json for a public host. Distinct from provider /pay/csaf. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/csaf-aggregator/aggregator.json",
      status: 200,
      json: { canonical_url: "https://example.com/.well-known/csaf-aggregator/aggregator.json" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/csaf-aggregator/aggregator.json`);
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
  "/pay/apple-merchantid": {
    summary: "Apple Pay merchant ID",
    description: "Fetch Apple Pay /.well-known/apple-developer-merchantid-domain-association for a public host. Distinct from Universal Links /pay/aasa. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/apple-developer-merchantid-domain-association",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/apple-developer-merchantid-domain-association`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/privacy-sandbox": {
    summary: "Privacy Sandbox attestations",
    description: "Fetch /.well-known/privacy-sandbox-attestations.json for a public host. Distinct from /pay/privacy, /pay/gpc, and /pay/dnt. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/privacy-sandbox-attestations.json",
      status: 200,
      json: { version: 1 },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/privacy-sandbox-attestations.json`);
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
  "/pay/unclecount": {
    summary: "Base uncle count",
    description: "eth_getUncleCountByBlockNumber for the latest Base block. Distinct from /pay/uncles (sha3Uncles) and /pay/txcount. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, uncleCount: 0 },
    handler: async () => {
      const [count, block] = await Promise.all([
        rpc(BASE_RPC, "eth_getUncleCountByBlockNumber", ["latest"]),
        rpc(BASE_RPC, "eth_blockNumber", []),
      ]);
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block)),
        uncleCount: Number(hexToBigInt(count)),
      };
    },
  },
  "/pay/smart": {
    summary: "FHIR SMART configuration",
    description: "Fetch HL7 FHIR SMART App Launch /.well-known/smart-configuration for a public host. Distinct from /pay/openid and /pay/oauth-as. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/smart-configuration",
      status: 200,
      json: { authorization_endpoint: "https://example.com/auth", token_endpoint: "https://example.com/token" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/smart-configuration`);
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
  "/pay/wkd": {
    summary: "OpenPGP WKD policy",
    description: "Fetch OpenPGP Web Key Directory /.well-known/openpgpkey/policy for a public host. Distinct from DNS /pay/openpgpkey. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/openpgpkey/policy",
      status: 200,
      text: "protocol-version: 1",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/openpgpkey/policy`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/resourcesync": {
    summary: "ResourceSync capability list",
    description: "Fetch Sitemap ResourceSync /.well-known/resourcesync for a public host. Distinct from /pay/sitemap and /pay/feeds. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/resourcesync",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/resourcesync`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/matrix-client": {
    summary: "Matrix client discovery",
    description: "Fetch /.well-known/matrix/client homeserver discovery for a public host. Distinct from federation /pay/matrix. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/matrix/client",
      status: 200,
      json: { "m.homeserver": { base_url: "https://matrix.example.com" } },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/matrix/client`);
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
  "/pay/autoconfig": {
    summary: "Mail autoconfig XML",
    description: "Fetch Thunderbird /.well-known/autoconfig/mail/config-v1.1.xml for a public host. Distinct from /pay/mx and /pay/srv. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/autoconfig/mail/config-v1.1.xml",
      status: 200,
      text: "<?xml version=\"1.0\"?>",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/autoconfig/mail/config-v1.1.xml`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/txlist": {
    summary: "Base latest tx hashes",
    description: "First transaction hashes from the latest Base block. Distinct from /pay/txcount (count only) and /pay/txid (single receipt). $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, count: 1, hashes: ["0xabc"] },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const hashes = Array.isArray(block?.transactions) ? block.transactions.slice(0, 32) : [];
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block?.number)),
        count: Array.isArray(block?.transactions) ? block.transactions.length : 0,
        hashes,
      };
    },
  },
  "/pay/browserid": {
    summary: "BrowserID support document",
    description: "Fetch Mozilla BrowserID/Persona /.well-known/browserid for a public host. Distinct from /pay/web-identity and /pay/openid. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/browserid",
      status: 200,
      json: { public_key: {}, authentication: "/browserid/sign_in.html", provisioning: "/browserid/provision.html" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/browserid`);
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
  "/pay/csvm": {
    summary: "CSV on the Web metadata",
    description: "Fetch W3C CSVW /.well-known/csvm metadata documents for a public host. Distinct from /pay/json and /pay/sitemap. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/csvm",
      status: 200,
      text: "{+url}-metadata.json\ncsv-metadata.json",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/csvm`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/openorg": {
    summary: "OpenOrg company profile",
    description: "Fetch /.well-known/openorg company/profile JSON for a public host. Distinct from /pay/jsonld and /pay/publiccode. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/openorg",
      status: 200,
      json: { name: "Example Org" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/openorg`);
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
  "/pay/idp-proxy": {
    summary: "OpenID IdP proxy",
    description: "Fetch /.well-known/idp-proxy OpenID IdP proxy discovery for a public host. Distinct from /pay/openid, /pay/oauth-as, and /pay/web-identity. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/idp-proxy",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/idp-proxy`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/genid": {
    summary: "Atom genid well-known",
    description: "Fetch RFC 4151/Atom /.well-known/genid for a public host. Distinct from /pay/did and /pay/oid4vci. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/genid",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/genid`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/estimate": {
    summary: "Base eth_estimateGas",
    description: "eth_estimateGas for a zero-value Base transfer to the receive wallet. Distinct from /pay/gas (gasPrice), /pay/gasused (block gasUsed), and /pay/basefee. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", to: "0xdD1729943bf7C408456cef52886ad12B05B57dC2", estimatedGas: 21000 },
    handler: async () => {
      const gas = await rpc(BASE_RPC, "eth_estimateGas", [{ to: PAY_TO, value: "0x0" }]);
      return {
        network: "base",
        to: PAY_TO,
        estimatedGas: Number(hexToBigInt(gas)),
        estimatedGasHex: gas,
      };
    },
  },
  "/pay/amphtml": {
    summary: "AMP HTML well-known",
    description: "Fetch AMP /.well-known/amphtml for a public host. Distinct from /pay/canonical and /pay/manifest. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/amphtml",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/amphtml`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/discord": {
    summary: "Discord domain verification",
    description: "Fetch Discord /.well-known/discord domain verification for a public host. Distinct from /pay/assetlinks and /pay/related. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/discord",
      status: 200,
      json: { application_id: "0" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/discord`);
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
  "/pay/gs1": {
    summary: "GS1 Digital Link resolver",
    description: "Fetch GS1 Digital Link /.well-known/gs1resolver for a public host. Distinct from /pay/nodeinfo and /pay/webfinger. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/gs1resolver",
      status: 200,
      json: { supportedLinkTypes: [] },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/gs1resolver`);
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
  "/pay/thread": {
    summary: "Thread networking well-known",
    description: "Fetch Thread border-router /.well-known/thread for a public host. Distinct from /pay/masque and /pay/core. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/thread",
      status: 200,
      json: {},
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/thread`);
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
  "/pay/ets": {
    summary: "Enterprise Transport Security",
    description: "Fetch /.well-known/enterprise-transport-security for a public host. Distinct from /pay/hsts and /pay/mta-sts. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/enterprise-transport-security",
      status: 200,
      text: "mode: enforce",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/enterprise-transport-security`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/txindex": {
    summary: "Base tx by block index",
    description: "eth_getTransactionByBlockNumberAndIndex for index 0 of the latest Base block. Distinct from /pay/txlist (hashes), /pay/txid (by hash), and /pay/txcount. $0.001 USDC on Base.",
    price: "0.001",
    params: [],
    queryExample: {},
    example: { network: "base", index: 0, found: true, hash: "0x", from: "0x", to: "0x" },
    handler: async () => {
      const tx = await rpc(BASE_RPC, "eth_getTransactionByBlockNumberAndIndex", ["latest", "0x0"]);
      if (!tx) return { network: "base", index: 0, found: false };
      return {
        network: "base",
        index: 0,
        found: true,
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        valueWei: hexToBigInt(tx.value).toString(),
        type: tx.type || null,
        blockNumber: tx.blockNumber ? Number(hexToBigInt(tx.blockNumber)) : null,
        transactionIndex: tx.transactionIndex != null ? Number(hexToBigInt(tx.transactionIndex)) : 0,
      };
    },
  },
  "/pay/ashrae": {
    summary: "ASHRAE BACnet well-known",
    description: "Fetch ASHRAE BACnet /.well-known/ashrae for a public host. Distinct from /pay/core and /pay/thread. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/ashrae",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/ashrae`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/hhit": {
    summary: "DNS HHIT records",
    description: "Hierarchical Host Identity Tag (HHIT, type 67, RFC 9886) records for a public hostname. Distinct from HIP /pay/hip. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", hhit: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const hhit = (await doh(host, "67")).map((s) => String(s));
      return { host, type: 67, mnemonic: "HHIT", hhit };
    },
  },
  "/pay/brid": {
    summary: "DNS BRID records",
    description: "UAS Broadcast Remote Identification (BRID, type 68, RFC 9886) records for a public hostname. Distinct from HIP /pay/hip and HHIT /pay/hhit. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: { host: "example.com", brid: [] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const brid = (await doh(host, "68")).map((s) => String(s));
      return { host, type: 68, mnemonic: "BRID", brid };
    },
  },
  "/pay/relme": {
    summary: "rel=me identity links",
    description: "Extract IndieAuth rel=me identity URLs from a public page. Distinct from untyped /pay/links and /pay/canonical. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, me: ["https://github.com/example"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const me = relHrefs(text, url, "me").slice(0, 40);
      return { url, count: me.length, me };
    },
  },
  "/pay/shortlink": {
    summary: "rel=shortlink",
    description: "Extract rel=shortlink from a public page. Distinct from /pay/canonical (canonical/og:url). $0.001 USDC on Base.",
    price: "0.001",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", shortlink: "https://exm.pl/a" },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const links = relHrefs(text, url, "shortlink");
      return { url, shortlink: links[0] || "", shortlinks: links.slice(0, 8) };
    },
  },
  "/pay/getproof": {
    summary: "Base eth_getProof",
    description: "eth_getProof account Merkle proof for an address on Base (no storage keys). Distinct from /pay/balance (ETH+USDC amounts), /pay/storage (one slot), /pay/code (bytecode), and /pay/offer-proof (commerce). $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "address", required: true }],
    queryExample: { address: PAY_TO },
    example: {
      network: "base",
      address: PAY_TO,
      balanceWei: "0",
      nonce: 0,
      storageHash: "0x",
      codeHash: "0x",
      accountProofNodes: 8,
    },
    handler: async (q) => {
      const address = String(q.get("address") || "");
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) throw new Error("Invalid address");
      const proof = await rpc(BASE_RPC, "eth_getProof", [address, [], "latest"]);
      return {
        network: "base",
        address,
        balanceWei: hexToBigInt(proof?.balance).toString(),
        nonce: Number(hexToBigInt(proof?.nonce)),
        storageHash: proof?.storageHash || "",
        codeHash: proof?.codeHash || "",
        accountProofNodes: Array.isArray(proof?.accountProof) ? proof.accountProof.length : 0,
      };
    },
  },
  "/pay/coap": {
    summary: "CoAP well-known",
    description: "Fetch CoAP-over-HTTP (RFC 8323) /.well-known/coap for a public host. Distinct from CoRE Link Format /pay/core. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/coap",
      status: 200,
      text: "",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/coap`);
      return {
        host,
        url: fetched.url,
        status: fetched.status,
        contentType: fetched.headers.get("content-type") || "",
        text: fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/sbom": {
    summary: "SBOM well-known",
    description: "Fetch RFC 9472 /.well-known/sbom software bill of materials for a public host. Distinct from /pay/publiccode and /pay/security. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/sbom",
      status: 200,
      json: { bomFormat: "CycloneDX" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/sbom`);
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
  "/pay/wot": {
    summary: "W3C Web of Things",
    description: "Fetch W3C WoT /.well-known/wot Thing Description Directory for a public host. Distinct from /pay/core and /pay/thread. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/wot",
      status: 200,
      json: { "@context": "https://www.w3.org/2022/wot/td/v1.1" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/wot`);
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
  "/pay/terraform": {
    summary: "Terraform service discovery",
    description: "Fetch HashiCorp /.well-known/terraform.json remote-service discovery for a public host. Distinct from /pay/openid and /pay/api-catalog. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/terraform.json",
      status: 200,
      json: { "modules.v1": "/v1/modules/" },
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/terraform.json`);
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
  "/pay/license": {
    summary: "rel=license links",
    description: "Extract rel=license URLs from a public page. Distinct from untyped /pay/links and identity /pay/relme. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, licenses: ["https://creativecommons.org/licenses/by/4.0/"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const licenses = relHrefs(text, url, "license").slice(0, 40);
      return { url, count: licenses.length, licenses };
    },
  },
  "/pay/blockreceipts": {
    summary: "Base eth_getBlockReceipts",
    description: "eth_getBlockReceipts for the latest Base block. Distinct from /pay/txid (one receipt by hash), /pay/txlist (hashes), /pay/txindex (one tx), and /pay/txcount. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", count: 2, firstHash: "0x", firstStatus: 1 },
    handler: async () => {
      const receipts = await rpc(BASE_RPC, "eth_getBlockReceipts", ["latest"]);
      const list = Array.isArray(receipts) ? receipts : [];
      const first = list[0] || null;
      return {
        network: "base",
        count: list.length,
        firstHash: first?.transactionHash || "",
        firstStatus: first?.status != null ? Number(hexToBigInt(first.status)) : null,
        gasUsed: list.reduce((sum, r) => sum + Number(hexToBigInt(r?.gasUsed)), 0),
      };
    },
  },
  "/pay/author": {
    summary: "rel=author links",
    description: "Extract rel=author URLs from a public page. Distinct from identity /pay/relme and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, authors: ["https://example.com/about"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const authors = relHrefs(text, url, "author").slice(0, 40);
      return { url, count: authors.length, authors };
    },
  },
  "/pay/hub": {
    summary: "WebSub hubs",
    description: "Extract WebSub rel=hub and rel=self URLs from a public page or feed. Distinct from /pay/feeds (RSS discovery) and /pay/rss (parsed items). $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/feed.xml" },
    example: { url: "https://example.com/feed.xml", hubs: ["https://pubsubhubbub.appspot.com/"], self: "https://example.com/feed.xml" },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const hubs = relHrefs(text, url, "hub").slice(0, 20);
      const self = relHrefs(text, url, "self");
      return { url, hubs, self: self[0] || "" };
    },
  },
  "/pay/nextprev": {
    summary: "rel=next and rel=prev",
    description: "Extract pagination rel=next and rel=prev URLs from a public page. Distinct from /pay/canonical and /pay/shortlink. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/blog" },
    example: { url: "https://example.com/blog", next: ["https://example.com/blog?page=2"], prev: [] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      return {
        url,
        next: relHrefs(text, url, "next").slice(0, 8),
        prev: relHrefs(text, url, "prev").slice(0, 8),
      };
    },
  },
  "/pay/pingback": {
    summary: "Pingback endpoint",
    description: "Discover a pingback endpoint from X-Pingback and rel=pingback. Distinct from /pay/webmention. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/post" },
    example: { url: "https://example.com/post", header: "https://example.com/xmlrpc.php", pingbacks: ["https://example.com/xmlrpc.php"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromRel = relHrefs(fetched.text, fetched.url, "pingback");
      const fromHeader = (fetched.headers.get("x-pingback") || "").trim();
      const pingbacks = [...new Set([fromHeader, ...fromRel].filter(Boolean))].slice(0, 8);
      return {
        url: fetched.url,
        header: fromHeader,
        pingbacks,
      };
    },
  },
  "/pay/preload": {
    summary: "Resource hints",
    description: "Extract preload, preconnect, prefetch, modulepreload, dns-prefetch and prerender link hints from a public page. Distinct from /pay/links, /pay/images, and /pay/canonical. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      count: 1,
      hints: [{ rel: "preconnect", href: "https://fonts.gstatic.com", as: "" }],
    },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const tags = text.match(/<link\b[^>]*>/gi) || [];
      const kinds = new Set(["preload", "preconnect", "prefetch", "modulepreload", "dns-prefetch", "prerender"]);
      const hints = [];
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        const kind = rel.split(/\s+/).find((r) => kinds.has(r));
        if (!kind) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(url, href) : null;
        if (!abs) continue;
        hints.push({
          rel: kind,
          href: abs,
          as: (tag.match(/\bas=["']([^"']+)["']/i) || [])[1] || "",
        });
      }
      const sliced = hints.slice(0, 40);
      return { url, count: sliced.length, hints: sliced };
    },
  },
  "/pay/uncle": {
    summary: "Base uncle by index",
    description: "eth_getUncleByBlockNumberAndIndex for the latest Base block at index 0. Distinct from /pay/uncles (sha3Uncles) and /pay/unclecount. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, index: 0, uncle: null },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_blockNumber", []);
      let uncle = null;
      try {
        uncle = await rpc(BASE_RPC, "eth_getUncleByBlockNumberAndIndex", ["latest", "0x0"]);
      } catch {
        uncle = null;
      }
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(block)),
        index: 0,
        uncle: uncle
          ? {
              hash: uncle.hash || "",
              miner: uncle.miner || "",
              number: uncle.number != null ? Number(hexToBigInt(uncle.number)) : null,
            }
          : null,
      };
    },
  },
  "/pay/help": {
    summary: "rel=help links",
    description: "Extract rel=help URLs from a public page. Distinct from identity /pay/relme, license /pay/license, and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, help: ["https://example.com/help"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const help = relHrefs(text, url, "help").slice(0, 40);
      return { url, count: help.length, help };
    },
  },
  "/pay/tag": {
    summary: "rel=tag links",
    description: "Extract rel=tag URLs from a public page. Distinct from pagination /pay/nextprev and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/post" },
    example: { url: "https://example.com/post", count: 1, tags: ["https://example.com/tags/news"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const tags = relHrefs(text, url, "tag").slice(0, 40);
      return { url, count: tags.length, tags };
    },
  },
  "/pay/bookmark": {
    summary: "rel=bookmark links",
    description: "Extract rel=bookmark permalinks from a public page. Distinct from /pay/canonical, /pay/shortlink, and /pay/author. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/post" },
    example: { url: "https://example.com/post", count: 1, bookmarks: ["https://example.com/post"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const bookmarks = relHrefs(text, url, "bookmark").slice(0, 40);
      return { url, count: bookmarks.length, bookmarks };
    },
  },
  "/pay/edituri": {
    summary: "rel=EditURI (RSD)",
    description: "Extract Really Simple Discovery rel=EditURI endpoints from a public page. Distinct from /pay/webmention, /pay/pingback, and /pay/hub. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, edituri: ["https://example.com/xmlrpc.php?rsd"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const edituri = relHrefs(text, url, "edituri").slice(0, 20);
      return { url, count: edituri.length, edituri };
    },
  },
  "/pay/describedby": {
    summary: "rel=describedby links",
    description: "Extract rel=describedby metadata URLs from a public page. Distinct from /pay/jsonld, /pay/oembed, and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, describedby: ["https://example.com/data.json"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const describedby = relHrefs(text, url, "describedby").slice(0, 40);
      return { url, count: describedby.length, describedby };
    },
  },
  "/pay/call": {
    summary: "Base eth_call",
    description: "eth_call a contract on Base with to+data. Distinct from /pay/token (name/symbol/decimals), /pay/supply (totalSupply), and /pay/code (bytecode). $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "to", required: true }, { name: "data", required: true }],
    queryExample: { to: USDC, data: "0x18160ddd" },
    example: { network: "base", to: USDC, data: "0x18160ddd", result: "0x" },
    handler: async (q) => {
      const to = String(q.get("to") || "");
      const data = String(q.get("data") || "").trim();
      if (!/^0x[a-fA-F0-9]{40}$/.test(to)) throw new Error("Invalid to");
      if (!/^0x[a-fA-F0-9]*$/.test(data) || data.length % 2 !== 0) throw new Error("Invalid data");
      const result = await ethCall(to, data);
      return { network: "base", to, data, result: result || "0x" };
    },
  },
  "/pay/privacy-policy": {
    summary: "rel=privacy-policy links",
    description: "Extract HTML rel=privacy-policy URLs from a public page. Distinct from /pay/privacy (/.well-known/privacy.txt) and /pay/gpc. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, policies: ["https://example.com/privacy"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const policies = relHrefs(text, url, "privacy-policy").slice(0, 20);
      return { url, count: policies.length, policies };
    },
  },
  "/pay/tos": {
    summary: "rel=terms-of-service links",
    description: "Extract HTML rel=terms-of-service URLs from a public page. Distinct from /pay/privacy-policy, /pay/license, and /pay/privacy. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, terms: ["https://example.com/terms"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const terms = relHrefs(text, url, "terms-of-service").slice(0, 20);
      return { url, count: terms.length, terms };
    },
  },
  "/pay/micropub": {
    summary: "rel=micropub endpoints",
    description: "Extract IndieWeb rel=micropub endpoints from a public page. Distinct from /pay/webmention, /pay/pingback, and /pay/edituri. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, micropub: ["https://example.com/micropub"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const micropub = relHrefs(text, url, "micropub").slice(0, 20);
      return { url, count: micropub.length, micropub };
    },
  },
  "/pay/microsub": {
    summary: "rel=microsub endpoints",
    description: "Extract IndieWeb rel=microsub reader endpoints from a public page. Distinct from /pay/micropub, /pay/hub, and /pay/feeds. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, microsub: ["https://example.com/microsub"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const microsub = relHrefs(text, url, "microsub").slice(0, 20);
      return { url, count: microsub.length, microsub };
    },
  },
  "/pay/wpjson": {
    summary: "WordPress REST discovery",
    description: "Extract WordPress REST API roots from rel=https://api.w.org/ links. Distinct from /pay/edituri (RSD), /pay/manifest, and /pay/json. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, wpjson: ["https://example.com/wp-json/"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const tags = text.match(/<(?:link|a)\b[^>]*>/gi) || [];
      const wpjson = [];
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (!rel.includes("api.w.org")) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(url, href) : null;
        if (abs) wpjson.push(abs);
      }
      const sliced = [...new Set(wpjson)].slice(0, 20);
      return { url, count: sliced.length, wpjson: sliced };
    },
  },
  "/pay/logs": {
    summary: "Base eth_getLogs",
    description: "eth_getLogs for USDC on the latest Base block. Distinct from /pay/logsbloom (block bloom filter), /pay/blockreceipts, and /pay/txlist. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, address: USDC, count: 0, first: null },
    handler: async () => {
      const blockHex = await rpc(BASE_RPC, "eth_blockNumber", []);
      const logs = await rpc(BASE_RPC, "eth_getLogs", [
        { fromBlock: blockHex, toBlock: blockHex, address: USDC },
      ]);
      const list = Array.isArray(logs) ? logs : [];
      const first = list[0] || null;
      return {
        network: "base",
        blockNumber: Number(hexToBigInt(blockHex)),
        address: USDC,
        count: list.length,
        first: first
          ? {
              txHash: first.transactionHash || "",
              index: first.logIndex != null ? Number(hexToBigInt(first.logIndex)) : null,
              topics: Array.isArray(first.topics) ? first.topics.slice(0, 4) : [],
            }
          : null,
      };
    },
  },
  "/pay/stylesheet": {
    summary: "rel=stylesheet links",
    description: "Extract HTML rel=stylesheet URLs from a public page. Distinct from resource-hint /pay/preload and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, stylesheets: [{ href: "https://example.com/app.css", media: "all", type: "text/css" }] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const tags = text.match(/<(?:link)\b[^>]*>/gi) || [];
      const stylesheets = [];
      for (const tag of tags) {
        if (!/\brel=["'][^"']*\bstylesheet\b[^"']*["']/i.test(tag)) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(url, href) : null;
        if (!abs) continue;
        stylesheets.push({
          href: abs,
          media: (tag.match(/\bmedia=["']([^"']+)["']/i) || [])[1] || "",
          type: (tag.match(/\btype=["']([^"']+)["']/i) || [])[1] || "",
        });
      }
      const sliced = stylesheets.slice(0, 40);
      return { url, count: sliced.length, stylesheets: sliced };
    },
  },
  "/pay/alternate": {
    summary: "rel=alternate variants",
    description: "Extract all rel=alternate links with type, media, title, and hreflang. Distinct from language-only /pay/hreflang, AMP /pay/amphtml, and feed /pay/rss. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      count: 1,
      alternates: [{ href: "https://example.com/feed.xml", type: "application/rss+xml", hreflang: "", media: "", title: "RSS" }],
    },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const tags = text.match(/<(?:link|a)\b[^>]*>/gi) || [];
      const alternates = [];
      for (const tag of tags) {
        if (!/\brel=["'][^"']*\balternate\b[^"']*["']/i.test(tag)) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(url, href) : null;
        if (!abs) continue;
        alternates.push({
          href: abs,
          type: (tag.match(/\btype=["']([^"']+)["']/i) || [])[1] || "",
          hreflang: (tag.match(/\bhreflang=["']([^"']+)["']/i) || [])[1] || "",
          media: (tag.match(/\bmedia=["']([^"']+)["']/i) || [])[1] || "",
          title: (tag.match(/\btitle=["']([^"']+)["']/i) || [])[1] || "",
        });
      }
      const sliced = alternates.slice(0, 40);
      return { url, count: sliced.length, alternates: sliced };
    },
  },
  "/pay/edit": {
    summary: "rel=edit links",
    description: "Extract AtomPub rel=edit IRIs from a public page. Distinct from RSD /pay/edituri and WordPress /pay/wpjson. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/entry" },
    example: { url: "https://example.com/entry", count: 1, edit: ["https://example.com/atom/entry/1"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const edit = relHrefs(text, url, "edit").slice(0, 20);
      return { url, count: edit.length, edit };
    },
  },
  "/pay/up": {
    summary: "rel=up links",
    description: "Extract hierarchical rel=up parent URLs from a public page. Distinct from pagination /pay/nextprev and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/docs/page" },
    example: { url: "https://example.com/docs/page", count: 1, up: ["https://example.com/docs"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const up = relHrefs(text, url, "up").slice(0, 20);
      return { url, count: up.length, up };
    },
  },
  "/pay/enclosure": {
    summary: "rel=enclosure links",
    description: "Extract Atom/RSS rel=enclosure media URLs from a public page. Distinct from /pay/images, /pay/feeds, and /pay/rss. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/episode" },
    example: {
      url: "https://example.com/episode",
      count: 1,
      enclosures: [{ href: "https://example.com/ep.mp3", type: "audio/mpeg", length: "12345" }],
    },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const tags = text.match(/<(?:link|a)\b[^>]*>/gi) || [];
      const enclosures = [];
      for (const tag of tags) {
        if (!/\brel=["'][^"']*\benclosure\b[^"']*["']/i.test(tag)) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(url, href) : null;
        if (!abs) continue;
        enclosures.push({
          href: abs,
          type: (tag.match(/\btype=["']([^"']+)["']/i) || [])[1] || "",
          length: (tag.match(/\blength=["']([^"']+)["']/i) || [])[1] || "",
        });
      }
      const sliced = enclosures.slice(0, 20);
      return { url, count: sliced.length, enclosures: sliced };
    },
  },
  "/pay/pending": {
    summary: "Base pending block",
    description: "eth_getBlockByNumber(pending) hash, number, and tx count. Distinct from latest /pay/block, /pay/txcount, and /pay/txlist. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, hash: "0x", parentHash: "0x", txCount: 0 },
    handler: async () => {
      const block = await rpc(BASE_RPC, "eth_getBlockByNumber", ["pending", false]);
      const txs = Array.isArray(block?.transactions) ? block.transactions : [];
      return {
        network: "base",
        blockNumber: block?.number != null ? Number(hexToBigInt(block.number)) : null,
        hash: block?.hash || "",
        parentHash: block?.parentHash || "",
        txCount: txs.length,
        timestamp: block?.timestamp != null ? Number(hexToBigInt(block.timestamp)) : null,
      };
    },
  },
  "/pay/first": {
    summary: "rel=first links",
    description: "Extract RFC 5988 rel=first pagination URLs from a public page. Distinct from /pay/nextprev, /pay/up, and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/page/2" },
    example: { url: "https://example.com/page/2", count: 1, first: ["https://example.com/page/1"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const first = relHrefs(text, url, "first").slice(0, 20);
      return { url, count: first.length, first };
    },
  },
  "/pay/last": {
    summary: "rel=last links",
    description: "Extract RFC 5988 rel=last pagination URLs from a public page. Distinct from /pay/first, /pay/nextprev, and /pay/up. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/page/2" },
    example: { url: "https://example.com/page/2", count: 1, last: ["https://example.com/page/9"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const last = relHrefs(text, url, "last").slice(0, 20);
      return { url, count: last.length, last };
    },
  },
  "/pay/archives": {
    summary: "rel=archives links",
    description: "Extract HTML rel=archives listing URLs from a public page. Distinct from /pay/feeds, /pay/rss, and /pay/sitemap. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/blog" },
    example: { url: "https://example.com/blog", count: 1, archives: ["https://example.com/blog/archives"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const archives = relHrefs(text, url, "archives").slice(0, 20);
      return { url, count: archives.length, archives };
    },
  },
  "/pay/via": {
    summary: "rel=via links",
    description: "Extract RFC 5988 rel=via source URLs from a public page. Distinct from /pay/canonical, /pay/describedby, and /pay/author. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/repost" },
    example: { url: "https://example.com/repost", count: 1, via: ["https://example.com/original"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const via = relHrefs(text, url, "via").slice(0, 20);
      return { url, count: via.length, via };
    },
  },
  "/pay/replies": {
    summary: "rel=replies links",
    description: "Extract RFC 4685 rel=replies thread URLs from a public page. Distinct from /pay/webmention, /pay/pingback, and /pay/hub. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/post" },
    example: { url: "https://example.com/post", count: 1, replies: ["https://example.com/post/comments"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const replies = relHrefs(text, url, "replies").slice(0, 20);
      return { url, count: replies.length, replies };
    },
  },
  "/pay/blockbyhash": {
    summary: "Base eth_getBlockByHash",
    description: "eth_getBlockByHash for the latest Base block hash. Distinct from number-based /pay/block, hash-only /pay/blockhash, and pending /pay/pending. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", blockNumber: 1, hash: "0x", parentHash: "0x", txCount: 0, method: "eth_getBlockByHash" },
    handler: async () => {
      const latest = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const hash = latest?.hash;
      if (!hash) throw new Error("Latest block hash missing");
      const block = await rpc(BASE_RPC, "eth_getBlockByHash", [hash, false]);
      const txs = Array.isArray(block?.transactions) ? block.transactions : [];
      return {
        network: "base",
        method: "eth_getBlockByHash",
        blockNumber: block?.number != null ? Number(hexToBigInt(block.number)) : null,
        hash: block?.hash || hash,
        parentHash: block?.parentHash || "",
        txCount: txs.length,
        timestamp: block?.timestamp != null ? Number(hexToBigInt(block.timestamp)) : null,
      };
    },
  },
  "/pay/index": {
    summary: "rel=index links",
    description: "Extract RFC 5988 rel=index catalog URLs from a public page. Distinct from /pay/sitemap, /pay/contents, and /pay/first. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/docs/page" },
    example: { url: "https://example.com/docs/page", count: 1, index: ["https://example.com/docs"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const index = relHrefs(text, url, "index").slice(0, 20);
      return { url, count: index.length, index };
    },
  },
  "/pay/contents": {
    summary: "rel=contents links",
    description: "Extract HTML rel=contents table-of-contents URLs from a public page. Distinct from /pay/index, /pay/outline, and /pay/sitemap. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/chapter/2" },
    example: { url: "https://example.com/chapter/2", count: 1, contents: ["https://example.com/toc"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const contents = relHrefs(text, url, "contents").slice(0, 20);
      return { url, count: contents.length, contents };
    },
  },
  "/pay/collection": {
    summary: "rel=collection links",
    description: "Extract RFC 6573 rel=collection parent URLs from a public page. Distinct from /pay/item, /pay/archives, and /pay/feeds. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/items/42" },
    example: { url: "https://example.com/items/42", count: 1, collection: ["https://example.com/items"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const collection = relHrefs(text, url, "collection").slice(0, 20);
      return { url, count: collection.length, collection };
    },
  },
  "/pay/item": {
    summary: "rel=item links",
    description: "Extract RFC 6573 rel=item member URLs from a public page. Distinct from /pay/collection, /pay/enclosure, and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/items" },
    example: { url: "https://example.com/items", count: 1, item: ["https://example.com/items/1"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const item = relHrefs(text, url, "item").slice(0, 20);
      return { url, count: item.length, item };
    },
  },
  "/pay/copyright": {
    summary: "rel=copyright links",
    description: "Extract HTML rel=copyright notice URLs from a public page. Distinct from /pay/license, /pay/tos, and /pay/privacy-policy. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, copyright: ["https://example.com/copyright"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const copyright = relHrefs(text, url, "copyright").slice(0, 20);
      return { url, count: copyright.length, copyright };
    },
  },
  "/pay/txcounthash": {
    summary: "Base tx count by hash",
    description: "eth_getBlockTransactionCountByHash for the latest Base block hash. Distinct from number-based /pay/txcount, /pay/txlist, and /pay/blockbyhash. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", hash: "0x", transactionCount: 12, method: "eth_getBlockTransactionCountByHash" },
    handler: async () => {
      const latest = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const hash = latest?.hash;
      if (!hash) throw new Error("Latest block hash missing");
      const countHex = await rpc(BASE_RPC, "eth_getBlockTransactionCountByHash", [hash]);
      return {
        network: "base",
        method: "eth_getBlockTransactionCountByHash",
        hash,
        blockNumber: latest?.number != null ? Number(hexToBigInt(latest.number)) : null,
        transactionCount: Number(hexToBigInt(countHex)),
      };
    },
  },
  "/pay/about": {
    summary: "rel=about links",
    description: "Extract RFC 6903 rel=about resource description URLs from a public page. Distinct from /pay/describedby, /pay/profile, and /pay/canonical. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/page" },
    example: { url: "https://example.com/page", count: 1, about: ["https://example.com/about"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const about = relHrefs(text, url, "about").slice(0, 20);
      return { url, count: about.length, about };
    },
  },
  "/pay/type": {
    summary: "rel=type links",
    description: "Extract RFC 6903 rel=type semantic type URLs from a public page. Distinct from /pay/profile, /pay/about, and /pay/alternate. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/item" },
    example: { url: "https://example.com/item", count: 1, type: ["https://example.com/vocab/Article"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const type = relHrefs(text, url, "type").slice(0, 20);
      return { url, count: type.length, type };
    },
  },
  "/pay/profile": {
    summary: "rel=profile links",
    description: "Extract RFC 6906 rel=profile constraint URLs from a public page. Distinct from /pay/type, /pay/about, and /pay/manifest. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/api/thing" },
    example: { url: "https://example.com/api/thing", count: 1, profile: ["https://example.com/profiles/thing"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const profile = relHrefs(text, url, "profile").slice(0, 20);
      return { url, count: profile.length, profile };
    },
  },
  "/pay/chapter": {
    summary: "rel=chapter links",
    description: "Extract HTML rel=chapter document URLs from a public page. Distinct from /pay/contents, /pay/index, and /pay/item. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/book" },
    example: { url: "https://example.com/book", count: 1, chapter: ["https://example.com/book/ch1"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const chapter = relHrefs(text, url, "chapter").slice(0, 20);
      return { url, count: chapter.length, chapter };
    },
  },
  "/pay/glossary": {
    summary: "rel=glossary links",
    description: "Extract HTML rel=glossary definition URLs from a public page. Distinct from /pay/help, /pay/contents, and /pay/describedby. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/docs/term" },
    example: { url: "https://example.com/docs/term", count: 1, glossary: ["https://example.com/docs/glossary"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const glossary = relHrefs(text, url, "glossary").slice(0, 20);
      return { url, count: glossary.length, glossary };
    },
  },
  "/pay/unclecounthash": {
    summary: "Base uncle count by hash",
    description: "eth_getUncleCountByBlockHash for the latest Base block hash. Distinct from number-based /pay/unclecount, /pay/uncles, and /pay/uncle. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", hash: "0x", uncleCount: 0, method: "eth_getUncleCountByBlockHash" },
    handler: async () => {
      const latest = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const hash = latest?.hash;
      if (!hash) throw new Error("Latest block hash missing");
      const countHex = await rpc(BASE_RPC, "eth_getUncleCountByBlockHash", [hash]);
      return {
        network: "base",
        method: "eth_getUncleCountByBlockHash",
        hash,
        blockNumber: latest?.number != null ? Number(hexToBigInt(latest.number)) : null,
        uncleCount: Number(hexToBigInt(countHex)),
      };
    },
  },
  "/pay/appendix": {
    summary: "rel=appendix links",
    description: "Extract HTML rel=appendix supplement URLs from a public page. Distinct from /pay/chapter, /pay/section, and /pay/contents. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/book" },
    example: { url: "https://example.com/book", count: 1, appendix: ["https://example.com/book/appendix-a"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const appendix = relHrefs(text, url, "appendix").slice(0, 20);
      return { url, count: appendix.length, appendix };
    },
  },
  "/pay/section": {
    summary: "rel=section links",
    description: "Extract HTML rel=section document URLs from a public page. Distinct from /pay/chapter, /pay/subsection, and /pay/contents. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/spec" },
    example: { url: "https://example.com/spec", count: 1, section: ["https://example.com/spec/s1"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const section = relHrefs(text, url, "section").slice(0, 20);
      return { url, count: section.length, section };
    },
  },
  "/pay/subsection": {
    summary: "rel=subsection links",
    description: "Extract HTML rel=subsection document URLs from a public page. Distinct from /pay/section, /pay/chapter, and /pay/item. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/spec/s1" },
    example: { url: "https://example.com/spec/s1", count: 1, subsection: ["https://example.com/spec/s1.1"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const subsection = relHrefs(text, url, "subsection").slice(0, 20);
      return { url, count: subsection.length, subsection };
    },
  },
  "/pay/current": {
    summary: "rel=current links",
    description: "Extract HTML rel=current series URLs from a public page. Distinct from /pay/first, /pay/last, and /pay/archives. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/feed" },
    example: { url: "https://example.com/feed", count: 1, current: ["https://example.com/feed/latest"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const current = relHrefs(text, url, "current").slice(0, 20);
      return { url, count: current.length, current };
    },
  },
  "/pay/payment": {
    summary: "rel=payment links",
    description: "Extract HTML rel=payment URLs from a public page. Distinct from /pay/tos, /pay/license, and /pay/copyright. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/product" },
    example: { url: "https://example.com/product", count: 1, payment: ["https://example.com/pay"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const payment = relHrefs(text, url, "payment").slice(0, 20);
      return { url, count: payment.length, payment };
    },
  },
  "/pay/txindexhash": {
    summary: "Base tx by block hash and index",
    description: "eth_getTransactionByBlockHashAndIndex for index 0 of the latest Base block hash. Distinct from number-based /pay/txindex, /pay/txlist, and /pay/txid. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", index: 0, found: true, hash: "0x", from: "0x", to: "0x", method: "eth_getTransactionByBlockHashAndIndex" },
    handler: async () => {
      const latest = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const blockHash = latest?.hash;
      if (!blockHash) throw new Error("Latest block hash missing");
      const tx = await rpc(BASE_RPC, "eth_getTransactionByBlockHashAndIndex", [blockHash, "0x0"]);
      if (!tx) return { network: "base", method: "eth_getTransactionByBlockHashAndIndex", blockHash, index: 0, found: false };
      return {
        network: "base",
        method: "eth_getTransactionByBlockHashAndIndex",
        blockHash,
        index: 0,
        found: true,
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        valueWei: hexToBigInt(tx.value).toString(),
        type: tx.type || null,
        blockNumber: tx.blockNumber ? Number(hexToBigInt(tx.blockNumber)) : null,
        transactionIndex: tx.transactionIndex != null ? Number(hexToBigInt(tx.transactionIndex)) : 0,
      };
    },
  },
  "/pay/preview": {
    summary: "rel=preview links",
    description: "Extract HTML rel=preview resource URLs from a public page. Distinct from /pay/preload, /pay/images, and /pay/og. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/article" },
    example: { url: "https://example.com/article", count: 1, preview: ["https://example.com/article/preview"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const preview = relHrefs(text, url, "preview").slice(0, 20);
      return { url, count: preview.length, preview };
    },
  },
  "/pay/latest-version": {
    summary: "rel=latest-version links",
    description: "Extract RFC 5829 rel=latest-version URLs from a public page. Distinct from /pay/version-history, /pay/current, and /pay/archives. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1" },
    example: { url: "https://example.com/doc/v1", count: 1, latestVersion: ["https://example.com/doc/latest"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const latestVersion = relHrefs(text, url, "latest-version").slice(0, 20);
      return { url, count: latestVersion.length, latestVersion };
    },
  },
  "/pay/version-history": {
    summary: "rel=version-history links",
    description: "Extract RFC 5829 rel=version-history URLs from a public page. Distinct from /pay/latest-version, /pay/archives, and /pay/collection. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1" },
    example: { url: "https://example.com/doc/v1", count: 1, versionHistory: ["https://example.com/doc/history"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const versionHistory = relHrefs(text, url, "version-history").slice(0, 20);
      return { url, count: versionHistory.length, versionHistory };
    },
  },
  "/pay/timegate": {
    summary: "Memento rel=timegate links",
    description: "Extract RFC 7089 rel=timegate URLs from a public page. Distinct from /pay/timemap, /pay/archives, and /pay/timezone. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/page" },
    example: { url: "https://example.com/page", count: 1, timegate: ["https://web.archive.org/web/https://example.com/page"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const timegate = relHrefs(text, url, "timegate").slice(0, 20);
      return { url, count: timegate.length, timegate };
    },
  },
  "/pay/timemap": {
    summary: "Memento rel=timemap links",
    description: "Extract RFC 7089 rel=timemap URLs from a public page. Distinct from /pay/timegate, /pay/sitemap, and /pay/archives. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/page" },
    example: { url: "https://example.com/page", count: 1, timemap: ["https://web.archive.org/web/timemap/link/https://example.com/page"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const timemap = relHrefs(text, url, "timemap").slice(0, 20);
      return { url, count: timemap.length, timemap };
    },
  },
  "/pay/unclehash": {
    summary: "Base uncle by block hash",
    description: "eth_getUncleByBlockHashAndIndex for index 0 of the latest Base block hash. Distinct from number-based /pay/uncle, /pay/unclecount, and /pay/unclecounthash. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", index: 0, found: false, hash: "0x", method: "eth_getUncleByBlockHashAndIndex" },
    handler: async () => {
      const latest = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const blockHash = latest?.hash;
      if (!blockHash) throw new Error("Latest block hash missing");
      let uncle = null;
      try {
        uncle = await rpc(BASE_RPC, "eth_getUncleByBlockHashAndIndex", [blockHash, "0x0"]);
      } catch {
        uncle = null;
      }
      if (!uncle) {
        return {
          network: "base",
          method: "eth_getUncleByBlockHashAndIndex",
          blockHash,
          index: 0,
          found: false,
          blockNumber: latest?.number != null ? Number(hexToBigInt(latest.number)) : null,
        };
      }
      return {
        network: "base",
        method: "eth_getUncleByBlockHashAndIndex",
        blockHash,
        index: 0,
        found: true,
        hash: uncle.hash || "",
        miner: uncle.miner || "",
        blockNumber: latest?.number != null ? Number(hexToBigInt(latest.number)) : null,
        uncleNumber: uncle.number != null ? Number(hexToBigInt(uncle.number)) : null,
      };
    },
  },
  "/pay/original": {
    summary: "Memento rel=original links",
    description: "Extract RFC 7089 rel=original URIs from a public page. Distinct from /pay/timegate, /pay/timemap, and /pay/canonical. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://web.archive.org/web/2020/https://example.com/" },
    example: { url: "https://web.archive.org/web/2020/https://example.com/", count: 1, original: ["https://example.com/"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const original = relHrefs(text, url, "original").slice(0, 20);
      return { url, count: original.length, original };
    },
  },
  "/pay/memento": {
    summary: "Memento rel=memento links",
    description: "Extract RFC 7089 rel=memento snapshot URLs from a public page. Distinct from /pay/original, /pay/timegate, and /pay/timemap. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/page" },
    example: { url: "https://example.com/page", count: 1, memento: ["https://web.archive.org/web/20200101000000/https://example.com/page"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const memento = relHrefs(text, url, "memento").slice(0, 20);
      return { url, count: memento.length, memento };
    },
  },
  "/pay/predecessor-version": {
    summary: "rel=predecessor-version links",
    description: "Extract RFC 5829 rel=predecessor-version URLs from a public page. Distinct from /pay/latest-version, /pay/version-history, and /pay/successor-version. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v2" },
    example: { url: "https://example.com/doc/v2", count: 1, predecessorVersion: ["https://example.com/doc/v1"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const predecessorVersion = relHrefs(text, url, "predecessor-version").slice(0, 20);
      return { url, count: predecessorVersion.length, predecessorVersion };
    },
  },
  "/pay/successor-version": {
    summary: "rel=successor-version links",
    description: "Extract RFC 5829 rel=successor-version URLs from a public page. Distinct from /pay/predecessor-version, /pay/latest-version, and /pay/version-history. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1" },
    example: { url: "https://example.com/doc/v1", count: 1, successorVersion: ["https://example.com/doc/v2"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const successorVersion = relHrefs(text, url, "successor-version").slice(0, 20);
      return { url, count: successorVersion.length, successorVersion };
    },
  },
  "/pay/working-copy": {
    summary: "rel=working-copy links",
    description: "Extract RFC 5829 rel=working-copy URLs from a public page. Distinct from /pay/latest-version, /pay/version-history, and /pay/edit. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1" },
    example: { url: "https://example.com/doc/v1", count: 1, workingCopy: ["https://example.com/doc/draft"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const workingCopy = relHrefs(text, url, "working-copy").slice(0, 20);
      return { url, count: workingCopy.length, workingCopy };
    },
  },
  "/pay/accesslist": {
    summary: "Base eth_createAccessList",
    description: "eth_createAccessList for a zero-value Base transfer to the receive wallet. Distinct from /pay/estimate, /pay/call, and /pay/getproof. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", to: "0xdD1729943bf7C408456cef52886ad12B05B57dC2", gasUsed: 21000, accessList: [] },
    handler: async () => {
      const result = await rpc(BASE_RPC, "eth_createAccessList", [{ to: PAY_TO, value: "0x0" }, "latest"]);
      const accessList = Array.isArray(result?.accessList) ? result.accessList : [];
      return {
        network: "base",
        method: "eth_createAccessList",
        to: PAY_TO,
        gasUsed: result?.gasUsed != null ? Number(hexToBigInt(result.gasUsed)) : null,
        gasUsedHex: result?.gasUsed || null,
        accessListCount: accessList.length,
        accessList,
      };
    },
  },
  "/pay/edit-media": {
    summary: "rel=edit-media links",
    description: "Extract AtomPub RFC 5023 rel=edit-media URLs from a public page. Distinct from /pay/edit, /pay/edituri, and /pay/enclosure. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/entry" },
    example: { url: "https://example.com/entry", count: 1, editMedia: ["https://example.com/atom/entry/1/media"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const editMedia = relHrefs(text, url, "edit-media").slice(0, 20);
      return { url, count: editMedia.length, editMedia };
    },
  },
  "/pay/next-archive": {
    summary: "rel=next-archive links",
    description: "Extract RFC 5005 rel=next-archive feed URLs from a public page. Distinct from /pay/archives, /pay/nextprev, and /pay/prev-archive. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/feed" },
    example: { url: "https://example.com/feed", count: 1, nextArchive: ["https://example.com/feed/2026"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const nextArchive = relHrefs(text, url, "next-archive").slice(0, 20);
      return { url, count: nextArchive.length, nextArchive };
    },
  },
  "/pay/prev-archive": {
    summary: "rel=prev-archive links",
    description: "Extract RFC 5005 rel=prev-archive feed URLs from a public page. Distinct from /pay/next-archive, /pay/archives, and /pay/nextprev. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/feed" },
    example: { url: "https://example.com/feed", count: 1, prevArchive: ["https://example.com/feed/2025"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const prevArchive = relHrefs(text, url, "prev-archive").slice(0, 20);
      return { url, count: prevArchive.length, prevArchive };
    },
  },
  "/pay/service": {
    summary: "rel=service links",
    description: "Extract Atom/RFC 5023 rel=service document URLs from a public page. Distinct from /pay/mcp, /pay/api-catalog, and /pay/openid. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/feed.atom" },
    example: { url: "https://example.com/feed.atom", count: 1, service: ["https://example.com/service.xml"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const service = relHrefs(text, url, "service").slice(0, 20);
      return { url, count: service.length, service };
    },
  },
  "/pay/monitor": {
    summary: "rel=monitor links",
    description: "Extract RFC 5989 rel=monitor URLs from a public page. Distinct from liveness /pay/ping, sync /pay/syncing, and /pay/listening. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/resource" },
    example: { url: "https://example.com/resource", count: 1, monitor: ["https://example.com/resource/monitor"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const monitor = relHrefs(text, url, "monitor").slice(0, 20);
      return { url, count: monitor.length, monitor };
    },
  },
  "/pay/rawtx": {
    summary: "Base raw signed transaction",
    description: "eth_getRawTransactionByHash for index 0 of the latest Base block. Distinct from decoded /pay/txindex, receipt /pay/txid, and hash list /pay/txlist. $0.002 USDC on Base.",
    price: "0.002",
    params: [],
    queryExample: {},
    example: { network: "base", index: 0, found: true, hash: "0x", raw: "0x02", method: "eth_getRawTransactionByHash" },
    handler: async () => {
      const latest = await rpc(BASE_RPC, "eth_getBlockByNumber", ["latest", false]);
      const txs = Array.isArray(latest?.transactions) ? latest.transactions : [];
      const hash = typeof txs[0] === "string" ? txs[0] : txs[0]?.hash;
      if (!hash) {
        return {
          network: "base",
          method: "eth_getRawTransactionByHash",
          index: 0,
          found: false,
          blockNumber: latest?.number != null ? Number(hexToBigInt(latest.number)) : null,
        };
      }
      let raw = null;
      let method = "eth_getRawTransactionByHash";
      try {
        raw = await rpc(BASE_RPC, "eth_getRawTransactionByHash", [hash]);
      } catch {
        try {
          raw = await rpc(BASE_RPC, "eth_getRawTransactionByBlockNumberAndIndex", ["latest", "0x0"]);
          method = "eth_getRawTransactionByBlockNumberAndIndex";
        } catch {
          raw = null;
        }
      }
      if (typeof raw === "string" && raw.startsWith("0x")) {
        return {
          network: "base",
          method,
          index: 0,
          found: true,
          hash,
          raw,
          rawBytes: Math.max(0, (raw.length - 2) / 2),
          blockNumber: latest?.number != null ? Number(hexToBigInt(latest.number)) : null,
        };
      }
      const tx = await rpc(BASE_RPC, "eth_getTransactionByHash", [hash]);
      return {
        network: "base",
        method: "eth_getTransactionByHash",
        index: 0,
        found: !!tx,
        hash,
        raw: null,
        type: tx?.type || null,
        v: tx?.v || null,
        r: tx?.r || null,
        s: tx?.s || null,
        input: tx?.input || null,
        chainId: tx?.chainId || null,
        blockNumber: latest?.number != null ? Number(hexToBigInt(latest.number)) : null,
      };
    },
  },
  "/pay/monitor-group": {
    summary: "rel=monitor-group links",
    description: "Extract RFC 5989 rel=monitor-group URLs from a public page. Distinct from /pay/monitor, /pay/ping, and /pay/syncing. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/resource" },
    example: { url: "https://example.com/resource", count: 1, monitorGroup: ["https://example.com/resource/monitors"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const monitorGroup = relHrefs(text, url, "monitor-group").slice(0, 20);
      return { url, count: monitorGroup.length, monitorGroup };
    },
  },
  "/pay/status": {
    summary: "rel=status links",
    description: "Extract RFC 8631 rel=status URLs from a public page. Distinct from liveness /pay/ping, /pay/syncing, and /pay/mining. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/order/42" },
    example: { url: "https://example.com/order/42", count: 1, status: ["https://example.com/order/42/status"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const status = relHrefs(text, url, "status").slice(0, 20);
      return { url, count: status.length, status };
    },
  },
  "/pay/duplicate": {
    summary: "rel=duplicate links",
    description: "Extract RFC 6249 Metalink rel=duplicate download URLs from a public page. Distinct from /pay/canonical, /pay/alternate, and /pay/enclosure. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/file.meta4" },
    example: { url: "https://example.com/file.meta4", count: 1, duplicate: ["https://mirror.example.net/file.bin"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const duplicate = relHrefs(text, url, "duplicate").slice(0, 20);
      return { url, count: duplicate.length, duplicate };
    },
  },
  "/pay/hosted-by": {
    summary: "rel=hosted-by links",
    description: "Extract IANA rel=hosted-by hosting endpoints from a public page. Distinct from /pay/host-meta, /pay/webfinger, and /pay/nodeinfo. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/.well-known/hosting" },
    example: { url: "https://example.com/.well-known/hosting", count: 1, hostedBy: ["https://host.example.net/"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const hostedBy = relHrefs(text, url, "hosted-by").slice(0, 20);
      return { url, count: hostedBy.length, hostedBy };
    },
  },
  "/pay/conversion": {
    summary: "rel=conversion links",
    description: "Extract RFC 7269 HELD rel=conversion URLs from a public page. Distinct from /pay/hreflang, /pay/alternate, and /pay/describedby. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/place" },
    example: { url: "https://example.com/place", count: 1, conversion: ["https://held.example.net/convert"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const conversion = relHrefs(text, url, "conversion").slice(0, 20);
      return { url, count: conversion.length, conversion };
    },
  },
  "/pay/derivedfrom": {
    summary: "rel=derivedfrom links",
    description: "Extract RFC 5829 rel=derivedfrom URLs from a public page. Distinct from /pay/working-copy, /pay/predecessor-version, and /pay/original. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/derived" },
    example: { url: "https://example.com/doc/derived", count: 1, derivedfrom: ["https://example.com/doc/source"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const derivedfrom = relHrefs(text, url, "derivedfrom").slice(0, 20);
      return { url, count: derivedfrom.length, derivedfrom };
    },
  },
  "/pay/service-desc": {
    summary: "rel=service-desc links",
    description: "Extract RFC 8631 rel=service-desc machine-readable service description URLs from a public page. Distinct from /pay/service, /pay/api-catalog, and /pay/openapi via discovery. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/api" },
    example: { url: "https://example.com/api", count: 1, serviceDesc: ["https://example.com/api/openapi.json"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const serviceDesc = relHrefs(text, url, "service-desc").slice(0, 20);
      return { url, count: serviceDesc.length, serviceDesc };
    },
  },
  "/pay/service-doc": {
    summary: "rel=service-doc links",
    description: "Extract RFC 8631 rel=service-doc human-readable service documentation URLs from a public page. Distinct from /pay/service-desc, /pay/help, and /pay/describedby. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/api" },
    example: { url: "https://example.com/api", count: 1, serviceDoc: ["https://example.com/api/docs"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const serviceDoc = relHrefs(text, url, "service-doc").slice(0, 20);
      return { url, count: serviceDoc.length, serviceDoc };
    },
  },
  "/pay/service-meta": {
    summary: "rel=service-meta links",
    description: "Extract RFC 8631 rel=service-meta service metadata URLs from a public page. Distinct from /pay/service, /pay/service-desc, and /pay/host-meta. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/api" },
    example: { url: "https://example.com/api", count: 1, serviceMeta: ["https://example.com/api/meta"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const serviceMeta = relHrefs(text, url, "service-meta").slice(0, 20);
      return { url, count: serviceMeta.length, serviceMeta };
    },
  },
  "/pay/blocked-by": {
    summary: "rel=blocked-by links",
    description: "Extract RFC 7725 rel=blocked-by legal-block authority URLs from Link headers and HTML. Distinct from /pay/security, /pay/csp, and /pay/privacy-policy. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/blocked" },
    example: {
      url: "https://example.com/blocked",
      status: 451,
      count: 1,
      blockedBy: ["https://spqr.example.org/decree"],
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "blocked-by");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "blocked-by");
      const blockedBy = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, status: fetched.status, count: blockedBy.length, blockedBy };
    },
  },
  "/pay/sunset": {
    summary: "Sunset header and rel=sunset",
    description: "Read RFC 8594 Sunset deprecation timestamp and rel=sunset successor URLs. Distinct from /pay/latest-version, /pay/version-history, and /pay/predecessor-version. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/legacy" },
    example: {
      url: "https://example.com/legacy",
      sunset: "Sat, 31 Dec 2026 23:59:59 GMT",
      count: 1,
      successors: ["https://example.com/v2"],
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const sunset = (fetched.headers.get("sunset") || "").trim();
      const fromHtml = relHrefs(fetched.text, fetched.url, "sunset");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "sunset");
      const successors = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, sunset, count: successors.length, successors };
    },
  },
  "/pay/describes": {
    summary: "rel=describes links",
    description: "Extract RFC 6892 rel=describes subject URLs (inverse of describedby) from a public page. Distinct from /pay/describedby, /pay/about, and /pay/profile. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/data.json" },
    example: { url: "https://example.com/data.json", count: 1, describes: ["https://example.com/item"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const describes = relHrefs(text, url, "describes").slice(0, 20);
      return { url, count: describes.length, describes };
    },
  },
  "/pay/lrdd": {
    summary: "rel=lrdd descriptor links",
    description: "Extract RFC 6415 rel=lrdd Link-based Resource Descriptor Discovery URLs from HTML and Link headers. Distinct from /pay/host-meta, /pay/webfinger, and /pay/describedby. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/user" },
    example: { url: "https://example.com/user", count: 1, lrdd: ["https://example.com/user.xrd"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "lrdd");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "lrdd");
      const lrdd = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: lrdd.length, lrdd };
    },
  },
  "/pay/restconf": {
    summary: "RESTCONF well-known entry",
    description: "Fetch RFC 8040 /.well-known/restconf for a public host. Distinct from /pay/core, /pay/api-catalog, and /pay/service-desc. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "example.com" },
    example: {
      host: "example.com",
      url: "https://example.com/.well-known/restconf",
      status: 200,
      restconf: "https://example.com/restconf",
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const fetched = await fetchPublic(`https://${host}/.well-known/restconf`);
      const fromHtml = relHrefs(fetched.text, fetched.url, "restconf");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "restconf");
      const location = (fetched.headers.get("location") || "").trim();
      const restconf = [...new Set([location, ...fromHeader, ...fromHtml].filter(Boolean))].slice(0, 20);
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
        restconf,
        json: parsed,
        text: parsed ? undefined : fetched.text.slice(0, 20_000),
      };
    },
  },
  "/pay/create-form": {
    summary: "rel=create-form links",
    description: "Extract IANA rel=create-form URLs from a public page. Distinct from /pay/edit, /pay/edit-form, and /pay/collection. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/items" },
    example: { url: "https://example.com/items", count: 1, createForm: ["https://example.com/items/new"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const createForm = relHrefs(text, url, "create-form").slice(0, 20);
      return { url, count: createForm.length, createForm };
    },
  },
  "/pay/edit-form": {
    summary: "rel=edit-form links",
    description: "Extract IANA rel=edit-form URLs from a public page. Distinct from /pay/edit, /pay/edit-media, and /pay/create-form. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/items/42" },
    example: { url: "https://example.com/items/42", count: 1, editForm: ["https://example.com/items/42/edit"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const editForm = relHrefs(text, url, "edit-form").slice(0, 20);
      return { url, count: editForm.length, editForm };
    },
  },
  "/pay/source": {
    summary: "rel=source links",
    description: "Extract IANA rel=source URLs from a public page. Distinct from /pay/original, /pay/derivedfrom, and /pay/describedby. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/page" },
    example: { url: "https://example.com/page", count: 1, source: ["https://example.com/page.src"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const source = relHrefs(text, url, "source").slice(0, 20);
      return { url, count: source.length, source };
    },
  },
  "/pay/disclosure": {
    summary: "rel=disclosure links",
    description: "Extract RFC 6579 rel=disclosure copyright-claim URLs from a public page. Distinct from /pay/copyright, /pay/license, and /pay/blocked-by. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/work" },
    example: { url: "https://example.com/work", count: 1, disclosure: ["https://example.com/copyright"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const disclosure = relHrefs(text, url, "disclosure").slice(0, 20);
      return { url, count: disclosure.length, disclosure };
    },
  },
  "/pay/cite-as": {
    summary: "rel=cite-as links",
    description: "Extract RFC 8574 rel=cite-as persistent citation URLs from HTML and Link headers. Distinct from /pay/canonical, /pay/describedby, and /pay/source. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/paper" },
    example: { url: "https://example.com/paper", count: 1, citeAs: ["https://doi.org/10.1000/example"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "cite-as");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "cite-as");
      const citeAs = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: citeAs.length, citeAs };
    },
  },
  "/pay/convertedfrom": {
    summary: "rel=convertedFrom links",
    description: "Extract IANA rel=convertedFrom source-format URLs from a public page. Distinct from /pay/derivedfrom, /pay/conversion, and /pay/source. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc.pdf" },
    example: { url: "https://example.com/doc.pdf", count: 1, convertedFrom: ["https://example.com/doc.odt"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const convertedFrom = relHrefs(text, url, "convertedFrom").slice(0, 20);
      return { url, count: convertedFrom.length, convertedFrom };
    },
  },
  "/pay/hosts": {
    summary: "rel=hosts collection links",
    description: "Extract RFC 6690 rel=hosts collection URLs from HTML and Link headers. Distinct from /pay/host-meta, /pay/dns, and /pay/ns. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/.well-known/core" },
    example: { url: "https://example.com/.well-known/core", count: 1, hosts: ["https://example.com/"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "hosts");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "hosts");
      const hosts = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: hosts.length, hosts };
    },
  },
  "/pay/linkset": {
    summary: "rel=linkset documents",
    description: "Extract RFC 9264 rel=linkset document URLs from HTML and Link headers. Distinct from /pay/links, /pay/related, and /pay/describedby. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/item" },
    example: { url: "https://example.com/item", count: 1, linkset: ["https://example.com/item.linkset"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "linkset");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "linkset");
      const linkset = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: linkset.length, linkset };
    },
  },
  "/pay/ruleinput": {
    summary: "rel=ruleinput links",
    description: "Extract RFC 6903 rel=ruleinput URLs from a public page. Distinct from /pay/describedby, /pay/profile, and /pay/type. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/policy" },
    example: { url: "https://example.com/policy", count: 1, ruleinput: ["https://example.com/policy/input"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const ruleinput = relHrefs(text, url, "ruleinput").slice(0, 20);
      return { url, count: ruleinput.length, ruleinput };
    },
  },
  "/pay/timesheet": {
    summary: "rel=timesheet links",
    description: "Extract RFC 6903 rel=timesheet URLs from a public page. Distinct from /pay/time, /pay/timemap, and /pay/timegate. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/project" },
    example: { url: "https://example.com/project", count: 1, timesheet: ["https://example.com/project/timesheet"] },
    handler: async (q) => {
      const { url, text } = await fetchPublic(q.get("url"));
      const timesheet = relHrefs(text, url, "timesheet").slice(0, 20);
      return { url, count: timesheet.length, timesheet };
    },
  },
  "/pay/intervalafter": {
    summary: "rel=intervalAfter links",
    description: "Extract RFC 5829 rel=intervalAfter version URLs from HTML and Link headers. Distinct from /pay/successor-version, /pay/next-archive, and /pay/version-history. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1" },
    example: { url: "https://example.com/doc/v1", count: 1, intervalAfter: ["https://example.com/doc/v2"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalAfter");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalAfter");
      const intervalAfter = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalAfter.length, intervalAfter };
    },
  },
  "/pay/intervalbefore": {
    summary: "rel=intervalBefore links",
    description: "Extract RFC 5829 rel=intervalBefore version URLs from HTML and Link headers. Distinct from /pay/predecessor-version, /pay/prev-archive, and /pay/intervalafter. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v2" },
    example: { url: "https://example.com/doc/v2", count: 1, intervalBefore: ["https://example.com/doc/v1"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalBefore");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalBefore");
      const intervalBefore = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalBefore.length, intervalBefore };
    },
  },
  "/pay/intervalcontains": {
    summary: "rel=intervalContains links",
    description: "Extract RFC 5829 rel=intervalContains version URLs from HTML and Link headers. Distinct from /pay/intervalafter, /pay/intervalbefore, and /pay/memento. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/range" },
    example: { url: "https://example.com/doc/range", count: 1, intervalContains: ["https://example.com/doc/v1.1"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalContains");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalContains");
      const intervalContains = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalContains.length, intervalContains };
    },
  },
  "/pay/sponsored": {
    summary: "rel=sponsored links",
    description: "Extract HTML rel=sponsored URLs from a public page and Link headers. Distinct from /pay/ads, /pay/funding, and /pay/payment. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/article" },
    example: { url: "https://example.com/article", count: 1, sponsored: ["https://sponsor.example/offer"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "sponsored");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "sponsored");
      const sponsored = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: sponsored.length, sponsored };
    },
  },
  "/pay/longdesc": {
    summary: "HTML longdesc URLs",
    description: "Extract img/iframe/frame longdesc URLs plus rel=longdesc links from a public page. Distinct from /pay/images, /pay/describedby, and /pay/alternate. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/chart" },
    example: { url: "https://example.com/chart", count: 1, longdesc: ["https://example.com/chart.txt"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<(?:img|iframe|frame)\b[^>]*>/gi) || [];
      const fromAttr = [];
      for (const tag of tags) {
        const href = (tag.match(/\blongdesc=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(fetched.url, href) : null;
        if (abs) fromAttr.push(abs);
      }
      const fromRel = relHrefs(fetched.text, fetched.url, "longdesc");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "longdesc");
      const longdesc = [...new Set([...fromHeader, ...fromRel, ...fromAttr])].slice(0, 20);
      return { url: fetched.url, count: longdesc.length, longdesc };
    },
  },
  "/pay/intervaldisjoint": {
    summary: "rel=intervalDisjoint links",
    description: "Extract RFC 5829 rel=intervalDisjoint version URLs from HTML and Link headers. Distinct from /pay/intervalafter, /pay/intervalbefore, and /pay/intervalcontains. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1" },
    example: { url: "https://example.com/doc/v1", count: 1, intervalDisjoint: ["https://example.com/doc/other"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalDisjoint");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalDisjoint");
      const intervalDisjoint = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalDisjoint.length, intervalDisjoint };
    },
  },
  "/pay/intervalduring": {
    summary: "rel=intervalDuring links",
    description: "Extract RFC 5829 rel=intervalDuring version URLs from HTML and Link headers. Distinct from /pay/intervalcontains, /pay/intervalafter, and /pay/memento. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1.1" },
    example: { url: "https://example.com/doc/v1.1", count: 1, intervalDuring: ["https://example.com/doc/range"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalDuring");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalDuring");
      const intervalDuring = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalDuring.length, intervalDuring };
    },
  },
  "/pay/intervalequals": {
    summary: "rel=intervalEquals links",
    description: "Extract RFC 5829 rel=intervalEquals version URLs from HTML and Link headers. Distinct from /pay/duplicate, /pay/canonical, and /pay/intervalduring. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/a" },
    example: { url: "https://example.com/doc/a", count: 1, intervalEquals: ["https://example.com/doc/b"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalEquals");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalEquals");
      const intervalEquals = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalEquals.length, intervalEquals };
    },
  },
  "/pay/intervalmeets": {
    summary: "rel=intervalMeets links",
    description: "Extract RFC 5829 rel=intervalMeets version URLs from HTML and Link headers. Distinct from /pay/intervalafter, /pay/successor-version, and /pay/intervaloverlaps. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1" },
    example: { url: "https://example.com/doc/v1", count: 1, intervalMeets: ["https://example.com/doc/v2"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalMeets");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalMeets");
      const intervalMeets = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalMeets.length, intervalMeets };
    },
  },
  "/pay/intervaloverlaps": {
    summary: "rel=intervalOverlaps links",
    description: "Extract RFC 5829 rel=intervalOverlaps version URLs from HTML and Link headers. Distinct from /pay/intervalmeets, /pay/intervalcontains, and /pay/intervalduring. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/range-a" },
    example: { url: "https://example.com/doc/range-a", count: 1, intervalOverlaps: ["https://example.com/doc/range-b"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalOverlaps");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalOverlaps");
      const intervalOverlaps = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalOverlaps.length, intervalOverlaps };
    },
  },
  "/pay/intervalstarts": {
    summary: "rel=intervalStarts links",
    description: "Extract RFC 5829 rel=intervalStarts version URLs from HTML and Link headers. Distinct from /pay/first, /pay/intervalduring, and /pay/version-history. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1" },
    example: { url: "https://example.com/doc/v1", count: 1, intervalStarts: ["https://example.com/doc/range"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalStarts");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalStarts");
      const intervalStarts = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalStarts.length, intervalStarts };
    },
  },
  "/pay/external": {
    summary: "rel=external links",
    description: "Extract HTML rel=external URLs from a public page and Link headers. Distinct from /pay/sponsored, /pay/links, and /pay/canonical. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/article" },
    example: { url: "https://example.com/article", count: 1, external: ["https://other.example/page"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "external");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "external");
      const external = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: external.length, external };
    },
  },
  "/pay/intervalfinishedby": {
    summary: "rel=intervalFinishedBy links",
    description: "Extract RFC 5829 rel=intervalFinishedBy version URLs from HTML and Link headers. Distinct from /pay/intervalfinishes, /pay/last, and /pay/intervalstarts. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/range" },
    example: { url: "https://example.com/doc/range", count: 1, intervalFinishedBy: ["https://example.com/doc/v9"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalFinishedBy");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalFinishedBy");
      const intervalFinishedBy = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalFinishedBy.length, intervalFinishedBy };
    },
  },
  "/pay/intervalfinishes": {
    summary: "rel=intervalFinishes links",
    description: "Extract RFC 5829 rel=intervalFinishes version URLs from HTML and Link headers. Distinct from /pay/intervalfinishedby, /pay/last, and /pay/intervalduring. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v9" },
    example: { url: "https://example.com/doc/v9", count: 1, intervalFinishes: ["https://example.com/doc/range"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalFinishes");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalFinishes");
      const intervalFinishes = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalFinishes.length, intervalFinishes };
    },
  },
  "/pay/intervalin": {
    summary: "rel=intervalIn links",
    description: "Extract RFC 5829 rel=intervalIn version URLs from HTML and Link headers. Distinct from /pay/intervalduring, /pay/intervalcontains, and /pay/memento. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v1.1" },
    example: { url: "https://example.com/doc/v1.1", count: 1, intervalIn: ["https://example.com/doc/range"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalIn");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalIn");
      const intervalIn = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalIn.length, intervalIn };
    },
  },
  "/pay/intervalmetby": {
    summary: "rel=intervalMetBy links",
    description: "Extract RFC 5829 rel=intervalMetBy version URLs from HTML and Link headers. Distinct from /pay/intervalmeets, /pay/predecessor-version, and /pay/intervalbefore. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/v2" },
    example: { url: "https://example.com/doc/v2", count: 1, intervalMetBy: ["https://example.com/doc/v1"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalMetBy");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalMetBy");
      const intervalMetBy = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalMetBy.length, intervalMetBy };
    },
  },
  "/pay/intervaloverlappedby": {
    summary: "rel=intervalOverlappedBy links",
    description: "Extract RFC 5829 rel=intervalOverlappedBy version URLs from HTML and Link headers. Distinct from /pay/intervaloverlaps, /pay/intervalcontains, and /pay/intervalduring. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/range-b" },
    example: { url: "https://example.com/doc/range-b", count: 1, intervalOverlappedBy: ["https://example.com/doc/range-a"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalOverlappedBy");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalOverlappedBy");
      const intervalOverlappedBy = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalOverlappedBy.length, intervalOverlappedBy };
    },
  },
  "/pay/intervalstartedby": {
    summary: "rel=intervalStartedBy links",
    description: "Extract RFC 5829 rel=intervalStartedBy version URLs from HTML and Link headers. Distinct from /pay/intervalstarts, /pay/first, and /pay/intervalcontains. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/doc/range" },
    example: { url: "https://example.com/doc/range", count: 1, intervalStartedBy: ["https://example.com/doc/v1"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "intervalStartedBy");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "intervalStartedBy");
      const intervalStartedBy = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: intervalStartedBy.length, intervalStartedBy };
    },
  },
  "/pay/nofollow": {
    summary: "rel=nofollow links",
    description: "Extract HTML rel=nofollow URLs from a public page and Link headers. Distinct from /pay/sponsored, /pay/external, and untyped /pay/links. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/article" },
    example: { url: "https://example.com/article", count: 1, nofollow: ["https://untrusted.example/page"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "nofollow");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "nofollow");
      const nofollow = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: nofollow.length, nofollow };
    },
  },
  "/pay/noreferrer": {
    summary: "rel=noreferrer links",
    description: "Extract HTML rel=noreferrer URLs from a public page and Link headers. Distinct from /pay/nofollow, /pay/noopener, and /pay/external. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/article" },
    example: { url: "https://example.com/article", count: 1, noreferrer: ["https://other.example/page"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "noreferrer");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "noreferrer");
      const noreferrer = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: noreferrer.length, noreferrer };
    },
  },
  "/pay/noopener": {
    summary: "rel=noopener links",
    description: "Extract HTML rel=noopener URLs from a public page and Link headers. Distinct from /pay/noreferrer, /pay/opener, and /pay/external. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/article" },
    example: { url: "https://example.com/article", count: 1, noopener: ["https://other.example/page"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "noopener");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "noopener");
      const noopener = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: noopener.length, noopener };
    },
  },
  "/pay/opener": {
    summary: "rel=opener links",
    description: "Extract HTML rel=opener URLs from a public page and Link headers. Distinct from /pay/noopener, /pay/noreferrer, and /pay/external. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/article" },
    example: { url: "https://example.com/article", count: 1, opener: ["https://trusted.example/page"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "opener");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "opener");
      const opener = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: opener.length, opener };
    },
  },
  "/pay/apple-touch-icon": {
    summary: "Apple touch icons",
    description: "Extract rel=apple-touch-icon and apple-touch-icon-precomposed icons with sizes. Distinct from generic /pay/favicon and Safari /pay/mask-icon. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      count: 1,
      icons: [{ href: "https://example.com/apple-touch-icon.png", sizes: "180x180", precomposed: false }],
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<link\b[^>]*>/gi) || [];
      const icons = [];
      const seen = new Set();
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        const tokens = rel.split(/\s+/);
        const precomposed = tokens.includes("apple-touch-icon-precomposed");
        if (!precomposed && !tokens.includes("apple-touch-icon")) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(fetched.url, href) : null;
        if (!abs) continue;
        const sizes = (tag.match(/\bsizes=["']([^"']+)["']/i) || [])[1] || "";
        const key = `${abs}|${sizes}|${precomposed}`;
        if (seen.has(key)) continue;
        seen.add(key);
        icons.push({ href: abs, sizes, precomposed });
      }
      const sliced = icons.slice(0, 20);
      return { url: fetched.url, count: sliced.length, icons: sliced };
    },
  },
  "/pay/mask-icon": {
    summary: "Safari mask-icon",
    description: "Extract Safari pinned-tab rel=mask-icon URLs and colors from a public page. Distinct from /pay/favicon and /pay/apple-touch-icon. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      count: 1,
      icons: [{ href: "https://example.com/safari-pinned-tab.svg", color: "#000000" }],
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<link\b[^>]*>/gi) || [];
      const icons = [];
      const seen = new Set();
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (!rel.split(/\s+/).includes("mask-icon")) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(fetched.url, href) : null;
        if (!abs) continue;
        const color = (tag.match(/\bcolor=["']([^"']+)["']/i) || [])[1] || "";
        const key = `${abs}|${color}`;
        if (seen.has(key)) continue;
        seen.add(key);
        icons.push({ href: abs, color });
      }
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "mask-icon");
      for (const href of fromHeader) {
        const key = `${href}|`;
        if (seen.has(key)) continue;
        seen.add(key);
        icons.push({ href, color: "" });
      }
      const sliced = icons.slice(0, 20);
      return { url: fetched.url, count: sliced.length, icons: sliced };
    },
  },
  "/pay/ugc": {
    summary: "rel=ugc links",
    description: "Extract HTML rel=ugc (user-generated content) URLs from a public page and Link headers. Distinct from /pay/nofollow, /pay/sponsored, and /pay/external. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/comments" },
    example: { url: "https://example.com/comments", count: 1, ugc: ["https://user.example/post"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "ugc");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "ugc");
      const ugc = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: ugc.length, ugc };
    },
  },
  "/pay/apple-touch-startup-image": {
    summary: "Apple startup images",
    description: "Extract rel=apple-touch-startup-image splash screens with media queries. Distinct from /pay/apple-touch-icon, /pay/mask-icon, and /pay/favicon. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      count: 1,
      images: [{ href: "https://example.com/splash.png", media: "(device-width: 320px)" }],
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<link\b[^>]*>/gi) || [];
      const images = [];
      const seen = new Set();
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (!rel.split(/\s+/).includes("apple-touch-startup-image")) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(fetched.url, href) : null;
        if (!abs) continue;
        const media = (tag.match(/\bmedia=["']([^"']+)["']/i) || [])[1] || "";
        const key = `${abs}|${media}`;
        if (seen.has(key)) continue;
        seen.add(key);
        images.push({ href: abs, media });
      }
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "apple-touch-startup-image");
      for (const href of fromHeader) {
        const key = `${href}|`;
        if (seen.has(key)) continue;
        seen.add(key);
        images.push({ href, media: "" });
      }
      const sliced = images.slice(0, 20);
      return { url: fetched.url, count: sliced.length, images: sliced };
    },
  },
  "/pay/fluid-icon": {
    summary: "Fluid app icons",
    description: "Extract rel=fluid-icon URLs and titles used by Fluid/site-specific browsers. Distinct from /pay/favicon, /pay/apple-touch-icon, and /pay/mask-icon. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      count: 1,
      icons: [{ href: "https://example.com/fluid.png", title: "Example" }],
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<link\b[^>]*>/gi) || [];
      const icons = [];
      const seen = new Set();
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (!rel.split(/\s+/).includes("fluid-icon")) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(fetched.url, href) : null;
        if (!abs) continue;
        const title = decodeEntities((tag.match(/\btitle=["']([^"']+)["']/i) || [])[1] || "");
        const key = `${abs}|${title}`;
        if (seen.has(key)) continue;
        seen.add(key);
        icons.push({ href: abs, title });
      }
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "fluid-icon");
      for (const href of fromHeader) {
        const key = `${href}|`;
        if (seen.has(key)) continue;
        seen.add(key);
        icons.push({ href, title: "" });
      }
      const sliced = icons.slice(0, 20);
      return { url: fetched.url, count: sliced.length, icons: sliced };
    },
  },
  "/pay/wlwmanifest": {
    summary: "Windows Live Writer manifest",
    description: "Extract rel=wlwmanifest Windows Live Writer XML URLs from a public page and Link headers. Distinct from /pay/edituri, /pay/wpjson, and /pay/manifest. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/blog" },
    example: { url: "https://example.com/blog", count: 1, wlwmanifest: ["https://example.com/wp-includes/wlwmanifest.xml"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "wlwmanifest");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "wlwmanifest");
      const wlwmanifest = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return { url: fetched.url, count: wlwmanifest.length, wlwmanifest };
    },
  },
  "/pay/compression-dictionary": {
    summary: "Compression dictionaries",
    description: "Extract rel=compression-dictionary URLs plus Use-As-Dictionary and Available-Dictionary headers. Distinct from /pay/preload, /pay/headers, and /pay/csp. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/app" },
    example: {
      url: "https://example.com/app",
      count: 1,
      dictionaries: ["https://example.com/dict.dat"],
      useAsDictionary: 'match="/js/*"',
      availableDictionary: "",
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const fromHtml = relHrefs(fetched.text, fetched.url, "compression-dictionary");
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "compression-dictionary");
      const dictionaries = [...new Set([...fromHeader, ...fromHtml])].slice(0, 20);
      return {
        url: fetched.url,
        count: dictionaries.length,
        dictionaries,
        useAsDictionary: fetched.headers.get("use-as-dictionary") || "",
        availableDictionary: fetched.headers.get("available-dictionary") || "",
      };
    },
  },
  "/pay/openid2-provider": {
    summary: "OpenID 2.0 provider",
    description: "Extract HTML rel=openid2.provider discovery URLs from a public page and Link headers. Distinct from /pay/openid, /pay/openid-federation, and /pay/webfinger. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/~user" },
    example: { url: "https://example.com/~user", count: 1, provider: ["https://openid.example/server"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<(?:link|a)\b[^>]*>/gi) || [];
      const provider = [];
      const seen = new Set();
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (!rel.split(/\s+/).includes("openid2.provider")) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(fetched.url, href) : null;
        if (!abs || seen.has(abs)) continue;
        seen.add(abs);
        provider.push(abs);
      }
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "openid2\\.provider");
      for (const href of fromHeader) {
        if (seen.has(href)) continue;
        seen.add(href);
        provider.push(href);
      }
      const sliced = provider.slice(0, 20);
      return { url: fetched.url, count: sliced.length, provider: sliced };
    },
  },
  "/pay/openid2-local-id": {
    summary: "OpenID 2.0 local id",
    description: "Extract HTML rel=openid2.local_id claimed identifiers from a public page and Link headers. Distinct from /pay/openid2-provider, /pay/openid, and /pay/webfinger. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/~user" },
    example: { url: "https://example.com/~user", count: 1, localId: ["https://example.com/~user"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<(?:link|a)\b[^>]*>/gi) || [];
      const localId = [];
      const seen = new Set();
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (!rel.split(/\s+/).includes("openid2.local_id")) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(fetched.url, href) : null;
        if (!abs || seen.has(abs)) continue;
        seen.add(abs);
        localId.push(abs);
      }
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "openid2\\.local_id");
      for (const href of fromHeader) {
        if (seen.has(href)) continue;
        seen.add(href);
        localId.push(href);
      }
      const sliced = localId.slice(0, 20);
      return { url: fetched.url, count: sliced.length, localId: sliced };
    },
  },
  "/pay/apple-itunes-app": {
    summary: "Smart App Banner",
    description: "Extract Apple Smart App Banner meta apple-itunes-app content (app-id, affiliate-data, app-argument). Distinct from /pay/aasa, /pay/apple-touch-icon, and /pay/apple-merchantid. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      content: "app-id=123456789, app-argument=https://example.com/item",
      appId: "123456789",
      affiliateData: "",
      appArgument: "https://example.com/item",
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<meta\b[^>]*>/gi) || [];
      let content = "";
      for (const tag of tags) {
        const name = ((tag.match(/\bname=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (name !== "apple-itunes-app") continue;
        content = decodeEntities((tag.match(/\bcontent=["']([^"']*)["']/i) || [])[1] || "");
        if (content) break;
      }
      const parts = Object.fromEntries(
        content
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
          .map((part) => {
            const eq = part.indexOf("=");
            if (eq < 0) return [part.toLowerCase(), ""];
            return [part.slice(0, eq).trim().toLowerCase(), part.slice(eq + 1).trim()];
          }),
      );
      return {
        url: fetched.url,
        content,
        appId: parts["app-id"] || "",
        affiliateData: parts["affiliate-data"] || "",
        appArgument: parts["app-argument"] || "",
      };
    },
  },
  "/pay/msapplication-config": {
    summary: "IE browserconfig.xml",
    description: "Extract meta msapplication-config / browserconfig.xml URLs for pinned IE/Windows tiles. Distinct from /pay/manifest, /pay/favicon, and /pay/apple-touch-icon. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com", count: 1, config: ["https://example.com/browserconfig.xml"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const config = [];
      const seen = new Set();
      const push = (href) => {
        const abs = href ? absUrl(fetched.url, href) : null;
        if (!abs || seen.has(abs)) return;
        seen.add(abs);
        config.push(abs);
      };
      const metaTags = fetched.text.match(/<meta\b[^>]*>/gi) || [];
      for (const tag of metaTags) {
        const name = ((tag.match(/\bname=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (name !== "msapplication-config") continue;
        push((tag.match(/\bcontent=["']([^"']*)["']/i) || [])[1]);
      }
      const linkTags = fetched.text.match(/<link\b[^>]*>/gi) || [];
      for (const tag of linkTags) {
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1] || "";
        const type = ((tag.match(/\btype=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (type.includes("browserconfig") || rel.includes("msapplication-config") || /browserconfig\.xml(?:$|\?)/i.test(href)) {
          push(href);
        }
      }
      const sliced = config.slice(0, 20);
      return { url: fetched.url, count: sliced.length, config: sliced };
    },
  },
  "/pay/image-src": {
    summary: "rel=image_src",
    description: "Extract HTML rel=image_src share images from a public page and Link headers. Distinct from /pay/og, /pay/images, and /pay/favicon. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/post" },
    example: { url: "https://example.com/post", count: 1, images: ["https://example.com/share.png"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<(?:link|a)\b[^>]*>/gi) || [];
      const images = [];
      const seen = new Set();
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (!rel.split(/\s+/).includes("image_src")) continue;
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1];
        const abs = href ? absUrl(fetched.url, href) : null;
        if (!abs || seen.has(abs)) continue;
        seen.add(abs);
        images.push(abs);
      }
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "image_src");
      for (const href of fromHeader) {
        if (seen.has(href)) continue;
        seen.add(href);
        images.push(href);
      }
      const sliced = images.slice(0, 20);
      return { url: fetched.url, count: sliced.length, images: sliced };
    },
  },
  "/pay/rsd": {
    summary: "Really Simple Discovery",
    description: "Extract application/rsd+xml discovery documents (rel=rsd, rsd.xml, or type=application/rsd+xml). Distinct from /pay/edituri (rel=EditURI only), /pay/wlwmanifest, and /pay/wpjson. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com/blog" },
    example: { url: "https://example.com/blog", count: 1, rsd: ["https://example.com/xmlrpc.php?rsd"] },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<(?:link|a)\b[^>]*>/gi) || [];
      const rsd = [];
      const seen = new Set();
      for (const tag of tags) {
        const rel = ((tag.match(/\brel=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        const type = ((tag.match(/\btype=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        const href = (tag.match(/\bhref=["']([^"']+)["']/i) || [])[1] || "";
        const relTokens = rel.split(/\s+/);
        const isRsd =
          relTokens.includes("rsd") ||
          type === "application/rsd+xml" ||
          /(?:^|[/?&=.])rsd(?:$|[/?&=.])/i.test(href) ||
          /rsd\.xml(?:$|\?)/i.test(href);
        if (!isRsd) continue;
        const abs = absUrl(fetched.url, href);
        if (!abs || seen.has(abs)) continue;
        seen.add(abs);
        rsd.push(abs);
      }
      const fromHeader = relFromLinkHeader(fetched.headers.get("link") || "", fetched.url, "rsd");
      for (const href of fromHeader) {
        if (seen.has(href)) continue;
        seen.add(href);
        rsd.push(href);
      }
      const sliced = rsd.slice(0, 20);
      return { url: fetched.url, count: sliced.length, rsd: sliced };
    },
  },
  "/pay/theme-color": {
    summary: "theme-color meta",
    description: "Extract theme-color meta values and optional media queries from a public page. Distinct from /pay/mask-icon (Safari pinned color), /pay/meta, and /pay/manifest. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: {
      url: "https://example.com",
      count: 2,
      colors: [
        { color: "#ffffff", media: "" },
        { color: "#000000", media: "(prefers-color-scheme: dark)" },
      ],
    },
    handler: async (q) => {
      const fetched = await fetchPublic(q.get("url"));
      const tags = fetched.text.match(/<meta\b[^>]*>/gi) || [];
      const colors = [];
      const seen = new Set();
      for (const tag of tags) {
        const name = ((tag.match(/\bname=["']([^"']+)["']/i) || [])[1] || "").toLowerCase();
        if (name !== "theme-color") continue;
        const color = decodeEntities((tag.match(/\bcontent=["']([^"']*)["']/i) || [])[1] || "").trim();
        if (!color) continue;
        const media = decodeEntities((tag.match(/\bmedia=["']([^"']*)["']/i) || [])[1] || "");
        const key = `${color}|${media}`;
        if (seen.has(key)) continue;
        seen.add(key);
        colors.push({ color, media });
      }
      const sliced = colors.slice(0, 20);
      return { url: fetched.url, count: sliced.length, colors: sliced };
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
