# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.20.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/eui48` | $0.002 | `host` | DNS EUI48 48-bit identifier mapping |
| `/pay/nid` | $0.002 | `host` | DNS NID ILNP Node Identifier records |
| `/pay/webauthn` | $0.002 | `host` | WebAuthn related origins via `/.well-known/webauthn` |
| `/pay/caldav` | $0.002 | `host` | CalDAV discovery via `/.well-known/caldav` |
| `/pay/carddav` | $0.002 | `host` | CardDAV discovery via `/.well-known/carddav` |
| `/pay/listening` | $0.001 | — | `net_listening` of the Base RPC |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.19.0` (`whois` … `peercount`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Tests and live probe results pending this run.
