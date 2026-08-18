# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.7.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/mx` | $0.002 | `host` | DNS MX records for a public domain |
| `/pay/caa` | $0.002 | `host` | DNS CAA records for a public domain |
| `/pay/security` | $0.001 | `url` | Fetch `/.well-known/security.txt` from a public origin |
| `/pay/ads` | $0.001 | `url` | Fetch `/ads.txt` from a public origin |
| `/pay/keccak` | $0.001 | `text` | Keccak-256 of a short text payload |
| `/pay/basefee` | $0.001 | — | Latest Base EIP-1559 `baseFeePerGas` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), the `1.5.0` batch (`whois` … `keywords`), or the `1.6.0` batch (`spf` … `supply`). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Deploy and register results are recorded after verification in this run.
