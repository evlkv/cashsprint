# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.19.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/hip` | $0.002 | `host` | DNS HIP Host Identity Protocol records |
| `/pay/ipseckey` | $0.002 | `host` | DNS IPSECKEY IPsec public key records |
| `/pay/eui64` | $0.002 | `host` | DNS EUI64 64-bit identifier mapping |
| `/pay/matrix` | $0.002 | `host` | Matrix federation via `/.well-known/matrix/server` |
| `/pay/passkey` | $0.002 | `host` | Passkey endpoints via `/.well-known/passkey-endpoints` |
| `/pay/peercount` | $0.001 | — | `net_peerCount` of the Base RPC |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.18.0` (`whois` … `syncing`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 14:01 UTC run: tests pending; live origin still expected at catalog `1.4.0` until VPS deploy.
