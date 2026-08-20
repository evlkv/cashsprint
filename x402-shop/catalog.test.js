import { readFileSync } from "node:fs";
import { test, expect } from "bun:test";
import { keccak256Hex, toChecksumAddress, selector, VERSION, PAY_TO } from "./server.js";

const source = readFileSync(new URL("./server.js", import.meta.url), "utf8");
const pkg = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf8"));

const routePaths = [...source.matchAll(/"(\/pay\/[a-z0-9-]+)"\s*:/g)].map((m) => m[1]);

const LIVE_1_4_0 = [
  "ping",
  "og",
  "extract",
  "gas",
  "ipfs",
  "dns",
  "headers",
  "rss",
  "links",
  "robots",
  "balance",
  "redirects",
  "sitemap",
  "json",
  "jwt",
  "jsonld",
  "meta",
  "images",
  "feeds",
  "token",
  "nonce",
  "hash",
  "outline",
  "canonical",
  "manifest",
  "block",
  "contract",
  "ns",
];

const LIVE_EXTRA = [
  "offer-proof",
  "commerce-page-audit",
  "commerce-schema-fix",
  "feed-page-match",
  "feed-batch-match",
  "merchant-feed-audit",
];

const BATCH_1_5_0 = ["whois", "cert", "ens", "txid", "favicon", "keywords"];
const BATCH_1_6_0 = ["spf", "dmarc", "hreflang", "llms", "checksum", "supply"];
const BATCH_1_7_0 = ["mx", "caa", "security", "ads", "keccak", "basefee"];
const BATCH_1_8_0 = ["txt", "soa", "humans", "assetlinks", "priority", "selector"];
const BATCH_1_9_0 = ["aaaa", "cname", "srv", "app-ads", "openid", "aasa"];
const BATCH_1_10_0 = ["naptr", "ptr", "svcb", "hsts", "cors", "chainid"];
const BATCH_1_11_0 = ["tlsa", "sshfp", "ds", "csp", "webfinger", "blockhash"];
const BATCH_1_12_0 = ["dnskey", "dkim", "mta-sts", "nodeinfo", "proxy", "blobbasefee"];
const BATCH_1_13_0 = ["cds", "rrsig", "bimi", "oembed", "storage", "feehistory"];
const BATCH_1_14_0 = ["nsec", "cdnskey", "uri", "host-meta", "maxpriority", "coinbase"];
const BATCH_1_15_0 = ["nsec3", "smimea", "loc", "atproto", "gasused", "txcount"];
const BATCH_1_16_0 = ["nsec3param", "openpgpkey", "dname", "did", "nostr", "blocksize"];
const BATCH_1_17_0 = ["zonemd", "hinfo", "rp", "jwks", "farcaster", "clientversion"];
const BATCH_1_18_0 = ["csync", "kx", "dhcid", "oauth", "gpc", "syncing"];
const BATCH_1_19_0 = ["hip", "ipseckey", "eui64", "matrix", "passkey", "peercount"];
const BATCH_1_20_0 = ["eui48", "nid", "webauthn", "caldav", "carddav", "listening"];
const BATCH_1_21_0 = ["l32", "l64", "lp", "opensearch", "keybase", "blobgasused"];
const BATCH_1_22_0 = ["afsdb", "dlv", "amtrelay", "stellar", "tdmrep", "code"];
const BATCH_1_23_0 = ["apl", "ta", "doa", "mcp", "protected", "stateroot"];
const BATCH_1_24_0 = ["wallet", "dsync", "resinfo", "agent-card", "trust", "receiptsroot"];
const BATCH_1_25_0 = ["key", "sig", "nxt", "ai-plugin", "related", "txroot"];
const BATCH_1_26_0 = ["tlsrpt", "wks", "rt", "dnt", "did-config", "logsbloom"];
const BATCH_1_27_0 = ["dnscert", "avc", "nsap", "change-password", "web-identity", "extradata"];
const BATCH_1_28_0 = ["gpos", "px", "minfo", "webmention", "oid4vci", "withdrawals"];
const BATCH_1_29_0 = ["x25", "isdn", "ninfo", "jmap", "csaf", "mixhash"];
const BATCH_1_30_0 = ["eid", "nimloc", "atma", "core", "uma", "uncles"];
const BATCH_1_31_0 = ["nsap-ptr", "rkey", "talink", "xrpl", "publiccode", "difficulty"];
const BATCH_1_32_0 = ["a6", "sink", "mb", "funding", "gnap", "excessblobgas"];
const BATCH_1_33_0 = ["mg", "mr", "md", "masque", "mercure", "beaconroot"];
const BATCH_1_34_0 = ["mf", "uid", "gid", "lnurlp", "oauth-as", "requestshash"];
const BATCH_1_35_0 = ["uinfo", "unspec", "tkey", "api-catalog", "oauth-pr", "hashrate"];
const BATCH_1_36_0 = ["tsig", "opt", "nxname", "privacy", "timezone", "protocol"];
const BATCH_1_37_0 = ["null", "any", "time", "posh", "cmp", "mining"];
const BATCH_1_38_0 = ["ixfr", "axfr", "mailb", "est", "hoba", "accounts"];
const BATCH_1_39_0 = ["maila", "acme", "ni", "stun-key", "looking-glass", "netversion"];
const BATCH_1_40_0 = ["http-opportunistic", "repute", "reload", "void", "pki-validation", "blocknonce"];
const BATCH_1_41_0 = ["openid-federation", "traffic-advice", "csaf-aggregator", "apple-merchantid", "privacy-sandbox", "unclecount"];
const BATCH_1_42_0 = ["smart", "wkd", "resourcesync", "matrix-client", "autoconfig", "txlist"];
const BATCH_1_43_0 = ["browserid", "csvm", "openorg", "idp-proxy", "genid", "estimate"];
const BATCH_1_44_0 = ["amphtml", "discord", "gs1", "thread", "ets", "txindex"];
const BATCH_1_45_0 = ["ashrae", "hhit", "brid", "relme", "shortlink", "getproof"];

