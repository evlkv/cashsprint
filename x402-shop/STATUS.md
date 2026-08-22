# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.94.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-nihmsid` | $0.002 | `url` | Highwire Press `name=citation_nihmsid` NIH Manuscript Submission IDs |
| `/pay/citation-manuscript-id` | $0.002 | `url` | Highwire Press `name=citation_manuscript_id` publisher manuscript identifiers |
| `/pay/citation-publisher-id` | $0.002 | `url` | Highwire Press `name=citation_publisher_id` publisher-assigned identifiers |
| `/pay/citation-elocation-id` | $0.002 | `url` | Highwire Press `name=citation_elocation_id` electronic location identifiers |
| `/pay/citation-article-type` | $0.002 | `url` | Highwire Press `name=citation_article_type` scholarly article types |
| `/pay/citation-xml-url` | $0.002 | `url` | Highwire Press `name=citation_xml_url` XML full-text URLs |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.93.0` (`whois` … `citation-type`). `/pay/citation-pmid` remains Highwire citation_pmid; `/pay/citation-pmc` remains Highwire citation_pmc; `/pay/citation-pmcid` remains Highwire citation_pmcid; `/pay/citation-id` remains Highwire citation_id; `/pay/citation-publisher` remains Highwire citation_publisher; `/pay/publisher` remains HTML/Dublin Core publisher; `/pay/citation-type` remains Highwire citation_type; `/pay/type` remains HTML rel=type; `/pay/dc-type` remains Dublin Core DC.type; `/pay/citation-pdf-url` remains Highwire citation_pdf_url; `/pay/citation-public-url` remains Highwire citation_public_url. Do not use `/pay/nihmsid` (`/pay/citation-nihmsid`), `/pay/manuscript-id` (`/pay/citation-manuscript-id`), `/pay/publisher-id` (`/pay/citation-publisher-id`; `/pay/citation-publisher` is the publisher name), `/pay/elocation-id` (`/pay/citation-elocation-id`), `/pay/article-type` (`/pay/citation-article-type`; `/pay/citation-type` is Highwire citation_type), or `/pay/xml-url` (`/pay/citation-xml-url`). Remaining Highwire tags include citation_eissn, citation_issn_print, citation_issn_online, citation_isbn_print, citation_html_url, and citation_funder. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 05:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 585 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.94.0 paths `/pay/citation-nihmsid`, `/pay/citation-manuscript-id`, `/pay/citation-publisher-id`, `/pay/citation-elocation-id`, `/pay/citation-article-type`, and `/pay/citation-xml-url` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.94.0 not indexed yet). New 1.94.0 paths will index after VPS deploy and another register.
