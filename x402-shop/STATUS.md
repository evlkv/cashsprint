# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.23.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/apl` | $0.002 | `host` | DNS APL (Address Prefix List) records |
| `/pay/ta` | $0.002 | `host` | DNSSEC Trust Anchor (TA) records |
| `/pay/doa` | $0.002 | `host` | DNS DOA (Digital Object Architecture) records |
| `/pay/mcp` | $0.002 | `host` | MCP discovery via `/.well-known/mcp.json` |
| `/pay/protected` | $0.002 | `host` | RFC 9728 `/.well-known/oauth-protected-resource` |
| `/pay/stateroot` | $0.001 | — | Base latest block `stateRoot` |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.22.0` (`whois` … `code`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-18 22:02 UTC run: tests pending; live origin still serves catalog `1.4.0` until VPS deploy.
