# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.7.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/mx` | $0.002 | `host` | DNS MX records for a public domain |
| `/pay/caa` | $0.002 | `host` | DNS CAA records for a public domain |
| `/pay/security` | $0.001 | `url` | Fetch `/.well-known/security.txt` from a public origin |
| `/pay/ads` | $0.001 | `url` | Fetch `/ads.txt` from a public origin |
| `/pay/keccak` | $0.001 | `text` | Keccak-256 of a short text payload |
| `/pay/basefee` | $0.001 | — | Latest Base EIP-1559 `baseFeePerGas` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), the `1.5.0` batch (`whois` … `keywords`), or the `1.6.0` batch (`spf` … `supply`). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 02:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass. Live origin still serves catalog `1.4.0`; unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/mx` … `/pay/basefee` (and prior undeployed `whois`/`spf`) return 404. SSH to `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru` is `Permission denied (publickey,password)` because this environment has no `VPS_SSH_PRIVATE_KEY`.
- x402scan `registerFromOrigin`: success, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`, source OpenAPI, 28/28 registered, 0 failed, 0 deprecated. New 1.7.0 paths will index after VPS deploy + another register.
