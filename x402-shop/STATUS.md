# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.24.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/wallet` | $0.002 | `host` | DNS WALLET (cryptocurrency address) records |
| `/pay/dsync` | $0.002 | `host` | DNS DSYNC (delegation synchronization) records |
| `/pay/resinfo` | $0.002 | `host` | DNS RESINFO (resolver information) records |
| `/pay/agent-card` | $0.002 | `host` | A2A `/.well-known/agent-card.json` |
| `/pay/trust` | $0.002 | `host` | `/.well-known/trust.txt` |
| `/pay/receiptsroot` | $0.001 | — | Base latest block `receiptsRoot` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.23.0` (`whois` … `stateroot`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Pending: `bun test`, live unpaid probes, VPS deploy, x402scan register
