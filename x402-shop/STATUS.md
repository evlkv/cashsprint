# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.26.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/tlsrpt` | $0.002 | `host` | SMTP TLS reporting (TLSRPT) at `_smtp._tls` |
| `/pay/wks` | $0.002 | `host` | DNS WKS (well-known services) records |
| `/pay/rt` | $0.002 | `host` | DNS RT (route-through) records |
| `/pay/dnt` | $0.002 | `host` | `/.well-known/dnt-policy.txt` |
| `/pay/did-config` | $0.002 | `host` | `/.well-known/did-configuration.json` |
| `/pay/logsbloom` | $0.001 | — | Base latest block `logsBloom` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.25.0` (`whois` … `txroot`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 01:05 UTC run: tests pending; live origin still expected to serve catalog `1.4.0` until VPS deploy. SSH key status will be recorded after the deploy attempt.
