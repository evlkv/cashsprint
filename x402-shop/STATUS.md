# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.84.0`
- Batch date: `2026-08-21`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-doi` | $0.002 | `url` | Highwire Press `name=citation_doi` Digital Object Identifiers |
| `/pay/citation-journal-title` | $0.002 | `url` | Highwire Press `name=citation_journal_title` journal names |
| `/pay/citation-publication-date` | $0.002 | `url` | Highwire Press `name=citation_publication_date` publication dates |
| `/pay/citation-pdf-url` | $0.002 | `url` | Highwire Press `name=citation_pdf_url` full-text PDF links |
| `/pay/citation-volume` | $0.002 | `url` | Highwire Press `name=citation_volume` journal volume numbers |
| `/pay/citation-issue` | $0.002 | `url` | Highwire Press `name=citation_issue` journal issue numbers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.83.0` (`whois` … `citation-author`). `/pay/identifier-url` remains HTML identifier-url / DC.identifier; `/pay/title` remains HTML title / DC.title; `/pay/citation-title` remains Highwire citation_title; `/pay/publisher` remains HTML publisher; `/pay/date` remains generic DC.date; `/pay/issued` remains DCTERMS.issued; `/pay/enclosure` remains IANA `rel=enclosure`; `/pay/extent` remains DCTERMS.extent. This batch continues Highwire citation metas after citation_title and citation_author in 1.83.0. Remaining Highwire tags include citation_firstpage, citation_lastpage, citation_issn, citation_isbn, citation_abstract_html_url, and citation_fulltext_html_url. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-21 19:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 525 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.84.0 paths `/pay/citation-doi`, `/pay/citation-journal-title`, `/pay/citation-publication-date`, `/pay/citation-pdf-url`, `/pay/citation-volume`, and `/pay/citation-issue` currently 404 on the live origin (undeployed), as do undeployed 1.83.0 paths such as `/pay/date-accepted`. SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true` with 41 resources. New 1.84.0 paths will index after VPS deploy and another register.
