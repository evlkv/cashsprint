# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.50.0`
- Batch date: `2026-08-20`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/stylesheet` | $0.002 | `url` | HTML `rel=stylesheet` links |
| `/pay/alternate` | $0.002 | `url` | All `rel=alternate` variants (type/media/title/hreflang) |
| `/pay/edit` | $0.002 | `url` | AtomPub `rel=edit` IRIs |
| `/pay/up` | $0.002 | `url` | Hierarchical `rel=up` parent links |
| `/pay/enclosure` | $0.002 | `url` | Atom/RSS `rel=enclosure` media |
| `/pay/pending` | $0.002 | — | Base `eth_getBlockByNumber(pending)` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.49.0` (`whois` … `logs`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/a` was skipped because `/pay/dns` already returns A records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status (`/pay/blockreceipts` is the distinct `eth_getBlockReceipts` RPC). `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. `/pay/withdrawalsroot` was skipped because `/pay/withdrawals` already returns `withdrawalsRoot`. `/pay/sha3uncles` was skipped because `/pay/uncles` already returns `sha3Uncles`. `/pay/timestamp` was skipped because `/pay/block` already returns `timestamp`. `/pay/totaldifficulty` was skipped because `/pay/difficulty` already returns `totalDifficulty`. `/pay/dnt-policy` was skipped because `/pay/dnt` already fetches `/.well-known/dnt-policy.txt`. `/pay/host-meta-json` was skipped because `/pay/host-meta` already fetches `host-meta.json`. `/pay/did-json` was skipped because `/pay/did` already fetches `did.json`. `/pay/bytecode` was skipped because `/pay/code` already returns `eth_getCode`. `/pay/twitter` was skipped because `/pay/meta` already returns `twitter:*` tags. `/pay/prev` was skipped because `/pay/nextprev` already returns `rel=next` and `rel=prev`. `/pay/self` was skipped because `/pay/hub` already returns WebSub `rel=self`. `/pay/preconnect` / `/pay/prefetch` / `/pay/prerender` were skipped because `/pay/preload` already returns those resource hints. `/pay/search` was skipped because `/pay/opensearch` already discovers search. `/pay/sha3` was skipped because `/pay/keccak` already hashes with keccak-256. `/pay/privacy` was skipped as a name because that path already fetches `/.well-known/privacy.txt`. `/pay/icon` was skipped because `/pay/favicon` already resolves an icon URL. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-20 07:04 UTC run: tests and deploy pending in this file until verification completes.
