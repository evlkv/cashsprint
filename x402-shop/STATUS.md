# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.142.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-bq` | $0.002 | `url` | Highwire Press `name=citation_eisbn_bq` Bonaire-edition electronic ISBNs |
| `/pay/citation-isbn-mf` | $0.002 | `url` | Highwire Press `name=citation_isbn_mf` Saint-Martin-edition ISBNs |
| `/pay/citation-eisbn-mf` | $0.002 | `url` | Highwire Press `name=citation_eisbn_mf` Saint-Martin-edition electronic ISBNs |
| `/pay/citation-isbn-bl` | $0.002 | `url` | Highwire Press `name=citation_isbn_bl` Saint-Barthelemy-edition ISBNs |
| `/pay/citation-author-appleid` | $0.002 | `url` | Highwire Press `name=citation_author_appleid` author Apple ID identifiers |
| `/pay/citation-author-apple` | $0.002 | `url` | Highwire Press `name=citation_author_apple` author Apple identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.141.0` (`whois` … `citation-author-icloudcom`). `/pay/citation-isbn-bq` remains Highwire citation_isbn_bq; `/pay/mf` remains DNS MF; `/pay/citation-author-icloudcom` remains Highwire citation_author_icloudcom; `/pay/citation-author-icloud` remains Highwire citation_author_icloud. Do not use `/pay/eisbn-bq` (`/pay/citation-eisbn-bq`; `/pay/citation-isbn-bq` is print BQ; `/pay/citation-eisbn-sx` is eisbn SX; `/pay/citation-eisbn-cw` is eisbn CW; `/pay/citation-eisbn-aw` is eisbn AW), `/pay/isbn-mf` (`/pay/citation-isbn-mf`; `/pay/mf` is DNS MF; `/pay/citation-isbn-bq` is BQ; `/pay/citation-isbn-sx` is SX; `/pay/citation-isbn-cw` is CW), `/pay/eisbn-mf` (`/pay/citation-eisbn-mf`; `/pay/citation-isbn-mf` is print MF; `/pay/citation-eisbn-bq` is eisbn BQ; `/pay/citation-eisbn-sx` is eisbn SX), `/pay/isbn-bl` (`/pay/citation-isbn-bl`; `/pay/citation-isbn-mf` is MF; `/pay/citation-isbn-bq` is BQ; `/pay/citation-isbn-sx` is SX), `/pay/author-appleid` (`/pay/citation-author-appleid`; `/pay/citation-author-icloudcom` is icloudcom; `/pay/citation-author-icloud` is icloud; `/pay/citation-author-maccom` is maccom; `/pay/citation-author-dotmac` is dotmac), or `/pay/author-apple` (`/pay/citation-author-apple`; `/pay/citation-author-appleid` is appleid; `/pay/citation-author-icloudcom` is icloudcom; `/pay/citation-author-icloud` is icloud; `/pay/citation-author-maccom` is maccom). Remaining Highwire tags include citation_eisbn_bl, citation_isbn_pm, citation_eisbn_pm, citation_isbn_gp, citation_author_applemail, and citation_author_icloudmail. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 05:07 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 873 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.142.0 paths `/pay/citation-eisbn-bq`, `/pay/citation-isbn-mf`, `/pay/citation-eisbn-mf`, `/pay/citation-isbn-bl`, `/pay/citation-author-appleid`, and `/pay/citation-author-apple` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.142.0 not indexed yet). New 1.142.0 paths will index after VPS deploy and another register.
