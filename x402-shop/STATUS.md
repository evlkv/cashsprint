# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.6.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/spf` | $0.002 | `host` | DNS TXT SPF records for a public domain |
| `/pay/dmarc` | $0.002 | `host` | DMARC TXT policy for a public domain |
| `/pay/hreflang` | $0.002 | `url` | rel=alternate hreflang URLs from a public page |
| `/pay/llms` | $0.002 | `url` | Fetch `/llms.txt` from a public origin |
| `/pay/checksum` | $0.001 | `address` | EIP-55 checksum an Ethereum address |
| `/pay/supply` | $0.002 | `address` | ERC-20 totalSupply on Base |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`) and not in the `1.5.0` batch (`whois` … `keywords`).

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Deploy/register outcome: pending this run
