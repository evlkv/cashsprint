# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.16.0`
- Batch date: `2026-08-18`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/nsec3param` | $0.002 | `host` | DNSSEC NSEC3PARAM hashing parameters |
| `/pay/openpgpkey` | $0.002 | `host` | OPENPGPKEY OpenPGP public-key records |
| `/pay/dname` | $0.002 | `host` | DNS DNAME delegation-name aliases |
| `/pay/did` | $0.002 | `host` | DID document via `/.well-known/did.json` |
| `/pay/nostr` | $0.002 | `host` | Nostr NIP-05 names via `/.well-known/nostr.json` |
| `/pay/blocksize` | $0.001 | — | Size in bytes of the latest Base block |

These paths were not in the live `1.4.0` catalog (`ping` … `ns`), or undeployed batches `1.5.0`–`1.15.0` (`whois` … `txcount`). `/pay/https` was skipped because `/pay/svcb` already returns HTTPS DNS records. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- Pending this run: tests, VPS deploy, x402scan register. Live origin still served catalog `1.4.0` at start of run.
