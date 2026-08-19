# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.34.0`
- Batch date: `2026-08-19`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/mf` | $0.002 | `host` | DNS MF mail forwarder (not MD / MX / MB) |
| `/pay/uid` | $0.002 | `host` | DNS UID user identifier (not GID / RP) |
| `/pay/gid` | $0.002 | `host` | DNS GID group identifier (not UID) |
| `/pay/lnurlp` | $0.002 | `host`, `name` | `/.well-known/lnurlp/{name}` |
| `/pay/oauth-as` | $0.002 | `host` | `/.well-known/oauth-authorization-server` |
| `/pay/requestshash` | $0.001 | — | Base latest block `requestsHash` (EIP-7685) |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.33.0` (`whois` … `beaconroot`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. `/pay/gaslimit` was skipped because `/pay/gasused` already returns `gasLimit`. `/pay/receipt` was skipped because `/pay/txid` already returns receipt status. `/pay/parent` was skipped because `/pay/blockhash` already returns `parentHash`. `/pay/miner` was skipped because `/pay/coinbase` already returns the block miner. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-19 12:01 UTC run: catalog tests and one-shot probes pending in this file after verification. SSH key status TBD.
