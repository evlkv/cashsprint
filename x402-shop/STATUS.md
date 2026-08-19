# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.36.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/tsig` | $0.002 | `host` | DNS TSIG transaction signature (not TKEY / SIG / RRSIG) |
| `/pay/opt` | $0.002 | `host` | DNS OPT/EDNS pseudo-records (not OpenID / OAuth / URI) |
| `/pay/nxname` | $0.002 | `host` | DNS NXNAME compact denial (not NSEC / NSEC3 / NXT) |
| `/pay/privacy` | $0.002 | `host` | `/.well-known/privacy.txt` |
| `/pay/timezone` | $0.002 | `host` | `/.well-known/timezone` |
| `/pay/protocol` | $0.001 | — | Base `eth_protocolVersion` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.35.0` (`whois` … `hashrate`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/a` was skipped because `/pay/dns` already returns A records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. `/pay/withdrawalsroot` was skipped because `/pay/withdrawals` already returns `withdrawalsRoot`. `/pay/sha3uncles` was skipped because `/pay/uncles` already returns `sha3Uncles`. `/pay/timestamp` was skipped because `/pay/block` already returns `timestamp`. `/pay/totaldifficulty` was skipped because `/pay/difficulty` already returns `totalDifficulty`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 17:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass. One-shot local shop (killed after probes) served OpenAPI `1.36.0` with 220 paths; unpaid `GET /pay/tsig?host=example.com` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `2000`, extra name `USD Coin` version `2`); unpaid `GET /pay/protocol` is 402 amount `1000`; missing `host` on `tsig` / `privacy` / `timezone` still 402. Live origin now serves Devryno catalog `1.8.0` (34 OpenAPI paths including `offer-proof`, commerce/feed extras, and `merchant-feed-audit`); unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/tsig` and `/pay/protocol` are 404 until VPS deploy. SSH to `root@`, `ubuntu@`, and `evgeny@volkov.evgeny.m2.fvds.ru` is `Permission denied (publickey,password)` because this environment has no `VPS_SSH_PRIVATE_KEY`. Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions.
- x402scan `registerFromOrigin`: success, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`, source OpenAPI, 34/34 registered, 0 failed, 0 deprecated. New 1.36.0 paths will index after VPS deploy + another register.
