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
const BATCH_1_193_0 = ["citation-eisbn-sz", "citation-isbn-tb", "citation-eisbn-tb", "citation-isbn-td", "citation-author-icloudcelluwbnfcimsi", "citation-author-icloudcelluwbnfciccid"];
const BATCH_1_194_0 = ["citation-eisbn-td", "citation-isbn-te", "citation-eisbn-te", "citation-isbn-tg", "citation-author-icloudcelluwbnfcmsisdn", "citation-author-icloudcelluwbnfceid"];
const BATCH_1_195_0 = ["citation-eisbn-tg", "citation-isbn-tj", "citation-eisbn-tj", "citation-isbn-tk", "citation-author-icloudcelluwbnfcuuid", "citation-author-icloudcelluwbnfcsn"];
const BATCH_1_196_0 = ["citation-eisbn-tk", "citation-isbn-tl", "citation-eisbn-tl", "citation-isbn-tm", "citation-author-icloudcelluwbnfcwifimac", "citation-author-icloudcelluwbnfcbtaddr"];
const BATCH_1_197_0 = ["citation-eisbn-tm", "citation-isbn-tn", "citation-eisbn-tn", "citation-isbn-to", "citation-author-icloudcelluwbnfcwifiip", "citation-author-icloudcelluwbnfcblemac"];
const BATCH_1_198_0 = ["citation-eisbn-to", "citation-isbn-tp", "citation-eisbn-tp", "citation-isbn-tq", "citation-author-icloudcelluwbnfcbleip", "citation-author-icloudcelluwbnfcwifiipv6"];
const BATCH_1_199_0 = ["citation-eisbn-tq", "citation-isbn-tr", "citation-eisbn-tr", "citation-isbn-ts", "citation-author-icloudcelluwbnfcbleipv6", "citation-author-icloudcelluwbnfcbtip"];
const BATCH_1_200_0 = ["citation-eisbn-ts", "citation-isbn-tu", "citation-eisbn-tu", "citation-isbn-tv", "citation-author-icloudcelluwbnfcbtipv6", "citation-author-icloudcelluwbnfcthreadip"];
const BATCH_1_201_0 = ["citation-eisbn-tv", "citation-isbn-tz", "citation-eisbn-tz", "citation-isbn-ua", "citation-author-icloudcelluwbnfcthreadipv6", "citation-author-icloudcelluwbnfcthreadmac"];
const BATCH_1_202_0 = ["citation-eisbn-ua", "citation-isbn-ub", "citation-eisbn-ub", "citation-isbn-uc", "citation-author-icloudcelluwbnfcthreadgw", "citation-author-icloudcelluwbnfcthreadimei"];
const BATCH_1_203_0 = ["citation-eisbn-uc", "citation-isbn-ud", "citation-eisbn-ud", "citation-isbn-ue", "citation-author-icloudcelluwbnfcthreadimsi", "citation-author-icloudcelluwbnfcthreadiccid"];
const BATCH_1_204_0 = ["citation-eisbn-ue", "citation-isbn-uf", "citation-eisbn-uf", "citation-isbn-ug", "citation-author-icloudcelluwbnfcthreadmsisdn", "citation-author-icloudcelluwbnfcthreadeid"];
const BATCH_1_205_0 = ["citation-eisbn-ug", "citation-isbn-uh", "citation-eisbn-uh", "citation-isbn-ui", "citation-author-icloudcelluwbnfcthreaduuid", "citation-author-icloudcelluwbnfcthreadsn"];
const BATCH_1_206_0 = ["citation-eisbn-ui", "citation-isbn-uj", "citation-eisbn-uj", "citation-isbn-ul", "citation-author-icloudcelluwbnfcthreadwifimac", "citation-author-icloudcelluwbnfcthreadbtaddr"];
const BATCH_1_207_0 = ["citation-eisbn-ul", "citation-isbn-uo", "citation-eisbn-uo", "citation-isbn-up", "citation-author-icloudcelluwbnfcthreadwifiip", "citation-author-icloudcelluwbnfcthreadblemac"];
const BATCH_1_208_0 = ["citation-eisbn-up", "citation-isbn-uq", "citation-eisbn-uq", "citation-isbn-ur", "citation-author-icloudcelluwbnfcthreadbleip", "citation-author-icloudcelluwbnfcthreadwifiipv6"];
const BATCH_1_209_0 = ["citation-eisbn-ur", "citation-isbn-ut", "citation-eisbn-ut", "citation-isbn-uu", "citation-author-icloudcelluwbnfcthreadbleipv6", "citation-author-icloudcelluwbnfcthreadbtip"];
const BATCH_1_210_0 = ["citation-eisbn-uu", "citation-isbn-uv", "citation-eisbn-uv", "citation-isbn-uw", "citation-author-icloudcelluwbnfcthreadbtipv6", "citation-author-icloudcelluwbnfcthreadnfcip"];
const BATCH_1_211_0 = ["citation-eisbn-uw", "citation-isbn-ux", "citation-eisbn-ux", "citation-isbn-uz", "citation-author-icloudcelluwbnfcthreadnfcipv6", "citation-author-icloudcelluwbnfcthreadnfcmac"];
const BATCH_1_212_0 = ["citation-eisbn-uz", "citation-isbn-va", "citation-eisbn-va", "citation-isbn-vb", "citation-author-icloudcelluwbnfcthreadnfcgw", "citation-author-icloudcelluwbnfcthreadnfcimei"];
const BATCH_1_213_0 = ["citation-eisbn-vb", "citation-isbn-vd", "citation-eisbn-vd", "citation-isbn-vf", "citation-author-icloudcelluwbnfcthreadnfcimsi", "citation-author-icloudcelluwbnfcthreadnfciccid"];
const BATCH_1_214_0 = ["citation-eisbn-vf", "citation-isbn-vh", "citation-eisbn-vh", "citation-isbn-vi", "citation-author-icloudcelluwbnfcthreadnfcmsisdn", "citation-author-icloudcelluwbnfcthreadnfceid"];
const BATCH_1_215_0 = ["citation-eisbn-vi", "citation-isbn-vj", "citation-eisbn-vj", "citation-isbn-vk", "citation-author-icloudcelluwbnfcthreadnfcuuid", "citation-author-icloudcelluwbnfcthreadnfcsn"];
const BATCH_1_216_0 = ["citation-eisbn-vk", "citation-isbn-vl", "citation-eisbn-vl", "citation-isbn-vm", "citation-author-icloudcelluwbnfcthreadnfcwifimac", "citation-author-icloudcelluwbnfcthreadnfcbtaddr"];
const BATCH_1_217_0 = ["citation-eisbn-vm", "citation-isbn-vo", "citation-eisbn-vo", "citation-isbn-vp", "citation-author-icloudcelluwbnfcthreadnfcwifiip", "citation-author-icloudcelluwbnfcthreadnfcblemac"];
const BATCH_1_218_0 = ["citation-eisbn-vp", "citation-isbn-vq", "citation-eisbn-vq", "citation-isbn-vr", "citation-author-icloudcelluwbnfcthreadnfcbleip", "citation-author-icloudcelluwbnfcthreadnfcwifiipv6"];
const BATCH_1_219_0 = ["citation-eisbn-vr", "citation-isbn-vs", "citation-eisbn-vs", "citation-isbn-vt", "citation-author-icloudcelluwbnfcthreadnfcbleipv6", "citation-author-icloudcelluwbnfcthreadnfcbtip"];
const BATCH_1_220_0 = ["citation-eisbn-vt", "citation-isbn-vv", "citation-eisbn-vv", "citation-isbn-vw", "citation-author-icloudcelluwbnfcthreadnfcbtipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcip"];
const BATCH_1_221_0 = ["citation-eisbn-vw", "citation-isbn-vx", "citation-eisbn-vx", "citation-isbn-vy", "citation-author-icloudcelluwbnfcthreadnfcnfcipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcmac"];
const BATCH_1_222_0 = ["citation-eisbn-vy", "citation-isbn-vz", "citation-eisbn-vz", "citation-isbn-wa", "citation-author-icloudcelluwbnfcthreadnfcnfcgw", "citation-author-icloudcelluwbnfcthreadnfcnfcimei"];
const BATCH_1_223_0 = ["citation-eisbn-wa", "citation-isbn-wb", "citation-eisbn-wb", "citation-isbn-wc", "citation-author-icloudcelluwbnfcthreadnfcnfcimsi", "citation-author-icloudcelluwbnfcthreadnfcnfciccid"];
const BATCH_1_224_0 = ["citation-eisbn-wc", "citation-isbn-wd", "citation-eisbn-wd", "citation-isbn-we", "citation-author-icloudcelluwbnfcthreadnfcnfcmsisdn", "citation-author-icloudcelluwbnfcthreadnfcnfceid"];
const BATCH_1_225_0 = ["citation-eisbn-we", "citation-isbn-wg", "citation-eisbn-wg", "citation-isbn-wh", "citation-author-icloudcelluwbnfcthreadnfcnfcuuid", "citation-author-icloudcelluwbnfcthreadnfcnfcsn"];
const BATCH_1_226_0 = ["citation-eisbn-wh", "citation-isbn-wi", "citation-eisbn-wi", "citation-isbn-wj", "citation-author-icloudcelluwbnfcthreadnfcnfcwifimac", "citation-author-icloudcelluwbnfcthreadnfcnfcbtaddr"];
const BATCH_1_227_0 = ["citation-eisbn-wj", "citation-isbn-wk", "citation-eisbn-wk", "citation-isbn-wl", "citation-author-icloudcelluwbnfcthreadnfcnfcwifiip", "citation-author-icloudcelluwbnfcthreadnfcnfcblemac"];
const BATCH_1_228_0 = ["citation-eisbn-wl", "citation-isbn-wm", "citation-eisbn-wm", "citation-isbn-wn", "citation-author-icloudcelluwbnfcthreadnfcnfcbleip", "citation-author-icloudcelluwbnfcthreadnfcnfcwifiipv6"];
const BATCH_1_229_0 = ["citation-eisbn-wn", "citation-isbn-wo", "citation-eisbn-wo", "citation-isbn-wp", "citation-author-icloudcelluwbnfcthreadnfcnfcbleipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcbtip"];
const BATCH_1_230_0 = ["citation-eisbn-wp", "citation-isbn-wq", "citation-eisbn-wq", "citation-isbn-wr", "citation-author-icloudcelluwbnfcthreadnfcnfcbtipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcip"];
const BATCH_1_231_0 = ["citation-eisbn-wr", "citation-isbn-wt", "citation-eisbn-wt", "citation-isbn-wu", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcbtmac"];
const BATCH_1_232_0 = ["citation-eisbn-wu", "citation-isbn-wv", "citation-eisbn-wv", "citation-isbn-ww", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcgw"];
const BATCH_1_233_0 = ["citation-eisbn-ww", "citation-isbn-wx", "citation-eisbn-wx", "citation-isbn-wy", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcimei", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcimsi"];
const BATCH_1_234_0 = ["citation-eisbn-wy", "citation-isbn-wz", "citation-eisbn-wz", "citation-isbn-xa", "citation-author-icloudcelluwbnfcthreadnfcnfcnfciccid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcmsisdn"];
const BATCH_1_235_0 = ["citation-eisbn-xa", "citation-isbn-xb", "citation-eisbn-xb", "citation-isbn-xc", "citation-author-icloudcelluwbnfcthreadnfcnfcnfceid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcuuid"];
const BATCH_1_236_0 = ["citation-eisbn-xc", "citation-isbn-xd", "citation-eisbn-xd", "citation-isbn-xe", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcsn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcwifimac"];
const BATCH_1_237_0 = ["citation-eisbn-xe", "citation-isbn-xf", "citation-eisbn-xf", "citation-isbn-xg", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcbtaddr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcwifiip"];
const BATCH_1_238_0 = ["citation-eisbn-xg", "citation-isbn-xh", "citation-eisbn-xh", "citation-isbn-xi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcbleip"];
const BATCH_1_239_0 = ["citation-eisbn-xi", "citation-isbn-xj", "citation-eisbn-xj", "citation-isbn-xk", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcbleipv6"];
const BATCH_1_240_0 = ["citation-eisbn-xk", "citation-isbn-xl", "citation-eisbn-xl", "citation-isbn-xm", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcbtipv6"];
const BATCH_1_241_0 = ["citation-eisbn-xm", "citation-isbn-xn", "citation-eisbn-xn", "citation-isbn-xo", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcipv6"];
const BATCH_1_242_0 = ["citation-eisbn-xo", "citation-isbn-xp", "citation-eisbn-xp", "citation-isbn-xq", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcmac"];
const BATCH_1_243_0 = ["citation-eisbn-xq", "citation-isbn-xr", "citation-eisbn-xr", "citation-isbn-xs", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcgw", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcimei"];
const BATCH_1_244_0 = ["citation-eisbn-xs", "citation-isbn-xt", "citation-eisbn-xt", "citation-isbn-xu", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcimsi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfciccid"];
const BATCH_1_245_0 = ["citation-eisbn-xu", "citation-isbn-xv", "citation-eisbn-xv", "citation-isbn-xw", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcmsisdn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfceid"];
const BATCH_1_246_0 = ["citation-eisbn-xw", "citation-isbn-xx", "citation-eisbn-xx", "citation-isbn-xy", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcuuid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcsn"];
const BATCH_1_247_0 = ["citation-eisbn-xy", "citation-isbn-xz", "citation-eisbn-xz", "citation-isbn-ya", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcwifimac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcbtaddr"];
const BATCH_1_248_0 = ["citation-eisbn-ya", "citation-isbn-yb", "citation-eisbn-yb", "citation-isbn-yc", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcwifiip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcblemac"];
const BATCH_1_249_0 = ["citation-eisbn-yc", "citation-isbn-yd", "citation-eisbn-yd", "citation-isbn-ye", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcbleip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcwifiipv6"];
const BATCH_1_250_0 = ["citation-eisbn-ye", "citation-isbn-yf", "citation-eisbn-yf", "citation-isbn-yg", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcbleipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcbtip"];
const BATCH_1_251_0 = ["citation-eisbn-yg", "citation-isbn-yh", "citation-eisbn-yh", "citation-isbn-yi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcbtipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcip"];
const BATCH_1_252_0 = ["citation-eisbn-yi", "citation-isbn-yj", "citation-eisbn-yj", "citation-isbn-yk", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcbtmac"];
const BATCH_1_253_0 = ["citation-eisbn-yk", "citation-isbn-yl", "citation-eisbn-yl", "citation-isbn-ym", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcgw"];
const BATCH_1_254_0 = ["citation-eisbn-ym", "citation-isbn-yn", "citation-eisbn-yn", "citation-isbn-yo", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcimei", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcimsi"];
const BATCH_1_255_0 = ["citation-eisbn-yo", "citation-isbn-yp", "citation-eisbn-yp", "citation-isbn-yq", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfciccid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcmsisdn"];
const BATCH_1_256_0 = ["citation-eisbn-yq", "citation-isbn-yr", "citation-eisbn-yr", "citation-isbn-ys", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfceid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcuuid"];
const BATCH_1_257_0 = ["citation-eisbn-ys", "citation-isbn-yu", "citation-eisbn-yu", "citation-isbn-yv", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcsn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcwifimac"];
const BATCH_1_258_0 = ["citation-eisbn-yv", "citation-isbn-yw", "citation-eisbn-yw", "citation-isbn-yx", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcbtaddr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_259_0 = ["citation-eisbn-yx", "citation-isbn-yy", "citation-eisbn-yy", "citation-isbn-yz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_260_0 = ["citation-eisbn-yz", "citation-isbn-zb", "citation-eisbn-zb", "citation-isbn-zc", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_261_0 = ["citation-eisbn-zc", "citation-isbn-zd", "citation-eisbn-zd", "citation-isbn-ze", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_262_0 = ["citation-eisbn-ze", "citation-isbn-zf", "citation-eisbn-zf", "citation-isbn-zg", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_263_0 = ["citation-eisbn-zg", "citation-isbn-zh", "citation-eisbn-zh", "citation-isbn-zi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_264_0 = ["citation-eisbn-zi", "citation-isbn-zj", "citation-eisbn-zj", "citation-isbn-zk", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcgw", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcimei"];
const BATCH_1_265_0 = ["citation-eisbn-zk", "citation-isbn-zl", "citation-eisbn-zl", "citation-isbn-zn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcimsi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfciccid"];
const BATCH_1_266_0 = ["citation-eisbn-zn", "citation-isbn-zo", "citation-eisbn-zo", "citation-isbn-zp", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcmsisdn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfceid"];
const BATCH_1_267_0 = ["citation-eisbn-zp", "citation-isbn-zq", "citation-eisbn-zq", "citation-isbn-zs", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcuuid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcsn"];
const BATCH_1_268_0 = ["citation-eisbn-zs", "citation-isbn-zt", "citation-eisbn-zt", "citation-isbn-zu", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcwifimac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcbtaddr"];
const BATCH_1_269_0 = ["citation-eisbn-zu", "citation-isbn-zv", "citation-eisbn-zv", "citation-isbn-zx", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac"];
const BATCH_1_270_0 = ["citation-eisbn-zx", "citation-isbn-zy", "citation-eisbn-zy", "citation-isbn-zz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6"];
const BATCH_1_271_0 = ["citation-eisbn-zz", "citation-isbn-aaa", "citation-eisbn-aaa", "citation-isbn-aab", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip"];
const BATCH_1_272_0 = ["citation-eisbn-aab", "citation-isbn-aac", "citation-eisbn-aac", "citation-isbn-aad", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip"];
const BATCH_1_273_0 = ["citation-eisbn-aad", "citation-isbn-aae", "citation-eisbn-aae", "citation-isbn-aaf", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac"];
const BATCH_1_274_0 = ["citation-eisbn-aaf", "citation-isbn-aag", "citation-eisbn-aag", "citation-isbn-aah", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcgw"];
const BATCH_1_275_0 = ["citation-eisbn-aah", "citation-isbn-aai", "citation-eisbn-aai", "citation-isbn-aaj", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcimei", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcimsi"];
const BATCH_1_276_0 = ["citation-eisbn-aaj", "citation-isbn-aak", "citation-eisbn-aak", "citation-isbn-aal", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfciccid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmsisdn"];
const BATCH_1_277_0 = ["citation-eisbn-aal", "citation-isbn-aam", "citation-eisbn-aam", "citation-isbn-aan", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfceid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcuuid"];
const BATCH_1_278_0 = ["citation-eisbn-aan", "citation-isbn-aao", "citation-eisbn-aao", "citation-isbn-aap", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcsn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifimac"];
const BATCH_1_279_0 = ["citation-eisbn-aap", "citation-isbn-aaq", "citation-eisbn-aaq", "citation-isbn-aar", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtaddr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_280_0 = ["citation-eisbn-aar", "citation-isbn-aas", "citation-eisbn-aas", "citation-isbn-aat", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_281_0 = ["citation-eisbn-aat", "citation-isbn-aau", "citation-eisbn-aau", "citation-isbn-aav", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_282_0 = ["citation-eisbn-aav", "citation-isbn-aaw", "citation-eisbn-aaw", "citation-isbn-aax", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_283_0 = ["citation-eisbn-aax", "citation-isbn-aay", "citation-eisbn-aay", "citation-isbn-aaz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_284_0 = ["citation-eisbn-aaz", "citation-isbn-aba", "citation-eisbn-aba", "citation-isbn-abb", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_285_0 = ["citation-eisbn-abb", "citation-isbn-abc", "citation-eisbn-abc", "citation-isbn-abd", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_286_0 = ["citation-eisbn-abd", "citation-isbn-abe", "citation-eisbn-abe", "citation-isbn-abf", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_287_0 = ["citation-eisbn-abf", "citation-isbn-abg", "citation-eisbn-abg", "citation-isbn-abh", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_288_0 = ["citation-eisbn-abh", "citation-isbn-abi", "citation-eisbn-abi", "citation-isbn-abj", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_289_0 = ["citation-eisbn-abj", "citation-isbn-abk", "citation-eisbn-abk", "citation-isbn-abl", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_290_0 = ["citation-eisbn-abl", "citation-isbn-abm", "citation-eisbn-abm", "citation-isbn-abn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_291_0 = ["citation-eisbn-abn", "citation-isbn-abo", "citation-eisbn-abo", "citation-isbn-abp", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_292_0 = ["citation-eisbn-abp", "citation-isbn-abq", "citation-eisbn-abq", "citation-isbn-abr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_293_0 = ["citation-eisbn-abr", "citation-isbn-abs", "citation-eisbn-abs", "citation-isbn-abt", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_294_0 = ["citation-eisbn-abt", "citation-isbn-abu", "citation-eisbn-abu", "citation-isbn-abv", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_295_0 = ["citation-eisbn-abv", "citation-isbn-abw", "citation-eisbn-abw", "citation-isbn-abx", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_296_0 = ["citation-eisbn-abx", "citation-isbn-aby", "citation-eisbn-aby", "citation-isbn-abz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_297_0 = ["citation-eisbn-abz", "citation-isbn-aca", "citation-eisbn-aca", "citation-isbn-acb", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_298_0 = ["citation-eisbn-acb", "citation-isbn-acc", "citation-eisbn-acc", "citation-isbn-acd", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_299_0 = ["citation-eisbn-acd", "citation-isbn-ace", "citation-eisbn-ace", "citation-isbn-acf", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_300_0 = ["citation-eisbn-acf", "citation-isbn-acg", "citation-eisbn-acg", "citation-isbn-ach", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_301_0 = ["citation-eisbn-ach", "citation-isbn-aci", "citation-eisbn-aci", "citation-isbn-acj", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_302_0 = ["citation-eisbn-acj", "citation-isbn-ack", "citation-eisbn-ack", "citation-isbn-acl", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_303_0 = ["citation-eisbn-acl", "citation-isbn-acm", "citation-eisbn-acm", "citation-isbn-acn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_304_0 = ["citation-eisbn-acn", "citation-isbn-aco", "citation-eisbn-aco", "citation-isbn-acp", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_305_0 = ["citation-eisbn-acp", "citation-isbn-acq", "citation-eisbn-acq", "citation-isbn-acr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_306_0 = ["citation-eisbn-acr", "citation-isbn-acs", "citation-eisbn-acs", "citation-isbn-act", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_307_0 = ["citation-eisbn-act", "citation-isbn-acu", "citation-eisbn-acu", "citation-isbn-acv", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_308_0 = ["citation-eisbn-acv", "citation-isbn-acw", "citation-eisbn-acw", "citation-isbn-acx", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_309_0 = ["citation-eisbn-acx", "citation-isbn-acy", "citation-eisbn-acy", "citation-isbn-acz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_310_0 = ["citation-eisbn-acz", "citation-isbn-ada", "citation-eisbn-ada", "citation-isbn-adb", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_311_0 = ["citation-eisbn-adb", "citation-isbn-adc", "citation-eisbn-adc", "citation-isbn-add", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_312_0 = ["citation-eisbn-add", "citation-isbn-ade", "citation-eisbn-ade", "citation-isbn-adf", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_313_0 = ["citation-eisbn-adf", "citation-isbn-adg", "citation-eisbn-adg", "citation-isbn-adh", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_314_0 = ["citation-eisbn-adh", "citation-isbn-adi", "citation-eisbn-adi", "citation-isbn-adj", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_315_0 = ["citation-eisbn-adj", "citation-isbn-adk", "citation-eisbn-adk", "citation-isbn-adl", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_316_0 = ["citation-eisbn-adl", "citation-isbn-adm", "citation-eisbn-adm", "citation-isbn-adn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_317_0 = ["citation-eisbn-adn", "citation-isbn-ado", "citation-eisbn-ado", "citation-isbn-adp", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_318_0 = ["citation-eisbn-adp", "citation-isbn-adq", "citation-eisbn-adq", "citation-isbn-adr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_319_0 = ["citation-eisbn-adr", "citation-isbn-ads", "citation-eisbn-ads", "citation-isbn-adt", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_320_0 = ["citation-eisbn-adt", "citation-isbn-adu", "citation-eisbn-adu", "citation-isbn-adv", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_321_0 = ["citation-eisbn-adv", "citation-isbn-adw", "citation-eisbn-adw", "citation-isbn-adx", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_322_0 = ["citation-eisbn-adx", "citation-isbn-ady", "citation-eisbn-ady", "citation-isbn-adz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_323_0 = ["citation-eisbn-adz", "citation-isbn-aea", "citation-eisbn-aea", "citation-isbn-aeb", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_324_0 = ["citation-eisbn-aeb", "citation-isbn-aec", "citation-eisbn-aec", "citation-isbn-aed", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_325_0 = ["citation-eisbn-aed", "citation-isbn-aee", "citation-eisbn-aee", "citation-isbn-aef", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_326_0 = ["citation-eisbn-aef", "citation-isbn-aeg", "citation-eisbn-aeg", "citation-isbn-aeh", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_327_0 = ["citation-eisbn-aeh", "citation-isbn-aei", "citation-eisbn-aei", "citation-isbn-aej", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_328_0 = ["citation-eisbn-aej", "citation-isbn-aek", "citation-eisbn-aek", "citation-isbn-ael", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_329_0 = ["citation-eisbn-ael", "citation-isbn-aem", "citation-eisbn-aem", "citation-isbn-aen", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_330_0 = ["citation-eisbn-aen", "citation-isbn-aeo", "citation-eisbn-aeo", "citation-isbn-aep", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_331_0 = ["citation-eisbn-aep", "citation-isbn-aeq", "citation-eisbn-aeq", "citation-isbn-aer", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_332_0 = ["citation-eisbn-aer", "citation-isbn-aes", "citation-eisbn-aes", "citation-isbn-aet", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_333_0 = ["citation-eisbn-aet", "citation-isbn-aeu", "citation-eisbn-aeu", "citation-isbn-aev", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_334_0 = ["citation-eisbn-aev", "citation-isbn-aew", "citation-eisbn-aew", "citation-isbn-aex", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_335_0 = ["citation-eisbn-aex", "citation-isbn-aey", "citation-eisbn-aey", "citation-isbn-aez", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_336_0 = ["citation-eisbn-aez", "citation-isbn-afa", "citation-eisbn-afa", "citation-isbn-afb", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_337_0 = ["citation-eisbn-afb", "citation-isbn-afc", "citation-eisbn-afc", "citation-isbn-afd", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_338_0 = ["citation-eisbn-afd", "citation-isbn-afe", "citation-eisbn-afe", "citation-isbn-aff", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_339_0 = ["citation-eisbn-aff", "citation-isbn-afg", "citation-eisbn-afg", "citation-isbn-afh", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_340_0 = ["citation-eisbn-afh", "citation-isbn-afi", "citation-eisbn-afi", "citation-isbn-afj", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_341_0 = ["citation-eisbn-afj", "citation-isbn-afk", "citation-eisbn-afk", "citation-isbn-afl", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_342_0 = ["citation-eisbn-afl", "citation-isbn-afm", "citation-eisbn-afm", "citation-isbn-afn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_343_0 = ["citation-eisbn-afn", "citation-isbn-afo", "citation-eisbn-afo", "citation-isbn-afp", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_344_0 = ["citation-eisbn-afp", "citation-isbn-afq", "citation-eisbn-afq", "citation-isbn-afr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_345_0 = ["citation-eisbn-afr", "citation-isbn-afs", "citation-eisbn-afs", "citation-isbn-aft", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_346_0 = ["citation-eisbn-aft", "citation-isbn-afu", "citation-eisbn-afu", "citation-isbn-afv", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_347_0 = ["citation-eisbn-afv", "citation-isbn-afw", "citation-eisbn-afw", "citation-isbn-afx", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_348_0 = ["citation-eisbn-afx", "citation-isbn-afy", "citation-eisbn-afy", "citation-isbn-afz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_349_0 = ["citation-eisbn-afz", "citation-isbn-aga", "citation-eisbn-aga", "citation-isbn-agb", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_350_0 = ["citation-eisbn-agb", "citation-isbn-agc", "citation-eisbn-agc", "citation-isbn-agd", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_351_0 = ["citation-eisbn-agd", "citation-isbn-age", "citation-eisbn-age", "citation-isbn-agf", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_352_0 = ["citation-eisbn-agf", "citation-isbn-agg", "citation-eisbn-agg", "citation-isbn-agh", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_353_0 = ["citation-eisbn-agh", "citation-isbn-agi", "citation-eisbn-agi", "citation-isbn-agj", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_354_0 = ["citation-eisbn-agj", "citation-isbn-agk", "citation-eisbn-agk", "citation-isbn-agl", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_355_0 = ["citation-eisbn-agl", "citation-isbn-agm", "citation-eisbn-agm", "citation-isbn-agn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_356_0 = ["citation-eisbn-agn", "citation-isbn-ago", "citation-eisbn-ago", "citation-isbn-agp", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_357_0 = ["citation-eisbn-agp", "citation-isbn-agq", "citation-eisbn-agq", "citation-isbn-agr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_358_0 = ["citation-eisbn-agr", "citation-isbn-ags", "citation-eisbn-ags", "citation-isbn-agt", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcblemac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleip"];
const BATCH_1_359_0 = ["citation-eisbn-agt", "citation-isbn-agu", "citation-eisbn-agu", "citation-isbn-agv", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_360_0 = ["citation-eisbn-agv", "citation-isbn-agw", "citation-eisbn-agw", "citation-isbn-agx", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_361_0 = ["citation-eisbn-agx", "citation-isbn-agy", "citation-eisbn-agy", "citation-isbn-agz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_362_0 = ["citation-eisbn-agz", "citation-isbn-aha", "citation-eisbn-aha", "citation-isbn-ahb", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_363_0 = ["citation-eisbn-ahb", "citation-isbn-ahc", "citation-eisbn-ahc", "citation-isbn-ahd", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_364_0 = ["citation-eisbn-ahd", "citation-isbn-ahe", "citation-eisbn-ahe", "citation-isbn-ahf", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_365_0 = ["citation-eisbn-ahf", "citation-isbn-ahg", "citation-eisbn-ahg", "citation-isbn-ahh", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_366_0 = ["citation-eisbn-ahh", "citation-isbn-ahi", "citation-eisbn-ahi", "citation-isbn-ahj", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_367_0 = ["citation-eisbn-ahj", "citation-isbn-ahk", "citation-eisbn-ahk", "citation-isbn-ahl", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_368_0 = ["citation-eisbn-ahl", "citation-isbn-ahm", "citation-eisbn-ahm", "citation-isbn-ahn", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_369_0 = ["citation-eisbn-ahn", "citation-isbn-aho", "citation-eisbn-aho", "citation-isbn-ahp", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_370_0 = ["citation-eisbn-ahp", "citation-isbn-ahq", "citation-eisbn-ahq", "citation-isbn-ahr", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_371_0 = ["citation-eisbn-ahr", "citation-isbn-ahs", "citation-eisbn-ahs", "citation-isbn-aht", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_372_0 = ["citation-eisbn-aht", "citation-isbn-ahu", "citation-eisbn-ahu", "citation-isbn-ahv", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_373_0 = ["citation-eisbn-ahv", "citation-isbn-ahw", "citation-eisbn-ahw", "citation-isbn-ahx", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_374_0 = ["citation-eisbn-ahx", "citation-isbn-ahy", "citation-eisbn-ahy", "citation-isbn-ahz", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_375_0 = ["citation-eisbn-ahz", "citation-isbn-aia", "citation-eisbn-aia", "citation-isbn-aib", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_376_0 = ["citation-eisbn-aib", "citation-isbn-aic", "citation-eisbn-aic", "citation-isbn-aid", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_377_0 = ["citation-eisbn-aid", "citation-isbn-aie", "citation-eisbn-aie", "citation-isbn-aif", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];
const BATCH_1_378_0 = ["citation-eisbn-aif", "citation-isbn-aig", "citation-eisbn-aig", "citation-isbn-aih", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtwifi", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiip"];
const BATCH_1_379_0 = ["citation-eisbn-aih", "citation-isbn-aii", "citation-eisbn-aii", "citation-isbn-aij", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcwifiipv6", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbleipv6"];
const BATCH_1_380_0 = ["citation-eisbn-aij", "citation-isbn-aik", "citation-eisbn-aik", "citation-isbn-ail", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtipv6"];
const BATCH_1_381_0 = ["citation-eisbn-ail", "citation-isbn-aim", "citation-eisbn-aim", "citation-isbn-ain", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcipv6"];
const BATCH_1_382_0 = ["citation-eisbn-ain", "citation-isbn-aio", "citation-eisbn-aio", "citation-isbn-aip", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcbtmac", "citation-author-icloudcelluwbnfcthreadnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcnfcmac"];

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
  ...BATCH_1_192_0,
  ...BATCH_1_193_0,
  ...BATCH_1_194_0,
  ...BATCH_1_195_0,
  ...BATCH_1_196_0,
  ...BATCH_1_197_0,
  ...BATCH_1_198_0,
  ...BATCH_1_199_0,
  ...BATCH_1_200_0,
  ...BATCH_1_201_0,
  ...BATCH_1_202_0,
  ...BATCH_1_203_0,
  ...BATCH_1_204_0,
  ...BATCH_1_205_0,
  ...BATCH_1_206_0,
  ...BATCH_1_207_0,
  ...BATCH_1_208_0,
  ...BATCH_1_209_0,
  ...BATCH_1_210_0,
  ...BATCH_1_211_0,
  ...BATCH_1_212_0,
  ...BATCH_1_213_0,
  ...BATCH_1_214_0,
  ...BATCH_1_215_0,
  ...BATCH_1_216_0,
  ...BATCH_1_217_0,
  ...BATCH_1_218_0,
  ...BATCH_1_219_0,
  ...BATCH_1_220_0,
  ...BATCH_1_221_0,
  ...BATCH_1_222_0,
  ...BATCH_1_223_0,
  ...BATCH_1_224_0,
  ...BATCH_1_225_0,
  ...BATCH_1_226_0,
  ...BATCH_1_227_0,
  ...BATCH_1_228_0,
  ...BATCH_1_229_0,
  ...BATCH_1_230_0,
  ...BATCH_1_231_0,
  ...BATCH_1_232_0,
  ...BATCH_1_233_0,
  ...BATCH_1_234_0,
  ...BATCH_1_235_0,
  ...BATCH_1_236_0,
  ...BATCH_1_237_0,
  ...BATCH_1_238_0,
  ...BATCH_1_239_0,
  ...BATCH_1_240_0,
  ...BATCH_1_241_0,
  ...BATCH_1_242_0,
  ...BATCH_1_243_0,
  ...BATCH_1_244_0,
  ...BATCH_1_245_0,
  ...BATCH_1_246_0,
  ...BATCH_1_247_0,
  ...BATCH_1_248_0,
  ...BATCH_1_249_0,
  ...BATCH_1_250_0,
  ...BATCH_1_251_0,
  ...BATCH_1_252_0,
  ...BATCH_1_253_0,
  ...BATCH_1_254_0,
  ...BATCH_1_255_0,
  ...BATCH_1_256_0,
  ...BATCH_1_257_0,
  ...BATCH_1_258_0,
  ...BATCH_1_259_0,
  ...BATCH_1_260_0,
  ...BATCH_1_261_0,
  ...BATCH_1_262_0,
  ...BATCH_1_263_0,
  ...BATCH_1_264_0,
  ...BATCH_1_265_0,
  ...BATCH_1_266_0,
  ...BATCH_1_267_0,
  ...BATCH_1_268_0,
  ...BATCH_1_269_0,
  ...BATCH_1_270_0,
  ...BATCH_1_271_0,
  ...BATCH_1_272_0,
  ...BATCH_1_273_0,
  ...BATCH_1_274_0,
  ...BATCH_1_275_0,
  ...BATCH_1_276_0,
  ...BATCH_1_277_0,
  ...BATCH_1_278_0,
  ...BATCH_1_279_0,
  ...BATCH_1_280_0,
  ...BATCH_1_281_0,
  ...BATCH_1_282_0,
  ...BATCH_1_283_0,
  ...BATCH_1_284_0,
  ...BATCH_1_285_0,
  ...BATCH_1_286_0,
  ...BATCH_1_287_0,
  ...BATCH_1_288_0,
  ...BATCH_1_289_0,
  ...BATCH_1_290_0,
  ...BATCH_1_291_0,
  ...BATCH_1_292_0,
  ...BATCH_1_293_0,
  ...BATCH_1_294_0,
  ...BATCH_1_295_0,
  ...BATCH_1_296_0,
  ...BATCH_1_297_0,
  ...BATCH_1_298_0,
  ...BATCH_1_299_0,
  ...BATCH_1_300_0,
  ...BATCH_1_301_0,
  ...BATCH_1_302_0,
  ...BATCH_1_303_0,
  ...BATCH_1_304_0,
  ...BATCH_1_305_0,
  ...BATCH_1_306_0,
  ...BATCH_1_307_0,
  ...BATCH_1_308_0,
  ...BATCH_1_309_0,
  ...BATCH_1_310_0,
  ...BATCH_1_311_0,
  ...BATCH_1_312_0,
  ...BATCH_1_313_0,
  ...BATCH_1_314_0,
  ...BATCH_1_315_0,
  ...BATCH_1_316_0,
  ...BATCH_1_317_0,
  ...BATCH_1_318_0,
  ...BATCH_1_319_0,
  ...BATCH_1_320_0,
  ...BATCH_1_321_0,
  ...BATCH_1_322_0,
  ...BATCH_1_323_0,
  ...BATCH_1_324_0,
  ...BATCH_1_325_0,
  ...BATCH_1_326_0,
  ...BATCH_1_327_0,
  ...BATCH_1_328_0,
  ...BATCH_1_329_0,
  ...BATCH_1_330_0,
  ...BATCH_1_331_0,
  ...BATCH_1_332_0,
  ...BATCH_1_333_0,
  ...BATCH_1_334_0,
  ...BATCH_1_335_0,
  ...BATCH_1_336_0,
  ...BATCH_1_337_0,
  ...BATCH_1_338_0,
  ...BATCH_1_339_0,
  ...BATCH_1_340_0,
  ...BATCH_1_341_0,
  ...BATCH_1_342_0,
  ...BATCH_1_343_0,
  ...BATCH_1_344_0,
  ...BATCH_1_345_0,
  ...BATCH_1_346_0,
  ...BATCH_1_347_0,
  ...BATCH_1_348_0,
  ...BATCH_1_349_0,
  ...BATCH_1_350_0,
  ...BATCH_1_351_0,
  ...BATCH_1_352_0,
  ...BATCH_1_353_0,
  ...BATCH_1_354_0,
  ...BATCH_1_355_0,
  ...BATCH_1_356_0,
  ...BATCH_1_357_0,
  ...BATCH_1_358_0,
  ...BATCH_1_359_0,
  ...BATCH_1_360_0,
  ...BATCH_1_361_0,
  ...BATCH_1_362_0,
  ...BATCH_1_363_0,
  ...BATCH_1_364_0,
  ...BATCH_1_365_0,
  ...BATCH_1_366_0,
  ...BATCH_1_367_0,
  ...BATCH_1_368_0,
  ...BATCH_1_369_0,
  ...BATCH_1_370_0,
  ...BATCH_1_371_0,
  ...BATCH_1_372_0,
  ...BATCH_1_373_0,
  ...BATCH_1_374_0,
  ...BATCH_1_375_0,
  ...BATCH_1_376_0,
  ...BATCH_1_377_0,
  ...BATCH_1_378_0,
  ...BATCH_1_379_0,
  ...BATCH_1_380_0,
  ...BATCH_1_381_0,
];

test("shop version is 1.382.0", () => {
  expect(pkg.version).toBe("1.382.0");
  expect(source).toContain('const VERSION = "1.382.0"');
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

test("adds six new 1.382.0 pay routes", () => {
  for (const name of BATCH_1_382_0) {
    expect(routePaths).toContain(`/pay/${name}`);
  }
});

test("new routes are not duplicates of earlier catalogs", () => {
  const prior = new Set([...PRIOR, ...LIVE_EXTRA]);
  for (const name of BATCH_1_382_0) {
    expect(prior.has(name)).toBe(false);
  }
});

test("keccak256 and EIP-55 helpers", () => {
  expect(VERSION).toBe("1.382.0");
  expect(keccak256Hex("")).toBe("c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470");
  expect(keccak256Hex("hello")).toBe("1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8");
  expect(selector("totalSupply()")).toBe("0x18160ddd");
  expect(selector("transfer(address,uint256)")).toBe("0xa9059cbb");
  expect(toChecksumAddress("0x5aaeb6053f3e94c9b9a09f33669435e7ef1beaed")).toBe(
    "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed",
  );
  expect(toChecksumAddress(PAY_TO.toLowerCase())).toBe(PAY_TO);
});
