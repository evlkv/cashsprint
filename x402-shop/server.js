const PAY_TO = "0xdD1729943bf7C408456cef52886ad12B05B57dC2";
const USDC = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const NETWORK = "eip155:8453";
const ORIGIN = process.env.ORIGIN || "https://volkov.evgeny.m2.fvds.ru";
const VERSION = "1.9.0";
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
    headers: { "user-agent": "CashSprint-Fetch/1.9" },
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
    example: { host: "example.com", aaaa: ["2606:2800:220:1:248:1893:25c8:1946"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const aaaa = (await doh(host, "AAAA")).map((s) => String(s).trim());
      return { host, aaaa };
    },
  },
  "/pay/cname": {
    summary: "DNS CNAME record",
    description: "Canonical name record for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "www.example.com" },
    example: { host: "www.example.com", cname: ["example.com"] },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const cname = (await doh(host, "CNAME")).map((s) => String(s).replace(/\.$/, ""));
      return { host, cname };
    },
  },
  "/pay/srv": {
    summary: "DNS SRV records",
    description: "Service records for a public domain. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "host", required: true }],
    queryExample: { host: "_xmpp-server._tcp.gmail.com" },
    example: {
      host: "_xmpp-server._tcp.gmail.com",
      srv: [{ priority: 5, weight: 0, port: 5269, target: "xmpp-server.l.google.com" }],
    },
    handler: async (q) => {
      const host = String(q.get("host") || "").trim().toLowerCase();
      if (!host || isPrivateHost(host)) throw new Error("Invalid host");
      const srv = (await doh(host, "SRV")).map((s) => {
        const m = String(s).trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(\S+)/);
        return m
          ? { priority: Number(m[1]), weight: Number(m[2]), port: Number(m[3]), target: m[4].replace(/\.$/, "") }
          : { priority: null, weight: null, port: null, target: String(s).replace(/\.$/, "") };
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
    example: { url: "https://example.com/app-ads.txt", status: 200, text: "placeholder.example.com, pub-000, DIRECT" },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/app-ads.txt`;
      const { url, status, text } = await fetchPublic(target);
      return { url, status, text: text.slice(0, 20_000) };
    },
  },
  "/pay/openid": {
    summary: "OpenID configuration",
    description: "Fetch /.well-known/openid-configuration from a public origin. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://accounts.google.com" },
    example: {
      url: "https://accounts.google.com/.well-known/openid-configuration",
      status: 200,
      issuer: "https://accounts.google.com",
      authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth",
    },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/.well-known/openid-configuration`;
      const { url, status, text } = await fetchPublic(target);
      let issuer = "";
      let authorizationEndpoint = "";
      try {
        const parsed = JSON.parse(text);
        issuer = String(parsed.issuer || "");
        authorizationEndpoint = String(parsed.authorization_endpoint || "");
      } catch {}
      return { url, status, issuer, authorizationEndpoint, text: text.slice(0, 20_000) };
    },
  },
  "/pay/aasa": {
    summary: "Apple App Site Association",
    description: "Fetch /.well-known/apple-app-site-association from a public origin. $0.002 USDC on Base.",
    price: "0.002",
    params: [{ name: "url", required: true }],
    queryExample: { url: "https://example.com" },
    example: { url: "https://example.com/.well-known/apple-app-site-association", status: 200, applinks: true },
    handler: async (q) => {
      const page = assertPublicHttpUrl(q.get("url"));
      const target = `${page.origin}/.well-known/apple-app-site-association`;
      const { url, status, text } = await fetchPublic(target);
      let applinks = false;
      let webcredentials = false;
      try {
        const parsed = JSON.parse(text);
        applinks = Boolean(parsed.applinks);
        webcredentials = Boolean(parsed.webcredentials);
      } catch {}
      return { url, status, applinks, webcredentials, text: text.slice(0, 20_000) };
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
