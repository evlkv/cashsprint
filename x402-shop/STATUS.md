# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.34.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/mf` | $0.002 | `host` | DNS MF mail forwarder (not MD / MX / MB) |
| `/pay/uid` | $0.002 | `host` | DNS UID user identifier (not GID / RP) |
| `/pay/gid` | $0.002 | `host` | DNS GID group identifier (not UID) |
| `/pay/lnurlp` | $0.002 | `host`, `name` | `/.well-known/lnurlp/{name}` |
| `/pay/oauth-as` | $0.002 | `host` | `/.well-known/oauth-authorization-server` |
| `/pay/requestshash` | $0.001 | — | Base latest block `requestsHash` (EIP-7685) |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.33.0` (`whois` … `beaconroot`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 12:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass. One-shot local shop (killed after probes) served OpenAPI `1.34.0` with 208 paths; unpaid `GET /pay/mf?host=example.com` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `2000`, extra name `USD Coin` version `2`); unpaid `GET /pay/requestshash` is 402 amount `1000`; missing `host` (and `lnurlp` missing `name`) still 402. Live origin still serves catalog `1.4.0`; unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/mf` and `/pay/requestshash` are 404 until VPS deploy. SSH to `root@`, `ubuntu@`, and `evgeny@volkov.evgeny.m2.fvds.ru` is `Permission denied (publickey,password)` because this environment has no `VPS_SSH_PRIVATE_KEY`. Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions.
- x402scan `registerFromOrigin`: success, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`, source OpenAPI, 29/29 registered, 0 failed, 0 deprecated. New 1.34.0 paths will index after VPS deploy + another register.
