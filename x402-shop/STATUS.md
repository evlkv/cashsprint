# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.32.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/a6` | $0.002 | `host` | DNS A6 IPv6 prefix records (not AAAA / generic DNS) |
| `/pay/sink` | $0.002 | `host` | DNS SINK experimental coding records |
| `/pay/mb` | $0.002 | `host` | DNS MB mailbox domain (not MX / MINFO) |
| `/pay/funding` | $0.002 | `host` | `/.well-known/funding-manifest-urls` |
| `/pay/gnap` | $0.002 | `host` | `/.well-known/gnap-as-rs` |
| `/pay/excessblobgas` | $0.001 | — | Base latest block `excessBlobGas` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.31.0` (`whois` … `difficulty`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Deploy and register results pending this run.
