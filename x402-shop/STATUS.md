# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.14.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/nsec` | $0.002 | `host` | DNSSEC NSEC next-secure records for a public hostname |
| `/pay/cdnskey` | $0.002 | `host` | DNSSEC Child DNSKEY (CDNSKEY) records for a public domain |
| `/pay/uri` | $0.002 | `host` | URI records (RFC 7553) for a public hostname |
| `/pay/host-meta` | $0.002 | `host` | RFC 6415 `/.well-known/host-meta(.json)` discovery |
| `/pay/maxpriority` | $0.001 | — | Suggested EIP-1559 max priority fee per gas on Base |
| `/pay/coinbase` | $0.001 | — | Fee recipient (coinbase) of the latest Base block |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.13.0` (`whois` … `feehistory`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 09:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass. Live origin still serves catalog `1.4.0`; unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/nsec` is 404 until VPS deploy. SSH to `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru` is `Permission denied (publickey,password)` because this environment has no `VPS_SSH_PRIVATE_KEY`. Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions.
- x402scan `registerFromOrigin`: success, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`, source OpenAPI, 28/28 registered, 0 failed, 0 deprecated. New 1.14.0 paths will index after VPS deploy + another register.
