# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.5.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/whois` | $0.003 | `host` | IANA-referred WHOIS text for a public domain |
| `/pay/cert` | $0.002 | `host` | TLS certificate subject, issuer, and expiry |
| `/pay/ens` | $0.002 | `name` | Resolve an ENS name to an address |
| `/pay/txid` | $0.002 | `hash` | Base transaction plus receipt status |
| `/pay/favicon` | $0.001 | `url` | Favicon URL from a public page |
| `/pay/keywords` | $0.002 | `url` | Meta keywords and title tokens from a public page |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`).

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
