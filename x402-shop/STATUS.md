# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.87.0`
- Batch date: `2026-08-21`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-online-date` | $0.002 | `url` | Highwire Press `name=citation_online_date` online publication dates |
| `/pay/citation-conference-title` | $0.002 | `url` | Highwire Press `name=citation_conference_title` conference names |
| `/pay/citation-pmid` | $0.002 | `url` | Highwire Press `name=citation_pmid` PubMed identifiers |
| `/pay/citation-author-institution` | $0.002 | `url` | Highwire Press `name=citation_author_institution` author affiliations |
| `/pay/citation-journal-abbrev` | $0.002 | `url` | Highwire Press `name=citation_journal_abbrev` abbreviated journal titles |
| `/pay/citation-abstract` | $0.002 | `url` | Highwire Press `name=citation_abstract` scholarly abstracts |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.86.0` (`whois` … `citation-month`). `/pay/citation-date` remains Highwire citation_date; `/pay/citation-publication-date` remains Highwire citation_publication_date; `/pay/citation-journal-title` remains Highwire citation_journal_title; `/pay/citation-title` remains Highwire citation_title; `/pay/citation-doi` remains Highwire citation_doi; `/pay/identifier-url` remains HTML identifier-url / DC.identifier; `/pay/citation-author` remains Highwire citation_author; `/pay/publisher` remains HTML/Dublin Core publisher; `/pay/citation-publisher` remains Highwire citation_publisher; `/pay/description` remains HTML name=description / name=abstract; `/pay/citation-abstract-html-url` remains Highwire citation_abstract_html_url. Remaining Highwire tags include citation_fulltext_world_readable, citation_technical_report_number, citation_technical_report_institution, citation_dissertation_institution, citation_author_email, and citation_author_orcid. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-21 22:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 543 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.87.0 paths `/pay/citation-online-date`, `/pay/citation-conference-title`, `/pay/citation-pmid`, `/pay/citation-author-institution`, `/pay/citation-journal-abbrev`, and `/pay/citation-abstract` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.87.0 not indexed yet). New 1.87.0 paths will index after VPS deploy and another register.
