# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.29.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/x25` | $0.002 | `host` | DNS X25 (RFC 1183) PSDN address |
| `/pay/isdn` | $0.002 | `host` | DNS ISDN (RFC 1183) address |
| `/pay/ninfo` | $0.002 | `host` | DNS NINFO zone status |
| `/pay/jmap` | $0.002 | `host` | `/.well-known/jmap` session discovery |
| `/pay/csaf` | $0.002 | `host` | CSAF `/.well-known/csaf/provider-metadata.json` |
| `/pay/mixhash` | $0.001 | — | Base latest block `mixHash` (prevRandao) |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.28.0` (`whois` … `withdrawals`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 07:04 UTC run: tests and live probes pending.
