# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.22.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/afsdb` | $0.002 | `host` | DNS AFSDB (AFS Database) records |
| `/pay/dlv` | $0.002 | `host` | DNSSEC Lookaside Validation (DLV) records |
| `/pay/amtrelay` | $0.002 | `host` | DNS AMTRELAY multicast tunnel relay records |
| `/pay/stellar` | $0.002 | `host` | Stellar TOML via `/.well-known/stellar.toml` |
| `/pay/tdmrep` | $0.002 | `host` | TDM Reservation Protocol via `/.well-known/tdmrep.json` |
| `/pay/code` | $0.002 | `address` | Base `eth_getCode` size and keccak-256 |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.21.0` (`whois` … `blobgasused`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 21:07 UTC run: tests pending; deploy pending.
