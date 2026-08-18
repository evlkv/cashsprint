# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.18.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/csync` | $0.002 | `host` | DNS CSYNC child-to-parent synchronization |
| `/pay/kx` | $0.002 | `host` | DNS KX key exchanger records |
| `/pay/dhcid` | $0.002 | `host` | DNS DHCID DHCP identifier records |
| `/pay/oauth` | $0.002 | `host` | OAuth AS metadata via `/.well-known/oauth-authorization-server` |
| `/pay/gpc` | $0.002 | `host` | Global Privacy Control via `/.well-known/gpc.json` |
| `/pay/syncing` | $0.001 | — | `eth_syncing` of the Base RPC |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.17.0` (`whois` … `clientversion`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 13:04 UTC run: tests and register results pending in this file after verification.
