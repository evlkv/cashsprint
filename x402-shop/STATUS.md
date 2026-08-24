# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.143.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-bl` | $0.002 | `url` | Highwire Press `name=citation_eisbn_bl` Saint-Barthelemy-edition electronic ISBNs |
| `/pay/citation-isbn-pm` | $0.002 | `url` | Highwire Press `name=citation_isbn_pm` Saint-Pierre-and-Miquelon-edition ISBNs |
| `/pay/citation-eisbn-pm` | $0.002 | `url` | Highwire Press `name=citation_eisbn_pm` Saint-Pierre-and-Miquelon-edition electronic ISBNs |
| `/pay/citation-isbn-gp` | $0.002 | `url` | Highwire Press `name=citation_isbn_gp` Guadeloupe-edition ISBNs |
| `/pay/citation-author-applemail` | $0.002 | `url` | Highwire Press `name=citation_author_applemail` author Apple Mail identifiers |
| `/pay/citation-author-icloudmail` | $0.002 | `url` | Highwire Press `name=citation_author_icloudmail` author iCloud Mail identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.142.0` (`whois` … `citation-author-apple`). `/pay/citation-isbn-bl` remains Highwire citation_isbn_bl; `/pay/citation-author-apple` remains Highwire citation_author_apple; `/pay/citation-author-icloud` remains Highwire citation_author_icloud. Do not use `/pay/eisbn-bl` (`/pay/citation-eisbn-bl`; `/pay/citation-isbn-bl` is print BL; `/pay/citation-eisbn-mf` is eisbn MF; `/pay/citation-eisbn-bq` is eisbn BQ), `/pay/isbn-pm` (`/pay/citation-isbn-pm`; `/pay/citation-isbn-bl` is BL; `/pay/citation-isbn-mf` is MF; `/pay/citation-isbn-gp` is GP), `/pay/eisbn-pm` (`/pay/citation-eisbn-pm`; `/pay/citation-isbn-pm` is print PM; `/pay/citation-eisbn-bl` is eisbn BL; `/pay/citation-eisbn-mf` is eisbn MF), `/pay/isbn-gp` (`/pay/citation-isbn-gp`; `/pay/citation-isbn-pm` is PM; `/pay/citation-isbn-bl` is BL; `/pay/citation-isbn-mf` is MF), `/pay/author-applemail` (`/pay/citation-author-applemail`; `/pay/citation-author-apple` is apple; `/pay/citation-author-appleid` is appleid; `/pay/citation-author-icloudcom` is icloudcom), or `/pay/author-icloudmail` (`/pay/citation-author-icloudmail`; `/pay/citation-author-icloud` is icloud; `/pay/citation-author-icloudcom` is icloudcom; `/pay/citation-author-applemail` is applemail). Remaining Highwire tags include citation_eisbn_gp, citation_isbn_mq, citation_eisbn_mq, citation_isbn_gf, citation_author_icloudid, and citation_author_icloudplus. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 06:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 879 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.143.0 paths `/pay/citation-eisbn-bl`, `/pay/citation-isbn-pm`, `/pay/citation-eisbn-pm`, `/pay/citation-isbn-gp`, `/pay/citation-author-applemail`, and `/pay/citation-author-icloudmail` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.143.0 not indexed yet). New 1.143.0 paths will index after VPS deploy and another register.
