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
const BATCH_1_46_0 = ["coap", "sbom", "wot", "terraform", "license", "blockreceipts"];
const BATCH_1_47_0 = ["author", "hub", "nextprev", "pingback", "preload", "uncle"];
const BATCH_1_48_0 = ["help", "tag", "bookmark", "edituri", "describedby", "call"];
const BATCH_1_49_0 = ["privacy-policy", "tos", "micropub", "microsub", "wpjson", "logs"];
const BATCH_1_50_0 = ["stylesheet", "alternate", "edit", "up", "enclosure", "pending"];
const BATCH_1_51_0 = ["first", "last", "archives", "via", "replies", "blockbyhash"];
const BATCH_1_52_0 = ["index", "contents", "collection", "item", "copyright", "txcounthash"];
const BATCH_1_53_0 = ["about", "type", "profile", "chapter", "glossary", "unclecounthash"];
const BATCH_1_54_0 = ["appendix", "section", "subsection", "current", "payment", "txindexhash"];
const BATCH_1_55_0 = ["preview", "latest-version", "version-history", "timegate", "timemap", "unclehash"];
const BATCH_1_56_0 = ["original", "memento", "predecessor-version", "successor-version", "working-copy", "accesslist"];
const BATCH_1_57_0 = ["edit-media", "next-archive", "prev-archive", "service", "monitor", "rawtx"];
const BATCH_1_58_0 = ["monitor-group", "status", "duplicate", "hosted-by", "conversion", "derivedfrom"];
const BATCH_1_59_0 = ["service-desc", "service-doc", "service-meta", "blocked-by", "sunset", "describes"];
const BATCH_1_60_0 = ["lrdd", "restconf", "create-form", "edit-form", "source", "disclosure"];
const BATCH_1_61_0 = ["cite-as", "convertedfrom", "hosts", "linkset", "ruleinput", "timesheet"];
const BATCH_1_62_0 = ["intervalafter", "intervalbefore", "intervalcontains", "sponsored", "longdesc", "intervaldisjoint"];
const BATCH_1_63_0 = ["intervalduring", "intervalequals", "intervalmeets", "intervaloverlaps", "intervalstarts", "external"];
const BATCH_1_64_0 = ["intervalfinishedby", "intervalfinishes", "intervalin", "intervalmetby", "intervaloverlappedby", "intervalstartedby"];
const BATCH_1_65_0 = ["nofollow", "noreferrer", "noopener", "opener", "apple-touch-icon", "mask-icon"];
const BATCH_1_66_0 = ["ugc", "apple-touch-startup-image", "fluid-icon", "wlwmanifest", "compression-dictionary", "openid2-provider"];
const BATCH_1_67_0 = ["openid2-local-id", "apple-itunes-app", "msapplication-config", "image-src", "rsd", "theme-color"];
const BATCH_1_68_0 = ["apple-mobile-web-app-title", "application-name", "color-scheme", "msapplication-tilecolor", "msapplication-tileimage", "format-detection"];
const BATCH_1_69_0 = ["apple-mobile-web-app-capable", "apple-mobile-web-app-status-bar-style", "mobile-web-app-capable", "viewport", "referrer", "generator"];
const BATCH_1_70_0 = ["x-ua-compatible", "refresh", "default-style", "content-language", "googlebot", "rating"];
const BATCH_1_71_0 = ["content-type", "charset", "cache-control", "expires", "pragma", "google-site-verification"];
const BATCH_1_72_0 = ["bing-site-verification", "yandex-verification", "facebook-domain-verification", "pinterest-site-verification", "csrf-token", "revisit-after"];
const BATCH_1_73_0 = ["baidu-site-verification", "norton-safeweb-site-verification", "csrf-param", "geo-region", "icbm", "description"];
const BATCH_1_74_0 = ["classification", "news-keywords", "coverage", "distribution", "identifier-url", "reply-to"];
const BATCH_1_75_0 = ["subject", "topic", "designer", "publisher", "owner", "handheld-friendly"];
const BATCH_1_76_0 = ["audience", "date", "created", "revised", "pagename", "subtitle"];
const BATCH_1_77_0 = ["title", "dc-type", "format", "rights", "contributor", "relation"];
const BATCH_1_78_0 = ["alternative", "issued", "available", "valid", "extent", "medium"];
const BATCH_1_79_0 = ["temporal", "bibliographic-citation", "is-part-of", "has-part", "is-version-of", "has-version"];
const BATCH_1_80_0 = ["is-format-of", "has-format", "references", "is-referenced-by", "requires", "is-required-by"];
const BATCH_1_81_0 = ["replaces", "is-replaced-by", "conforms-to", "access-rights", "provenance", "rights-holder"];
const BATCH_1_82_0 = ["accrual-method", "accrual-periodicity", "accrual-policy", "education-level", "instructional-method", "mediator"];
const BATCH_1_83_0 = ["date-accepted", "date-copyrighted", "date-submitted", "table-of-contents", "citation-title", "citation-author"];
const BATCH_1_84_0 = ["citation-doi", "citation-journal-title", "citation-publication-date", "citation-pdf-url", "citation-volume", "citation-issue"];
const BATCH_1_85_0 = ["citation-firstpage", "citation-lastpage", "citation-issn", "citation-isbn", "citation-abstract-html-url", "citation-fulltext-html-url"];
const BATCH_1_86_0 = ["citation-keywords", "citation-language", "citation-publisher", "citation-date", "citation-year", "citation-month"];
const BATCH_1_87_0 = ["citation-online-date", "citation-conference-title", "citation-pmid", "citation-author-institution", "citation-journal-abbrev", "citation-abstract"];
const BATCH_1_88_0 = ["citation-fulltext-world-readable", "citation-technical-report-number", "citation-technical-report-institution", "citation-dissertation-institution", "citation-author-email", "citation-author-orcid"];
const BATCH_1_89_0 = ["citation-reference", "citation-dissertation-name", "citation-public-url", "citation-section", "citation-id", "citation-editor"];
const BATCH_1_90_0 = ["citation-collection-title", "citation-series-title", "citation-conference-place", "citation-conference-date", "citation-patent-number", "citation-patent-country"];
const BATCH_1_91_0 = ["citation-mjid", "citation-publisher-location", "citation-day", "citation-cover-date", "citation-volume-title", "citation-inbook-title"];
const BATCH_1_92_0 = ["citation-id-from-sass-path", "citation-collection-id", "citation-authors", "citation-price", "citation-abstract-pdf-url", "citation-arxiv-id"];
const BATCH_1_93_0 = ["citation-pmc", "citation-pmcid", "citation-pii", "citation-sici", "citation-oclc", "citation-type"];
const BATCH_1_94_0 = ["citation-nihmsid", "citation-manuscript-id", "citation-publisher-id", "citation-elocation-id", "citation-article-type", "citation-xml-url"];
const BATCH_1_95_0 = ["citation-eissn", "citation-issn-print", "citation-issn-online", "citation-isbn-print", "citation-html-url", "citation-funder"];
const BATCH_1_96_0 = ["citation-isbn-online", "citation-eisbn", "citation-issn-linking", "citation-funder-id", "citation-funding-source", "citation-grant-number"];
const BATCH_1_97_0 = ["citation-isbn-electronic", "citation-isbn-ebook", "citation-issn-electronic", "citation-funder-name", "citation-grant-id", "citation-award-number"];
const BATCH_1_98_0 = ["citation-isbn13", "citation-isbn10", "citation-eisbn13", "citation-award-id", "citation-funder-doi", "citation-funding-statement"];
const BATCH_1_99_0 = ["citation-eisbn10", "citation-isbn-hardcover", "citation-isbn-paperback", "citation-funder-identifier", "citation-award-doi", "citation-funding-agency"];
const BATCH_1_100_0 = ["citation-eisbn-hardcover", "citation-eisbn-paperback", "citation-isbn-softcover", "citation-funder-ror", "citation-grant-doi", "citation-issn13"];
const BATCH_1_101_0 = ["citation-issn10", "citation-eissn13", "citation-eissn10", "citation-isbn-cloth", "citation-eisbn-softcover", "citation-funder-rorid"];
const BATCH_1_102_0 = ["citation-isbn-hardback", "citation-eisbn-cloth", "citation-isbn-trade", "citation-issn8", "citation-coden", "citation-funder-ror-id"];
const BATCH_1_103_0 = ["citation-eisbn-hardback", "citation-isbn-casebound", "citation-isbn-pbk", "citation-eissn8", "citation-lccn", "citation-funder-isni"];
const BATCH_1_104_0 = ["citation-eisbn-casebound", "citation-eisbn-trade", "citation-eisbn-pbk", "citation-isbn-library", "citation-funder-grid", "citation-funder-wikidata"];
const BATCH_1_105_0 = ["citation-eisbn-library", "citation-isbn-school", "citation-isbn-mass-market", "citation-isbn-pocket", "citation-funder-crossref", "citation-funder-fundref"];
const BATCH_1_106_0 = ["citation-eisbn-school", "citation-eisbn-mass-market", "citation-eisbn-pocket", "citation-isbn-textbook", "citation-funder-orcid", "citation-isbn-spiral"];
const BATCH_1_107_0 = ["citation-eisbn-textbook", "citation-eisbn-spiral", "citation-isbn-workbook", "citation-isbn-looseleaf", "citation-isbn-instructor", "citation-funder-ringgold"];
const BATCH_1_108_0 = ["citation-eisbn-workbook", "citation-eisbn-looseleaf", "citation-eisbn-instructor", "citation-isbn-lab", "citation-isbn-desk", "citation-funder-viaf"];
const BATCH_1_109_0 = ["citation-eisbn-lab", "citation-eisbn-desk", "citation-isbn-exam", "citation-isbn-solutions", "citation-funder-lei", "citation-author-viaf"];
const BATCH_1_110_0 = ["citation-eisbn-exam", "citation-eisbn-solutions", "citation-author-isni", "citation-author-researchid", "citation-author-scopus", "citation-isbn-international"];
const BATCH_1_111_0 = ["citation-eisbn-international", "citation-isbn-global", "citation-author-researcherid", "citation-author-wos", "citation-author-loop", "citation-isbn-european"];
const BATCH_1_112_0 = ["citation-eisbn-global", "citation-eisbn-european", "citation-author-publons", "citation-author-clarivate", "citation-isbn-uk", "citation-author-rid"];
const BATCH_1_113_0 = ["citation-eisbn-uk", "citation-isbn-us", "citation-eisbn-us", "citation-isbn-au", "citation-author-researchgate", "citation-author-webofscience"];
const BATCH_1_114_0 = ["citation-eisbn-au", "citation-isbn-ca", "citation-eisbn-ca", "citation-isbn-nz", "citation-author-dimensions", "citation-author-mendeley"];
const BATCH_1_115_0 = ["citation-eisbn-nz", "citation-isbn-za", "citation-eisbn-za", "citation-isbn-ie", "citation-author-semanticscholar", "citation-author-googlescholar"];
const BATCH_1_116_0 = ["citation-eisbn-ie", "citation-isbn-in", "citation-eisbn-in", "citation-isbn-sg", "citation-author-pubmed", "citation-author-arxiv"];
const BATCH_1_117_0 = ["citation-eisbn-sg", "citation-isbn-hk", "citation-eisbn-hk", "citation-isbn-my", "citation-author-pmc", "citation-author-ssrn"];
const BATCH_1_118_0 = ["citation-eisbn-my", "citation-isbn-ph", "citation-eisbn-ph", "citation-isbn-th", "citation-author-ncbi", "citation-author-repec"];
const BATCH_1_119_0 = ["citation-eisbn-th", "citation-isbn-id", "citation-eisbn-id", "citation-isbn-vn", "citation-author-nih", "citation-author-sciprofiles"];
const BATCH_1_120_0 = ["citation-eisbn-vn", "citation-isbn-tw", "citation-eisbn-tw", "citation-isbn-kr", "citation-author-nihms", "citation-author-figshare"];
const BATCH_1_121_0 = ["citation-eisbn-kr", "citation-isbn-jp", "citation-eisbn-jp", "citation-isbn-cn", "citation-author-academia", "citation-author-linkedin"];
const BATCH_1_122_0 = ["citation-eisbn-cn", "citation-isbn-br", "citation-eisbn-br", "citation-isbn-mx", "citation-author-twitter", "citation-author-mastodon"];
const BATCH_1_123_0 = ["citation-eisbn-mx", "citation-isbn-ar", "citation-eisbn-ar", "citation-isbn-cl", "citation-author-bluesky", "citation-author-facebook"];
const BATCH_1_124_0 = ["citation-eisbn-cl", "citation-isbn-co", "citation-eisbn-co", "citation-isbn-pe", "citation-author-instagram", "citation-author-threads"];
const BATCH_1_125_0 = ["citation-eisbn-pe", "citation-isbn-ec", "citation-eisbn-ec", "citation-isbn-uy", "citation-author-youtube", "citation-author-tiktok"];
const BATCH_1_126_0 = ["citation-eisbn-uy", "citation-isbn-py", "citation-eisbn-py", "citation-isbn-bo", "citation-author-vimeo", "citation-author-pinterest"];
const BATCH_1_127_0 = ["citation-eisbn-bo", "citation-isbn-ve", "citation-eisbn-ve", "citation-isbn-cr", "citation-author-snapchat", "citation-author-twitch"];
const BATCH_1_128_0 = ["citation-eisbn-cr", "citation-isbn-pa", "citation-eisbn-pa", "citation-isbn-gt", "citation-author-reddit", "citation-author-discord"];
const BATCH_1_129_0 = ["citation-eisbn-gt", "citation-isbn-hn", "citation-eisbn-hn", "citation-isbn-sv", "citation-author-telegram", "citation-author-whatsapp"];
const BATCH_1_130_0 = ["citation-eisbn-sv", "citation-isbn-ni", "citation-eisbn-ni", "citation-isbn-bz", "citation-author-signal", "citation-author-line"];
const BATCH_1_131_0 = ["citation-eisbn-bz", "citation-isbn-cu", "citation-eisbn-cu", "citation-isbn-do", "citation-author-wechat", "citation-author-kik"];
const BATCH_1_132_0 = ["citation-eisbn-do", "citation-isbn-ht", "citation-eisbn-ht", "citation-isbn-jm", "citation-author-skype", "citation-author-viber"];
const BATCH_1_133_0 = ["citation-eisbn-jm", "citation-isbn-tt", "citation-eisbn-tt", "citation-isbn-bb", "citation-author-icq", "citation-author-aim"];
const BATCH_1_134_0 = ["citation-eisbn-bb", "citation-isbn-bs", "citation-eisbn-bs", "citation-isbn-lc", "citation-author-yahoo", "citation-author-msn"];
const BATCH_1_135_0 = ["citation-eisbn-lc", "citation-isbn-gd", "citation-eisbn-gd", "citation-isbn-vc", "citation-author-aol", "citation-author-hotmail"];
const BATCH_1_136_0 = ["citation-eisbn-vc", "citation-isbn-ag", "citation-eisbn-ag", "citation-isbn-kn", "citation-author-gmail", "citation-author-live"];
const BATCH_1_137_0 = ["citation-eisbn-kn", "citation-isbn-dm", "citation-eisbn-dm", "citation-isbn-ky", "citation-author-outlook", "citation-author-icloud"];
const BATCH_1_138_0 = ["citation-eisbn-ky", "citation-isbn-ms", "citation-eisbn-ms", "citation-isbn-ai", "citation-author-me", "citation-author-mac"];
const BATCH_1_139_0 = ["citation-eisbn-ai", "citation-isbn-vg", "citation-eisbn-vg", "citation-isbn-tc", "citation-author-mobileme", "citation-author-mecom"];
const BATCH_1_140_0 = ["citation-eisbn-tc", "citation-isbn-aw", "citation-eisbn-aw", "citation-isbn-cw", "citation-author-macmail", "citation-author-dotmac"];
const BATCH_1_141_0 = ["citation-eisbn-cw", "citation-isbn-sx", "citation-eisbn-sx", "citation-isbn-bq", "citation-author-maccom", "citation-author-icloudcom"];
const BATCH_1_142_0 = ["citation-eisbn-bq", "citation-isbn-mf", "citation-eisbn-mf", "citation-isbn-bl", "citation-author-appleid", "citation-author-apple"];
const BATCH_1_143_0 = ["citation-eisbn-bl", "citation-isbn-pm", "citation-eisbn-pm", "citation-isbn-gp", "citation-author-applemail", "citation-author-icloudmail"];
const BATCH_1_144_0 = ["citation-eisbn-gp", "citation-isbn-mq", "citation-eisbn-mq", "citation-isbn-gf", "citation-author-icloudid", "citation-author-icloudplus"];
const BATCH_1_145_0 = ["citation-eisbn-gf", "citation-isbn-re", "citation-eisbn-re", "citation-isbn-yt", "citation-author-icloudkey", "citation-author-icloudaccount"];
const BATCH_1_146_0 = ["citation-eisbn-yt", "citation-isbn-nc", "citation-eisbn-nc", "citation-isbn-pf", "citation-author-iclouduser", "citation-author-icloudalias"];
const BATCH_1_147_0 = ["citation-eisbn-pf", "citation-isbn-wf", "citation-eisbn-wf", "citation-isbn-tf", "citation-author-icloudlogin", "citation-author-icloudhandle"];
const BATCH_1_148_0 = ["citation-eisbn-tf", "citation-isbn-fo", "citation-eisbn-fo", "citation-isbn-gl", "citation-author-icloudtoken", "citation-author-icloudsession"];
const BATCH_1_149_0 = ["citation-eisbn-gl", "citation-isbn-sj", "citation-eisbn-sj", "citation-isbn-ax", "citation-author-icloudnonce", "citation-author-icloudcookie"];
const BATCH_1_150_0 = ["citation-eisbn-ax", "citation-isbn-gg", "citation-eisbn-gg", "citation-isbn-je", "citation-author-icloudcsrf", "citation-author-iclouddevice"];
const BATCH_1_151_0 = ["citation-eisbn-je", "citation-isbn-im", "citation-eisbn-im", "citation-isbn-gi", "citation-author-icloududid", "citation-author-icloudserial"];
const BATCH_1_152_0 = ["citation-eisbn-gi", "citation-isbn-fk", "citation-eisbn-fk", "citation-isbn-io", "citation-author-icloudimei", "citation-author-icloudmeid"];
const BATCH_1_153_0 = ["citation-eisbn-io", "citation-isbn-sh", "citation-eisbn-sh", "citation-isbn-ac", "citation-author-icloudimsi", "citation-author-icloudiccid"];
const BATCH_1_154_0 = ["citation-eisbn-ac", "citation-isbn-ta", "citation-eisbn-ta", "citation-isbn-gs", "citation-author-icloudmsisdn", "citation-author-icloudeid"];
const BATCH_1_155_0 = ["citation-eisbn-gs", "citation-isbn-pn", "citation-eisbn-pn", "citation-isbn-bv", "citation-author-iclouduuid", "citation-author-icloudesn"];
const BATCH_1_156_0 = ["citation-eisbn-bv", "citation-isbn-hm", "citation-eisbn-hm", "citation-isbn-um", "citation-author-icloudwifimac", "citation-author-icloudbtaddr"];
const BATCH_1_157_0 = ["citation-eisbn-um", "citation-isbn-aq", "citation-eisbn-aq", "citation-isbn-eh", "citation-author-icloudwifiip", "citation-author-icloudblemac"];
const BATCH_1_158_0 = ["citation-eisbn-eh", "citation-isbn-ps", "citation-eisbn-ps", "citation-isbn-ic", "citation-author-icloudbleip", "citation-author-icloudwifiipv6"];
const BATCH_1_159_0 = ["citation-eisbn-ic", "citation-isbn-ea", "citation-eisbn-ea", "citation-isbn-eu", "citation-author-icloudbleipv6", "citation-author-icloudbtip"];
const BATCH_1_160_0 = ["citation-eisbn-eu", "citation-isbn-ez", "citation-eisbn-ez", "citation-isbn-fx", "citation-author-icloudbtipv6", "citation-author-icloudcellip"];
const BATCH_1_161_0 = ["citation-eisbn-fx", "citation-isbn-su", "citation-eisbn-su", "citation-isbn-un", "citation-author-icloudcellipv6", "citation-author-icloudcellmac"];
const BATCH_1_162_0 = ["citation-eisbn-un", "citation-isbn-cp", "citation-eisbn-cp", "citation-isbn-dg", "citation-author-icloudcellgw", "citation-author-icloudcellimei"];
const BATCH_1_163_0 = ["citation-eisbn-dg", "citation-isbn-aa", "citation-eisbn-aa", "citation-isbn-qm", "citation-author-icloudcellimsi", "citation-author-icloudcelliccid"];
const BATCH_1_164_0 = ["citation-eisbn-qm", "citation-isbn-qn", "citation-eisbn-qn", "citation-isbn-qo", "citation-author-icloudcellmsisdn", "citation-author-icloudcelleid"];
const BATCH_1_165_0 = ["citation-eisbn-qo", "citation-isbn-qp", "citation-eisbn-qp", "citation-isbn-qq", "citation-author-icloudcelluuid", "citation-author-icloudcellsn"];
const BATCH_1_166_0 = ["citation-eisbn-qq", "citation-isbn-qr", "citation-eisbn-qr", "citation-isbn-qs", "citation-author-icloudcellwifimac", "citation-author-icloudcellbtaddr"];
const BATCH_1_167_0 = ["citation-eisbn-qs", "citation-isbn-qt", "citation-eisbn-qt", "citation-isbn-qu", "citation-author-icloudcellwifiip", "citation-author-icloudcellblemac"];
const BATCH_1_168_0 = ["citation-eisbn-qu", "citation-isbn-qv", "citation-eisbn-qv", "citation-isbn-qw", "citation-author-icloudcellbleip", "citation-author-icloudcellwifiipv6"];
const BATCH_1_169_0 = ["citation-eisbn-qw", "citation-isbn-qx", "citation-eisbn-qx", "citation-isbn-qy", "citation-author-icloudcellbleipv6", "citation-author-icloudcellbtip"];
const BATCH_1_170_0 = ["citation-eisbn-qy", "citation-isbn-qz", "citation-eisbn-qz", "citation-isbn-ra", "citation-author-icloudcellbtipv6", "citation-author-icloudcellnfcip"];
const BATCH_1_171_0 = ["citation-eisbn-ra", "citation-isbn-rb", "citation-eisbn-rb", "citation-isbn-rc", "citation-author-icloudcellnfcipv6", "citation-author-icloudcellnfcmac"];
const BATCH_1_172_0 = ["citation-eisbn-rc", "citation-isbn-rd", "citation-eisbn-rd", "citation-isbn-rf", "citation-author-icloudcellnfcgw", "citation-author-icloudcellnfcimei"];
const BATCH_1_173_0 = ["citation-eisbn-rf", "citation-isbn-rg", "citation-eisbn-rg", "citation-isbn-rh", "citation-author-icloudcellnfcimsi", "citation-author-icloudcellnfciccid"];
const BATCH_1_174_0 = ["citation-eisbn-rh", "citation-isbn-ri", "citation-eisbn-ri", "citation-isbn-rj", "citation-author-icloudcellnfcmsisdn", "citation-author-icloudcellnfceid"];
const BATCH_1_175_0 = ["citation-eisbn-rj", "citation-isbn-rk", "citation-eisbn-rk", "citation-isbn-rl", "citation-author-icloudcellnfcuuid", "citation-author-icloudcellnfcsn"];
const BATCH_1_176_0 = ["citation-eisbn-rl", "citation-isbn-rm", "citation-eisbn-rm", "citation-isbn-rn", "citation-author-icloudcellnfcwifimac", "citation-author-icloudcellnfcbtaddr"];
const BATCH_1_177_0 = ["citation-eisbn-rn", "citation-isbn-ro", "citation-eisbn-ro", "citation-isbn-rp", "citation-author-icloudcellnfcwifiip", "citation-author-icloudcellnfcblemac"];
const BATCH_1_178_0 = ["citation-eisbn-rp", "citation-isbn-rq", "citation-eisbn-rq", "citation-isbn-rr", "citation-author-icloudcellnfcbleip", "citation-author-icloudcellnfcwifiipv6"];
const BATCH_1_179_0 = ["citation-eisbn-rr", "citation-isbn-rs", "citation-eisbn-rs", "citation-isbn-rt", "citation-author-icloudcellnfcbleipv6", "citation-author-icloudcellnfcbtip"];
const BATCH_1_180_0 = ["citation-eisbn-rt", "citation-isbn-ru", "citation-eisbn-ru", "citation-isbn-rv", "citation-author-icloudcellnfcbtipv6", "citation-author-icloudcelluwbip"];
const BATCH_1_181_0 = ["citation-eisbn-rv", "citation-isbn-rw", "citation-eisbn-rw", "citation-isbn-rx", "citation-author-icloudcelluwbipv6", "citation-author-icloudcelluwbmac"];
const BATCH_1_182_0 = ["citation-eisbn-rx", "citation-isbn-ry", "citation-eisbn-ry", "citation-isbn-rz", "citation-author-icloudcelluwbgw", "citation-author-icloudcelluwbimei"];
const BATCH_1_183_0 = ["citation-eisbn-rz", "citation-isbn-sa", "citation-eisbn-sa", "citation-isbn-sb", "citation-author-icloudcelluwbimsi", "citation-author-icloudcelluwbiccid"];
const BATCH_1_184_0 = ["citation-eisbn-sb", "citation-isbn-sc", "citation-eisbn-sc", "citation-isbn-sd", "citation-author-icloudcelluwbmsisdn", "citation-author-icloudcelluwbeid"];
const BATCH_1_185_0 = ["citation-eisbn-sd", "citation-isbn-se", "citation-eisbn-se", "citation-isbn-sf", "citation-author-icloudcelluwbuuid", "citation-author-icloudcelluwbsn"];
const BATCH_1_186_0 = ["citation-eisbn-sf", "citation-isbn-si", "citation-eisbn-si", "citation-isbn-sk", "citation-author-icloudcelluwbwifimac", "citation-author-icloudcelluwbbtaddr"];
const BATCH_1_187_0 = ["citation-eisbn-sk", "citation-isbn-sl", "citation-eisbn-sl", "citation-isbn-sm", "citation-author-icloudcelluwbwifiip", "citation-author-icloudcelluwbblemac"];
const BATCH_1_188_0 = ["citation-eisbn-sm", "citation-isbn-sn", "citation-eisbn-sn", "citation-isbn-so", "citation-author-icloudcelluwbbleip", "citation-author-icloudcelluwbwifiipv6"];
const BATCH_1_189_0 = ["citation-eisbn-so", "citation-isbn-sp", "citation-eisbn-sp", "citation-isbn-sq", "citation-author-icloudcelluwbbleipv6", "citation-author-icloudcelluwbbtip"];
const BATCH_1_190_0 = ["citation-eisbn-sq", "citation-isbn-sr", "citation-eisbn-sr", "citation-isbn-ss", "citation-author-icloudcelluwbbtipv6", "citation-author-icloudcelluwbnfcip"];
const BATCH_1_191_0 = ["citation-eisbn-ss", "citation-isbn-st", "citation-eisbn-st", "citation-isbn-sw", "citation-author-icloudcelluwbnfcipv6", "citation-author-icloudcelluwbnfcmac"];
const BATCH_1_192_0 = ["citation-eisbn-sw", "citation-isbn-sy", "citation-eisbn-sy", "citation-isbn-sz", "citation-author-icloudcelluwbnfcgw", "citation-author-icloudcelluwbnfcimei"];

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
  ...BATCH_1_45_0,
  ...BATCH_1_46_0,
  ...BATCH_1_47_0,
  ...BATCH_1_48_0,
  ...BATCH_1_49_0,
  ...BATCH_1_50_0,
  ...BATCH_1_51_0,
  ...BATCH_1_52_0,
  ...BATCH_1_53_0,
  ...BATCH_1_54_0,
  ...BATCH_1_55_0,
  ...BATCH_1_56_0,
  ...BATCH_1_57_0,
  ...BATCH_1_58_0,
  ...BATCH_1_59_0,
  ...BATCH_1_60_0,
  ...BATCH_1_61_0,
  ...BATCH_1_62_0,
  ...BATCH_1_63_0,
  ...BATCH_1_64_0,
  ...BATCH_1_65_0,
  ...BATCH_1_66_0,
  ...BATCH_1_67_0,
  ...BATCH_1_68_0,
  ...BATCH_1_69_0,
  ...BATCH_1_70_0,
  ...BATCH_1_71_0,
  ...BATCH_1_72_0,
  ...BATCH_1_73_0,
  ...BATCH_1_74_0,
  ...BATCH_1_75_0,
  ...BATCH_1_76_0,
  ...BATCH_1_77_0,
  ...BATCH_1_78_0,
  ...BATCH_1_79_0,
  ...BATCH_1_80_0,
  ...BATCH_1_81_0,
  ...BATCH_1_82_0,
  ...BATCH_1_83_0,
  ...BATCH_1_84_0,
  ...BATCH_1_85_0,
  ...BATCH_1_86_0,
  ...BATCH_1_87_0,
  ...BATCH_1_88_0,
  ...BATCH_1_89_0,
  ...BATCH_1_90_0,
  ...BATCH_1_91_0,
  ...BATCH_1_92_0,
  ...BATCH_1_93_0,
  ...BATCH_1_94_0,
  ...BATCH_1_95_0,
  ...BATCH_1_96_0,
  ...BATCH_1_97_0,
  ...BATCH_1_98_0,
  ...BATCH_1_99_0,
  ...BATCH_1_100_0,
  ...BATCH_1_101_0,
  ...BATCH_1_102_0,
  ...BATCH_1_103_0,
  ...BATCH_1_104_0,
  ...BATCH_1_105_0,
  ...BATCH_1_106_0,
  ...BATCH_1_107_0,
  ...BATCH_1_108_0,
  ...BATCH_1_109_0,
  ...BATCH_1_110_0,
  ...BATCH_1_111_0,
  ...BATCH_1_112_0,
  ...BATCH_1_113_0,
  ...BATCH_1_114_0,
  ...BATCH_1_115_0,
  ...BATCH_1_116_0,
  ...BATCH_1_117_0,
  ...BATCH_1_118_0,
  ...BATCH_1_119_0,
  ...BATCH_1_120_0,
  ...BATCH_1_121_0,
  ...BATCH_1_122_0,
  ...BATCH_1_123_0,
  ...BATCH_1_124_0,
  ...BATCH_1_125_0,
  ...BATCH_1_126_0,
  ...BATCH_1_127_0,
  ...BATCH_1_128_0,
  ...BATCH_1_129_0,
  ...BATCH_1_130_0,
  ...BATCH_1_131_0,
  ...BATCH_1_132_0,
  ...BATCH_1_133_0,
  ...BATCH_1_134_0,
  ...BATCH_1_135_0,
  ...BATCH_1_136_0,
  ...BATCH_1_137_0,
  ...BATCH_1_138_0,
  ...BATCH_1_139_0,
  ...BATCH_1_140_0,
  ...BATCH_1_141_0,
  ...BATCH_1_142_0,
  ...BATCH_1_143_0,
  ...BATCH_1_144_0,
  ...BATCH_1_145_0,
  ...BATCH_1_146_0,
  ...BATCH_1_147_0,
  ...BATCH_1_148_0,
  ...BATCH_1_149_0,
  ...BATCH_1_150_0,
  ...BATCH_1_151_0,
  ...BATCH_1_152_0,
  ...BATCH_1_153_0,
  ...BATCH_1_154_0,
  ...BATCH_1_155_0,
  ...BATCH_1_156_0,
  ...BATCH_1_157_0,
  ...BATCH_1_158_0,
  ...BATCH_1_159_0,
  ...BATCH_1_160_0,
  ...BATCH_1_161_0,
  ...BATCH_1_162_0,
  ...BATCH_1_163_0,
  ...BATCH_1_164_0,
  ...BATCH_1_165_0,
  ...BATCH_1_166_0,
  ...BATCH_1_167_0,
  ...BATCH_1_168_0,
  ...BATCH_1_169_0,
  ...BATCH_1_170_0,
  ...BATCH_1_171_0,
  ...BATCH_1_172_0,
  ...BATCH_1_173_0,
  ...BATCH_1_174_0,
  ...BATCH_1_175_0,
  ...BATCH_1_176_0,
  ...BATCH_1_177_0,
  ...BATCH_1_178_0,
  ...BATCH_1_179_0,
  ...BATCH_1_180_0,
  ...BATCH_1_181_0,
  ...BATCH_1_182_0,
  ...BATCH_1_183_0,
  ...BATCH_1_184_0,
  ...BATCH_1_185_0,
  ...BATCH_1_186_0,
  ...BATCH_1_187_0,
  ...BATCH_1_188_0,
  ...BATCH_1_189_0,
  ...BATCH_1_190_0,
  ...BATCH_1_191_0,
];

test("shop version is 1.192.0", () => {
  expect(pkg.version).toBe("1.192.0");
  expect(source).toContain('const VERSION = "1.192.0"');
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

test("adds six new 1.192.0 pay routes", () => {
  for (const name of BATCH_1_192_0) {
    expect(routePaths).toContain(`/pay/${name}`);
  }
});

test("new routes are not duplicates of earlier catalogs", () => {
  const prior = new Set([...PRIOR, ...LIVE_EXTRA]);
  for (const name of BATCH_1_192_0) {
    expect(prior.has(name)).toBe(false);
  }
});

test("keccak256 and EIP-55 helpers", () => {
  expect(VERSION).toBe("1.192.0");
  expect(keccak256Hex("")).toBe("c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  expect(keccak256Hex("hello")).toBe("1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8");
  expect(selector("totalSupply()")).toBe("0x18160ddd");
  expect(selector("transfer(address,uint256)")).toBe("0xa9059cbb");
  expect(toChecksumAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed")).toBe(
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  );
  expect(toChecksumAddress(PAY_TO.toLowerCase())).toBe(PAY_TO);
});
