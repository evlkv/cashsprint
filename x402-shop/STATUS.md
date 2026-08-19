# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.38.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/ixfr` | $0.002 | `host` | DNS IXFR incremental zone transfer query (not AXFR / SOA / ANY) |
| `/pay/axfr` | $0.002 | `host` | DNS AXFR full zone transfer query (not IXFR / SOA / ANY) |
| `/pay/mailb` | $0.002 | `host` | DNS MAILB mailbox-related records (not MB / MX / MINFO) |
| `/pay/est` | $0.002 | `host` | RFC 7030 `/.well-known/est` |
| `/pay/hoba` | $0.002 | `host` | RFC 7486 `/.well-known/hoba` |
| `/pay/accounts` | $0.001 | — | Base `eth_accounts` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.37.0` (`whois` … `mining`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/a` was skipped because `/pay/dns` already returns A records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. `/pay/withdrawalsroot` was skipped because `/pay/withdrawals` already returns `withdrawalsRoot`. `/pay/sha3uncles` was skipped because `/pay/uncles` already returns `sha3Uncles`. `/pay/timestamp` was skipped because `/pay/block` already returns `timestamp`. `/pay/totaldifficulty` was skipped because `/pay/difficulty` already returns `totalDifficulty`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 19:03 UTC run: pending verify, deploy, and x402scan register.
