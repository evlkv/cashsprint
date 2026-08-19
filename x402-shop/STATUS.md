# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.25.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/key` | $0.002 | `host` | DNS KEY (RFC 2535 public key) records |
| `/pay/sig` | $0.002 | `host` | DNS SIG (RFC 2535 signature) records |
| `/pay/nxt` | $0.002 | `host` | DNS NXT (next-domain type bitmap) records |
| `/pay/ai-plugin` | $0.002 | `host` | `/.well-known/ai-plugin.json` |
| `/pay/related` | $0.002 | `host` | `/.well-known/related-website-set.json` |
| `/pay/txroot` | $0.001 | — | Base latest block `transactionsRoot` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.24.0` (`whois` … `receiptsroot`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Pending this run: `bun test`, live 402 probe, VPS deploy, x402scan register.
