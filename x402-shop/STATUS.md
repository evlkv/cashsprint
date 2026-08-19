# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.37.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/null` | $0.002 | `host` | DNS NULL experimental records (not NXNAME / NSEC / OPT) |
| `/pay/any` | $0.002 | `host` | DNS ANY/ALL query (not A via `/pay/dns`) |
| `/pay/time` | $0.002 | `host` | `/.well-known/time` |
| `/pay/posh` | $0.002 | `host`, optional `service` | RFC 7711 `/.well-known/posh/{service}.json` |
| `/pay/cmp` | $0.002 | `host` | RFC 9811 `/.well-known/cmp` |
| `/pay/mining` | $0.001 | — | Base `eth_mining` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.36.0` (`whois` … `protocol`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/a` was skipped because `/pay/dns` already returns A records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. `/pay/withdrawalsroot` was skipped because `/pay/withdrawals` already returns `withdrawalsRoot`. `/pay/sha3uncles` was skipped because `/pay/uncles` already returns `sha3Uncles`. `/pay/timestamp` was skipped because `/pay/block` already returns `timestamp`. `/pay/totaldifficulty` was skipped because `/pay/difficulty` already returns `totalDifficulty`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 18:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass. One-shot local shop (killed after probes) served OpenAPI `1.37.0` with 226 paths; unpaid `GET /pay/null?host=example.com` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `2000`, extra name `USD Coin` version `2`); unpaid `GET /pay/mining` is 402 amount `1000`; missing `host` on `null` / `any` / `time` / `posh` / `cmp` still 402. Live origin now serves Devryno catalog `1.9.0` (35 OpenAPI paths: 34 `/pay/*` including `offer-proof`, commerce/feed extras, and `merchant-feed-audit`, plus `/claim/merchant-feed-audit`); unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/null` and `/pay/mining` are 404 until VPS deploy. SSH to `root@`, `ubuntu@`, and `evgeny@volkov.evgeny.m2.fvds.ru` is `Permission denied (publickey,password)` because this environment has no `VPS_SSH_PRIVATE_KEY`. Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions.
- x402scan `registerFromOrigin`: success, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`, source OpenAPI, 34/35 registered, 0 failed, 1 skipped (`/claim/merchant-feed-audit`, no valid x402 response), 0 deprecated. New 1.37.0 paths will index after VPS deploy + another register.
