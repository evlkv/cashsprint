# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.61.0`
- Batch date: `2026-08-20`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/cite-as` | $0.002 | `url` | RFC 8574 `rel=cite-as` |
| `/pay/convertedfrom` | $0.002 | `url` | IANA `rel=convertedFrom` |
| `/pay/hosts` | $0.002 | `url` | RFC 6690 `rel=hosts` |
| `/pay/linkset` | $0.002 | `url` | RFC 9264 `rel=linkset` |
| `/pay/ruleinput` | $0.002 | `url` | RFC 6903 `rel=ruleinput` |
| `/pay/timesheet` | $0.002 | `url` | RFC 6903 `rel=timesheet` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.60.0` (`whois` … `disclosure`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/a` was skipped because `/pay/dns` already returns A records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status (`/pay/blockreceipts` is the distinct `eth_getBlockReceipts` RPC). `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. `/pay/withdrawalsroot` was skipped because `/pay/withdrawals` already returns `withdrawalsRoot`. `/pay/sha3uncles` was skipped because `/pay/uncles` already returns `sha3Uncles`. `/pay/timestamp` was skipped because `/pay/block` already returns `timestamp`. `/pay/totaldifficulty` was skipped because `/pay/difficulty` already returns `totalDifficulty`. `/pay/dnt-policy` was skipped because `/pay/dnt` already fetches `/.well-known/dnt-policy.txt`. `/pay/host-meta-json` was skipped because `/pay/host-meta` already fetches `host-meta.json`. `/pay/did-json` was skipped because `/pay/did` already fetches `did.json`. `/pay/bytecode` was skipped because `/pay/code` already returns `eth_getCode`. `/pay/twitter` was skipped because `/pay/meta` already returns `twitter:*` tags. `/pay/prev` was skipped because `/pay/nextprev` already returns `rel=next` and `rel=prev`. `/pay/self` was skipped because `/pay/hub` already returns WebSub `rel=self`. `/pay/preconnect` / `/pay/prefetch` / `/pay/prerender` / `/pay/dns-prefetch` were skipped because `/pay/preload` already returns those resource hints. `/pay/search` was skipped because `/pay/opensearch` already discovers search. `/pay/sha3` was skipped because `/pay/keccak` already hashes with keccak-256. `/pay/privacy` was skipped as a name because that path already fetches `/.well-known/privacy.txt`. `/pay/icon` was skipped because `/pay/favicon` already resolves an icon URL. `/pay/start` was skipped because `/pay/first` already returns first-page pagination. `/pay/types` was skipped because `/pay/type` already returns RFC 6903 `rel=type`. `/pay/unclebyindex` was skipped because `/pay/uncle` already is `eth_getUncleByBlockNumberAndIndex`. `/pay/working-copy-of` was skipped because `/pay/working-copy` covers the RFC 5829 working-copy relation. `/pay/editmedia` was skipped because `/pay/edit-media` already returns AtomPub `rel=edit-media`. `/pay/nextarchive` / `/pay/prevarchive` were skipped because hyphenated RFC 5005 paths already exist. `/pay/raw` was skipped because `/pay/rawtx` already returns the raw/signed latest tx. `/pay/derived-from` was skipped because IANA’s token is `derivedfrom` (`/pay/derivedfrom`). `/pay/service-description` was skipped because IANA’s token is `service-desc`. `/pay/blockedby` was skipped because IANA’s token is `blocked-by`. `/pay/described` was skipped because `/pay/describedby` already exists and `/pay/describes` is the RFC 6892 inverse. `/pay/creates-form` was skipped because IANA’s token is `create-form`. `/pay/edits-form` was skipped because IANA’s token is `edit-form`. `/pay/converted-from` was skipped because IANA’s token is `convertedFrom` (`/pay/convertedfrom`). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-20 19:00 UTC run: pending `bun test` and VPS deploy.
