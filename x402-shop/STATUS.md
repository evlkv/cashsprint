# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.8.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/txt` | $0.002 | `host` | DNS TXT records for a public domain |
| `/pay/soa` | $0.002 | `host` | DNS SOA record for a public domain |
| `/pay/humans` | $0.001 | `url` | Fetch `/humans.txt` from a public origin |
| `/pay/assetlinks` | $0.002 | `url` | Fetch `/.well-known/assetlinks.json` from a public origin |
| `/pay/priority` | $0.001 | — | Current Base `eth_maxPriorityFeePerGas` |
| `/pay/selector` | $0.001 | `sig` | 4-byte keccak selector for a Solidity function signature |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), the `1.5.0` batch (`whois` … `keywords`), the `1.6.0` batch (`spf` … `supply`), or the `1.7.0` batch (`mx` … `basefee`). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 03:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass. Live origin still serves catalog `1.4.0`. Deploy/register results recorded in a follow-up commit after VPS SSH and x402scan.
