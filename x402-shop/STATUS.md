# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.13.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/cds` | $0.002 | `host` | DNSSEC Child DS (CDS) records for a public domain |
| `/pay/rrsig` | $0.002 | `host` | DNSSEC RRSIG records for a public hostname |
| `/pay/bimi` | $0.002 | `host`, `selector?` | BIMI TXT at `{selector}._bimi.{host}` (default selector) |
| `/pay/oembed` | $0.003 | `url` | Discover and fetch JSON oEmbed from a public page |
| `/pay/storage` | $0.002 | `address`, `slot` | One storage slot via `eth_getStorageAt` on Base |
| `/pay/feehistory` | $0.001 | `blocks?` | EIP-1559 base fee + 25/50/75 priority percentiles on Base |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.12.0` (`whois` … `blobbasefee`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 08:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass. Live origin still serves catalog `1.4.0`; unpaid `GET /pay/ping` is 402 (`x402Version` 2, `scheme` exact, `network` `eip155:8453`, amount `1000`, extra name `USD Coin` version `2`). Unpaid `GET /pay/cds` is expected 404 until VPS deploy.
