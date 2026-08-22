# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.89.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-reference` | $0.002 | `url` | Highwire Press `name=citation_reference` bibliographic citations |
| `/pay/citation-dissertation-name` | $0.002 | `url` | Highwire Press `name=citation_dissertation_name` thesis titles |
| `/pay/citation-public-url` | $0.002 | `url` | Highwire Press `name=citation_public_url` public landing URLs |
| `/pay/citation-section` | $0.002 | `url` | Highwire Press `name=citation_section` journal-section labels |
| `/pay/citation-id` | $0.002 | `url` | Highwire Press `name=citation_id` publisher article identifiers |
| `/pay/citation-editor` | $0.002 | `url` | Highwire Press `name=citation_editor` volume-editor names |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.88.0` (`whois` … `citation-author-orcid`). `/pay/references` remains DCTERMS references; `/pay/cite-as` remains IANA rel=cite-as; `/pay/bibliographic-citation` remains DCTERMS bibliographicCitation; `/pay/citation-dissertation-institution` remains Highwire citation_dissertation_institution; `/pay/citation-title` remains Highwire citation_title; `/pay/title` remains HTML title; `/pay/citation-fulltext-html-url` remains Highwire citation_fulltext_html_url; `/pay/citation-pdf-url` remains Highwire citation_pdf_url; `/pay/identifier-url` remains HTML identifier-url / DC.identifier; `/pay/section` remains IANA rel=section; `/pay/citation-journal-title` remains Highwire citation_journal_title; `/pay/citation-issue` remains Highwire citation_issue; `/pay/citation-doi` remains Highwire citation_doi; `/pay/citation-pmid` remains Highwire citation_pmid; `/pay/citation-author` remains Highwire citation_author; `/pay/contributor` remains HTML/Dublin Core contributor. Remaining Highwire tags include citation_collection_title, citation_series_title, citation_conference, citation_conference_place, citation_conference_date, and citation_patent_number. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 00:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 555 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.89.0 paths `/pay/citation-reference`, `/pay/citation-dissertation-name`, `/pay/citation-public-url`, `/pay/citation-section`, `/pay/citation-id`, and `/pay/citation-editor` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.89.0 not indexed yet). New 1.89.0 paths will index after VPS deploy and another register.
