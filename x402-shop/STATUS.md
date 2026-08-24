# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.139.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-ai` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ai` Anguilla-edition electronic ISBNs |
| `/pay/citation-isbn-vg` | $0.002 | `url` | Highwire Press `name=citation_isbn_vg` British-Virgin-Islands-edition ISBNs |
| `/pay/citation-eisbn-vg` | $0.002 | `url` | Highwire Press `name=citation_eisbn_vg` British-Virgin-Islands-edition electronic ISBNs |
| `/pay/citation-isbn-tc` | $0.002 | `url` | Highwire Press `name=citation_isbn_tc` Turks-and-Caicos-edition ISBNs |
| `/pay/citation-author-mobileme` | $0.002 | `url` | Highwire Press `name=citation_author_mobileme` author MobileMe identifiers |
| `/pay/citation-author-mecom` | $0.002 | `url` | Highwire Press `name=citation_author_mecom` author me.com identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.138.0` (`whois` … `citation-author-mac`). `/pay/citation-isbn-ai` remains Highwire citation_isbn_ai; `/pay/citation-eisbn-ms` remains Highwire citation_eisbn_ms; `/pay/citation-author-mac` remains Highwire citation_author_mac; `/pay/citation-author-me` remains Highwire citation_author_me. Do not use `/pay/eisbn-ai` (`/pay/citation-eisbn-ai`; `/pay/citation-isbn-ai` is print AI; `/pay/citation-eisbn-ms` is eisbn MS; `/pay/citation-eisbn-ky` is eisbn KY; `/pay/citation-eisbn-kn` is eisbn KN), `/pay/isbn-vg` (`/pay/citation-isbn-vg`; `/pay/citation-isbn-ai` is AI; `/pay/citation-isbn-ms` is MS; `/pay/citation-isbn-ky` is KY; `/pay/citation-isbn-dm` is DM), `/pay/eisbn-vg` (`/pay/citation-eisbn-vg`; `/pay/citation-isbn-vg` is print VG; `/pay/citation-eisbn-ai` is eisbn AI; `/pay/citation-eisbn-ms` is eisbn MS; `/pay/citation-eisbn-ky` is eisbn KY), `/pay/isbn-tc` (`/pay/citation-isbn-tc`; `/pay/citation-isbn-vg` is VG; `/pay/citation-isbn-ai` is AI; `/pay/citation-isbn-ms` is MS; `/pay/citation-isbn-ky` is KY), `/pay/author-mobileme` (`/pay/citation-author-mobileme`; `/pay/citation-author-mac` is mac; `/pay/citation-author-me` is me; `/pay/citation-author-icloud` is icloud; `/pay/citation-author-outlook` is outlook), or `/pay/author-mecom` (`/pay/citation-author-mecom`; `/pay/citation-author-mobileme` is mobileme; `/pay/citation-author-mac` is mac; `/pay/citation-author-me` is me; `/pay/citation-author-icloud` is icloud). Remaining Highwire tags include citation_eisbn_tc, citation_isbn_aw, citation_eisbn_aw, citation_isbn_cw, citation_author_macmail, and citation_author_dotmac. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 02:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 855 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.139.0 paths `/pay/citation-eisbn-ai`, `/pay/citation-isbn-vg`, `/pay/citation-eisbn-vg`, `/pay/citation-isbn-tc`, `/pay/citation-author-mobileme`, and `/pay/citation-author-mecom` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.139.0 not indexed yet). New 1.139.0 paths will index after VPS deploy and another register.
