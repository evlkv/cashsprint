# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.59.0`
- Batch date: `2026-08-20`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/service-desc` | $0.002 | `url` | RFC 8631 `rel=service-desc` |
| `/pay/service-doc` | $0.002 | `url` | RFC 8631 `rel=service-doc` |
| `/pay/service-meta` | $0.002 | `url` | RFC 8631 `rel=service-meta` |
| `/pay/blocked-by` | $0.002 | `url` | RFC 7725 `rel=blocked-by` |
| `/pay/sunset` | $0.002 | `url` | RFC 8594 Sunset header + `rel=sunset` |
| `/pay/describes` | $0.002 | `url` | RFC 6892 `rel=describes` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.58.0` (`whois` … `derivedfrom`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/a` was skipped because `/pay/dns` already returns A records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status (`/pay/blockreceipts` is the distinct `eth_getBlockReceipts` RPC). `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. `/pay/withdrawalsroot` was skipped because `/pay/withdrawals` already returns `withdrawalsRoot`. `/pay/sha3uncles` was skipped because `/pay/uncles` already returns `sha3Uncles`. `/pay/timestamp` was skipped because `/pay/block` already returns `timestamp`. `/pay/totaldifficulty` was skipped because `/pay/difficulty` already returns `totalDifficulty`. `/pay/dnt-policy` was skipped because `/pay/dnt` already fetches `/.well-known/dnt-policy.txt`. `/pay/host-meta-json` was skipped because `/pay/host-meta` already fetches `host-meta.json`. `/pay/did-json` was skipped because `/pay/did` already fetches `did.json`. `/pay/bytecode` was skipped because `/pay/code` already returns `eth_getCode`. `/pay/twitter` was skipped because `/pay/meta` already returns `twitter:*` tags. `/pay/prev` was skipped because `/pay/nextprev` already returns `rel=next` and `rel=prev`. `/pay/self` was skipped because `/pay/hub` already returns WebSub `rel=self`. `/pay/preconnect` / `/pay/prefetch` / `/pay/prerender` / `/pay/dns-prefetch` were skipped because `/pay/preload` already returns those resource hints. `/pay/search` was skipped because `/pay/opensearch` already discovers search. `/pay/sha3` was skipped because `/pay/keccak` already hashes with keccak-256. `/pay/privacy` was skipped as a name because that path already fetches `/.well-known/privacy.txt`. `/pay/icon` was skipped because `/pay/favicon` already resolves an icon URL. `/pay/start` was skipped because `/pay/first` already returns first-page pagination. `/pay/types` was skipped because `/pay/type` already returns RFC 6903 `rel=type`. `/pay/unclebyindex` was skipped because `/pay/uncle` already is `eth_getUncleByBlockNumberAndIndex`. `/pay/working-copy-of` was skipped because `/pay/working-copy` covers the RFC 5829 working-copy relation. `/pay/editmedia` was skipped because `/pay/edit-media` already returns AtomPub `rel=edit-media`. `/pay/nextarchive` / `/pay/prevarchive` were skipped because hyphenated RFC 5005 paths already exist. `/pay/raw` was skipped because `/pay/rawtx` already returns the raw/signed latest tx. `/pay/derived-from` was skipped because IANA’s token is `derivedfrom` (`/pay/derivedfrom`). `/pay/service-description` was skipped because IANA’s token is `service-desc`. `/pay/blockedby` was skipped because IANA’s token is `blocked-by`. `/pay/described` was skipped because `/pay/describedby` already exists and `/pay/describes` is the RFC 6892 inverse. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-20 17:00 UTC run: `bun test` in `x402-shop/` pending. No local shop process was started. Live origin still serves Devryno catalog `1.12.2` until VPS deploy.
