# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.9.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/aaaa` | $0.002 | `host` | DNS AAAA (IPv6) records for a public domain |
| `/pay/cname` | $0.002 | `host` | DNS CNAME record for a public domain |
| `/pay/srv` | $0.002 | `host` | DNS SRV records for a public domain |
| `/pay/app-ads` | $0.001 | `url` | Fetch `/app-ads.txt` from a public origin |
| `/pay/openid` | $0.002 | `url` | Fetch `/.well-known/openid-configuration` from a public origin |
| `/pay/aasa` | $0.002 | `url` | Fetch `/.well-known/apple-app-site-association` from a public origin |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), the `1.5.0` batch (`whois` … `keywords`), the `1.6.0` batch (`spf` … `supply`), the `1.7.0` batch (`mx` … `basefee`), or the `1.8.0` batch (`txt` … `selector`). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 04:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass. Live origin still serves catalog `1.4.0`; unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Deploy and register results follow in this file after VPS SSH and x402scan.
