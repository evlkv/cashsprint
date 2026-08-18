# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.15.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/nsec3` | $0.002 | `host` | DNSSEC NSEC3 hashed next-secure records |
| `/pay/smimea` | $0.002 | `host` | S/MIME certificate association (SMIMEA) records |
| `/pay/loc` | $0.002 | `host` | DNS LOC geographic location records |
| `/pay/atproto` | $0.002 | `host` | AT Protocol DID via `/.well-known/atproto-did` |
| `/pay/gasused` | $0.001 | — | Gas used in the latest Base block |
| `/pay/txcount` | $0.001 | — | Transaction count of the latest Base block |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.14.0` (`whois` … `coinbase`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Pending: `bun test` plus live unpaid probes, VPS rsync, and x402scan register after this batch lands.
