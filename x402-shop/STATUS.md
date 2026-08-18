# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.10.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/naptr` | $0.002 | `host` | DNS NAPTR records for a public domain |
| `/pay/ptr` | $0.002 | `ip` | Reverse DNS PTR for a public IPv4 address |
| `/pay/svcb` | $0.002 | `host` | DNS HTTPS/SVCB records for a public hostname |
| `/pay/hsts` | $0.001 | `url` | Read `Strict-Transport-Security` from a public URL |
| `/pay/cors` | $0.002 | `url` | Read CORS `Access-Control-*` headers from a public URL |
| `/pay/chainid` | $0.001 | — | Base `eth_chainId` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.9.0` (`whois` … `aasa`). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Deploy and register results will be recorded after tests and VPS push.
