# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.31.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/nsap-ptr` | $0.002 | `host` | DNS NSAP-PTR pointer (not IPv4 PTR / NSAP) |
| `/pay/rkey` | $0.002 | `host` | DNS RKEY (not KEY / DNSKEY) |
| `/pay/talink` | $0.002 | `host` | DNS TALINK previous/next trust-anchor links |
| `/pay/xrpl` | $0.002 | `host` | XRP Ledger `/.well-known/xrp-ledger.toml` |
| `/pay/publiccode` | $0.002 | `host` | `/.well-known/publiccode.yml` |
| `/pay/difficulty` | $0.001 | — | Base latest block `difficulty` + `totalDifficulty` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.30.0` (`whois` … `uncles`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Pending local verify, VPS deploy, and x402scan register on this run.