const PRIOR = [
  ...LIVE_1_4_0,
  ...BATCH_1_5_0,
  ...BATCH_1_6_0,
  ...BATCH_1_7_0,
  ...BATCH_1_8_0,
  ...BATCH_1_9_0,
  ...BATCH_1_10_0,
  ...BATCH_1_11_0,
  ...BATCH_1_12_0,
  ...BATCH_1_13_0,
  ...BATCH_1_14_0,
  ...BATCH_1_15_0,
  ...BATCH_1_16_0,
  ...BATCH_1_17_0,
  ...BATCH_1_18_0,
  ...BATCH_1_19_0,
  ...BATCH_1_20_0,
  ...BATCH_1_21_0,
  ...BATCH_1_22_0,
  ...BATCH_1_23_0,
  ...BATCH_1_24_0,
  ...BATCH_1_25_0,
  ...BATCH_1_26_0,
  ...BATCH_1_27_0,
  ...BATCH_1_28_0,
  ...BATCH_1_29_0,
  ...BATCH_1_30_0,
  ...BATCH_1_31_0,
  ...BATCH_1_32_0,
  ...BATCH_1_33_0,
  ...BATCH_1_34_0,
  ...BATCH_1_35_0,
  ...BATCH_1_36_0,
  ...BATCH_1_37_0,
  ...BATCH_1_38_0,
  ...BATCH_1_39_0,
  ...BATCH_1_40_0,
  ...BATCH_1_41_0,
  ...BATCH_1_42_0,
  ...BATCH_1_43_0,
  ...BATCH_1_44_0,
];

test("shop version is 1.45.0", () => {
  expect(pkg.version).toBe("1.45.0");
  expect(source).toContain('const VERSION = "1.45.0"');
});

test("pay routes are unique", () => {
  expect(routePaths.length).toBeGreaterThan(0);
  expect(new Set(routePaths).size).toBe(routePaths.length);
});

test("keeps live and previous catalog paths", () => {
  for (const name of PRIOR) {
    expect(routePaths).toContain(`/pay/${name}`);
  }
});

test("adds six new 1.45.0 pay routes", () => {
  for (const name of BATCH_1_45_0) {
    expect(routePaths).toContain(`/pay/${name}`);
  }
});

test("new routes are not duplicates of earlier catalogs", () => {
  const prior = new Set([...PRIOR, ...LIVE_EXTRA]);
  for (const name of BATCH_1_45_0) {
    expect(prior.has(name)).toBe(false);
  }
});

test("keccak256 and EIP-55 helpers", () => {
  expect(VERSION).toBe("1.45.0");
  expect(keccak256Hex("")).toBe("c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  expect(keccak256Hex("hello")).toBe("1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8");
  expect(selector("totalSupply()")).toBe("0x18160ddd");
  expect(selector("transfer(address,uint256)")).toBe("0xa9059cbb");
  expect(toChecksumAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed")).toBe(
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  );
  expect(toChecksumAddress(PAY_TO.toLowerCase())).toBe(PAY_TO);
});
