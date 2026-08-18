# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.21.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/l32` | $0.002 | `host` | DNS L32 ILNP 32-bit locator records |
| `/pay/l64` | $0.002 | `host` | DNS L64 ILNP 64-bit locator records |
| `/pay/lp` | $0.002 | `host` | DNS LP ILNP locator pointer records |
| `/pay/opensearch` | $0.002 | `url` | OpenSearch description link discovery |
| `/pay/keybase` | $0.002 | `host` | Keybase proof via `/.well-known/keybase.txt` |
| `/pay/blobgasused` | $0.001 | — | `blobGasUsed` / `excessBlobGas` of the latest Base block |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.20.0` (`whois` … `listening`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Pending this run: tests, VPS deploy, registerFromOrigin (filled after those steps).
