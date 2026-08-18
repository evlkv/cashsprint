# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.17.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/zonemd` | $0.002 | `host` | DNSSEC ZONEMD zone message digest |
| `/pay/hinfo` | $0.002 | `host` | DNS HINFO CPU and OS records |
| `/pay/rp` | $0.002 | `host` | DNS RP responsible-person records |
| `/pay/jwks` | $0.002 | `host` | JWKS via `/.well-known/jwks.json` |
| `/pay/farcaster` | $0.002 | `host` | Farcaster account association via `/.well-known/farcaster.json` |
| `/pay/clientversion` | $0.001 | — | `web3_clientVersion` of the Base RPC |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.16.0` (`whois` … `blocksize`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 12:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass. Live origin still serves catalog `1.4.0`; unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/zonemd` is 404 until VPS deploy. Deploy and x402scan results pending in this run.
