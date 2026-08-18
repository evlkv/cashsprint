# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.12.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/dnskey` | $0.002 | `host` | DNSSEC DNSKEY records for a public domain |
| `/pay/dkim` | $0.002 | `host`, `selector` | DKIM TXT at `{selector}._domainkey.{host}` |
| `/pay/mta-sts` | $0.003 | `host` | MTA-STS TXT id plus policy file |
| `/pay/nodeinfo` | $0.002 | `host` | NodeInfo well-known discovery + schema document |
| `/pay/proxy` | $0.002 | `address` | EIP-1967 implementation, admin and beacon slots on Base |
| `/pay/blobbasefee` | $0.001 | — | Current blob base fee on Base |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.11.0` (`whois` … `blockhash`). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Pending live checks after `bun test` and VPS deploy.
