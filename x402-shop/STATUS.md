# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.92.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-id-from-sass-path` | $0.002 | `url` | Highwire Press `name=citation_id_from_sass_path` manuscript identifiers |
| `/pay/citation-collection-id` | $0.002 | `url` | Highwire Press `name=citation_collection_id` collection identifiers |
| `/pay/citation-authors` | $0.002 | `url` | Highwire Press `name=citation_authors` combined author lists |
| `/pay/citation-price` | $0.002 | `url` | Highwire Press `name=citation_price` article prices |
| `/pay/citation-abstract-pdf-url` | $0.002 | `url` | Highwire Press `name=citation_abstract_pdf_url` abstract PDF links |
| `/pay/citation-arxiv-id` | $0.002 | `url` | Highwire Press `name=citation_arxiv_id` arXiv identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.91.0` (`whois` … `citation-inbook-title`). `/pay/citation-id` remains Highwire citation_id; `/pay/citation-mjid` remains Highwire citation_mjid; `/pay/citation-doi` remains Highwire citation_doi; `/pay/citation-pmid` remains Highwire citation_pmid; `/pay/citation-collection-title` remains Highwire citation_collection_title; `/pay/citation-author` remains Highwire citation_author; `/pay/author` remains HTML author; `/pay/citation-editor` remains Highwire citation_editor; `/pay/payment` remains HTML payment; `/pay/citation-pdf-url` remains Highwire citation_pdf_url; `/pay/citation-abstract-html-url` remains Highwire citation_abstract_html_url; `/pay/citation-abstract` remains Highwire citation_abstract. Do not use `/pay/id-from-sass-path` (`/pay/citation-id-from-sass-path`), `/pay/collection-id` (`/pay/citation-collection-id`), `/pay/authors` (`/pay/citation-authors`; `/pay/author` is HTML author), `/pay/price` (`/pay/citation-price`), `/pay/abstract-pdf-url` (`/pay/citation-abstract-pdf-url`), or `/pay/arxiv-id` (`/pay/citation-arxiv-id`). Remaining Highwire tags include citation_pmc, citation_pmcid, citation_pii, citation_sici, citation_oclc, and citation_type. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 03:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 573 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.92.0 paths `/pay/citation-id-from-sass-path`, `/pay/citation-collection-id`, `/pay/citation-authors`, `/pay/citation-price`, `/pay/citation-abstract-pdf-url`, and `/pay/citation-arxiv-id` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.92.0 not indexed yet). New 1.92.0 paths will index after VPS deploy and another register.
