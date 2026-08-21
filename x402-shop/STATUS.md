# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.83.0`
- Batch date: `2026-08-21`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/date-accepted` | $0.002 | `url` | HTML `name=date-accepted` plus `DCTERMS.dateAccepted` / `DC.date.accepted` |
| `/pay/date-copyrighted` | $0.002 | `url` | HTML `name=date-copyrighted` plus `DCTERMS.dateCopyrighted` / `DC.date.copyrighted` |
| `/pay/date-submitted` | $0.002 | `url` | HTML `name=date-submitted` plus `DCTERMS.dateSubmitted` / `DC.date.submitted` |
| `/pay/table-of-contents` | $0.002 | `url` | HTML `name=table-of-contents` plus `DCTERMS.tableOfContents` / `DC.description.tableOfContents` |
| `/pay/citation-title` | $0.002 | `url` | Highwire Press `name=citation_title` scholarly article titles |
| `/pay/citation-author` | $0.002 | `url` | Highwire Press `name=citation_author` scholarly author names |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.82.0` (`whois` … `mediator`). `/pay/date` remains generic DC.date; `/pay/issued` remains DCTERMS.issued; `/pay/created` remains DCTERMS.created; `/pay/copyright` remains HTML `rel=copyright`; `/pay/contents` remains IANA `rel=contents`; `/pay/title` remains HTML title / DC.title; `/pay/author` remains HTML `rel=author`; `/pay/bibliographic-citation` remains DCTERMS.bibliographicCitation. This batch finishes the remaining DCTERMS date/toc refinements and starts Highwire citation metas. Remaining Highwire tags include citation_doi, citation_journal_title, citation_publication_date, citation_pdf_url, citation_volume, and citation_issue. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-21 18:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 519 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.83.0 paths `/pay/date-accepted`, `/pay/date-copyrighted`, `/pay/date-submitted`, `/pay/table-of-contents`, `/pay/citation-title`, and `/pay/citation-author` currently 404 on the live origin (undeployed), as do undeployed 1.82.0 paths such as `/pay/accrual-method`. SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true` with 41 resources. New 1.83.0 paths will index after VPS deploy and another register.
