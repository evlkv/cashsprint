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
- Pending: tests, VPS deploy, x402scan register (this run).
