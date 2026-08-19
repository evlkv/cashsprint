# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.35.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/uinfo` | $0.002 | `host` | DNS UINFO user information (not UID / GID / RP) |
| `/pay/unspec` | $0.002 | `host` | DNS UNSPEC unspecified records (not NINFO / NID) |
| `/pay/tkey` | $0.002 | `host` | DNS TKEY transaction key (not KEY / DNSKEY / RKEY) |
| `/pay/api-catalog` | $0.002 | `host` | `/.well-known/api-catalog` (RFC 9727) |
| `/pay/oauth-pr` | $0.002 | `host` | `/.well-known/oauth-protected-resource` (RFC 9728) |
| `/pay/hashrate` | $0.001 | — | Base `eth_hashrate` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`), or undeployed batches `1.5.0`–`1.34.0` (`whois` … `requestshash`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. `/pay/withdrawalsroot` was skipped because `/pay/withdrawals` already returns `withdrawalsRoot`. `/pay/sha3uncles` was skipped because `/pay/uncles` already returns `sha3Uncles`. `/pay/timestamp` was skipped because `/pay/block` already returns `timestamp`. `/pay/totaldifficulty` was skipped because `/pay/difficulty` already returns `totalDifficulty`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 16:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass. One-shot local shop (killed after probes) served OpenAPI `1.35.0` with 214 paths; unpaid `GET /pay/uinfo?host=example.com` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `2000`, extra name `USD Coin` version `2`); unpaid `GET /pay/hashrate` is 402 amount `1000`; missing `host` on `uinfo` / `api-catalog` / `oauth-pr` still 402. Live origin now serves Devryno catalog `1.7.0` (33 OpenAPI paths including `offer-proof` and commerce/feed extras); unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/uinfo` and `/pay/hashrate` are 404 until VPS deploy. SSH to `root@`, `ubuntu@`, and `evgeny@volkov.evgeny.m2.fvds.ru` is `Permission denied (publickey,password)` because this environment has no `VPS_SSH_PRIVATE_KEY`. Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions.
- x402scan `registerFromOrigin`: success, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`, source OpenAPI, 33/33 registered, 0 failed, 0 deprecated. New 1.35.0 paths will index after VPS deploy + another register.
