# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.30.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/eid` | $0.002 | `host` | DNS EID (NIMROD) endpoint identifier |
| `/pay/nimloc` | $0.002 | `host` | DNS NIMLOC (NIMROD) locator |
| `/pay/atma` | $0.002 | `host` | DNS ATMA ATM address |
| `/pay/core` | $0.002 | `host` | CoRE `/.well-known/core` link format |
| `/pay/uma` | $0.002 | `host` | UMA 2.0 `/.well-known/uma2-configuration` |
| `/pay/uncles` | $0.001 | — | Base latest block `sha3Uncles` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.29.0` (`whois` … `mixhash`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 08:01 UTC run: `bun test` in `x402-shop/` is 6/6 pass. Live origin still serves catalog `1.4.0`. Deploy and register results pending this run.
