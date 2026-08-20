# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.57.0`
- Batch date: `2026-08-20`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/edit-media` | $0.002 | `url` | RFC 5023 AtomPub `rel=edit-media` |
| `/pay/next-archive` | $0.002 | `url` | RFC 5005 `rel=next-archive` |
| `/pay/prev-archive` | $0.002 | `url` | RFC 5005 `rel=prev-archive` |
| `/pay/service` | $0.002 | `url` | Atom/RFC 5023 `rel=service` |
| `/pay/monitor` | $0.002 | `url` | RFC 5989 `rel=monitor` |
| `/pay/rawtx` | $0.002 | — | Base `eth_getRawTransactionByHash` for latest tx index 0 |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.56.0` (`whois` … `accesslist`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/a` was skipped because `/pay/dns` already returns A records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status (`/pay/blockreceipts` is the distinct `eth_getBlockReceipts` RPC). `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. `/pay/withdrawalsroot` was skipped because `/pay/withdrawals` already returns `withdrawalsRoot`. `/pay/sha3uncles` was skipped because `/pay/uncles` already returns `sha3Uncles`. `/pay/timestamp` was skipped because `/pay/block` already returns `timestamp`. `/pay/totaldifficulty` was skipped because `/pay/difficulty` already returns `totalDifficulty`. `/pay/dnt-policy` was skipped because `/pay/dnt` already fetches `/.well-known/dnt-policy.txt`. `/pay/host-meta-json` was skipped because `/pay/host-meta` already fetches `host-meta.json`. `/pay/did-json` was skipped because `/pay/did` already fetches `did.json`. `/pay/bytecode` was skipped because `/pay/code` already returns `eth_getCode`. `/pay/twitter` was skipped because `/pay/meta` already returns `twitter:*` tags. `/pay/prev` was skipped because `/pay/nextprev` already returns `rel=next` and `rel=prev`. `/pay/self` was skipped because `/pay/hub` already returns WebSub `rel=self`. `/pay/preconnect` / `/pay/prefetch` / `/pay/prerender` / `/pay/dns-prefetch` were skipped because `/pay/preload` already returns those resource hints. `/pay/search` was skipped because `/pay/opensearch` already discovers search. `/pay/sha3` was skipped because `/pay/keccak` already hashes with keccak-256. `/pay/privacy` was skipped as a name because that path already fetches `/.well-known/privacy.txt`. `/pay/icon` was skipped because `/pay/favicon` already resolves an icon URL. `/pay/start` was skipped because `/pay/first` already returns first-page pagination. `/pay/types` was skipped because `/pay/type` already returns RFC 6903 `rel=type`. `/pay/unclebyindex` was skipped because `/pay/uncle` already is `eth_getUncleByBlockNumberAndIndex`. `/pay/working-copy-of` was skipped because `/pay/working-copy` covers the RFC 5829 working-copy relation. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-20 15:00 UTC run: `bun test` in `x402-shop/` pending. No local shop process was started. Live origin currently serves Devryno catalog `1.12.2` (41 OpenAPI paths: 34 `/pay/*` including `offer-proof`, commerce/feed extras, and `merchant-feed-audit`, plus `/free/merchant-feed-preview` and claim/quote merchant-feed-audit, base-usdc-receipt, and base-usdc-wallet-statement); unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/edit-media`, `/pay/next-archive`, `/pay/prev-archive`, `/pay/service`, `/pay/monitor`, and `/pay/rawtx` are 404 until VPS deploy. SSH to `root@`, `ubuntu@`, and `evgeny@volkov.evgeny.m2.fvds.ru` is pending this run. Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions.
- x402scan `registerFromOrigin`: pending this run. originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`. New 1.57.0 paths will index after VPS deploy + another register.
