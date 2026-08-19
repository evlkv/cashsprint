# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.27.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/dnscert` | $0.002 | `host` | DNS CERT (RFC 4398) records (not TLS `/pay/cert`) |
| `/pay/avc` | $0.002 | `host` | DNS AVC (Application Visibility and Control) |
| `/pay/nsap` | $0.002 | `host` | DNS NSAP address records |
| `/pay/change-password` | $0.002 | `host` | `/.well-known/change-password` Location |
| `/pay/web-identity` | $0.002 | `host` | FedCM `/.well-known/web-identity` |
| `/pay/extradata` | $0.001 | — | Base latest block `extraData` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.26.0` (`whois` … `logsbloom`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
