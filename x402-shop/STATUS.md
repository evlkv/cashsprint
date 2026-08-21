# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.88.0`
- Batch date: `2026-08-21`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-fulltext-world-readable` | $0.002 | `url` | Highwire Press `name=citation_fulltext_world_readable` open-access flags |
| `/pay/citation-technical-report-number` | $0.002 | `url` | Highwire Press `name=citation_technical_report_number` report identifiers |
| `/pay/citation-technical-report-institution` | $0.002 | `url` | Highwire Press `name=citation_technical_report_institution` issuing organizations |
| `/pay/citation-dissertation-institution` | $0.002 | `url` | Highwire Press `name=citation_dissertation_institution` degree-granting organizations |
| `/pay/citation-author-email` | $0.002 | `url` | Highwire Press `name=citation_author_email` corresponding-author addresses |
| `/pay/citation-author-orcid` | $0.002 | `url` | Highwire Press `name=citation_author_orcid` researcher identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.87.0` (`whois` … `citation-abstract`). `/pay/citation-fulltext-html-url` remains Highwire citation_fulltext_html_url; `/pay/citation-pdf-url` remains Highwire citation_pdf_url; `/pay/access-rights` remains DCTERMS accessRights; `/pay/citation-pmid` remains Highwire citation_pmid; `/pay/citation-doi` remains Highwire citation_doi; `/pay/identifier-url` remains HTML identifier-url / DC.identifier; `/pay/citation-author-institution` remains Highwire citation_author_institution; `/pay/citation-publisher` remains Highwire citation_publisher; `/pay/citation-author` remains Highwire citation_author; `/pay/reply-to` remains HTML name=reply-to. Remaining Highwire tags include citation_reference, citation_dissertation_name, citation_public_url, citation_section, citation_id, and citation_editor. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-21 23:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 549 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.88.0 paths `/pay/citation-fulltext-world-readable`, `/pay/citation-technical-report-number`, `/pay/citation-technical-report-institution`, `/pay/citation-dissertation-institution`, `/pay/citation-author-email`, and `/pay/citation-author-orcid` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.88.0 not indexed yet). New 1.88.0 paths will index after VPS deploy and another register.
