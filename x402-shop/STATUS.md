# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.91.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-mjid` | $0.002 | `url` | Highwire Press `name=citation_mjid` manuscript journal identifiers |
| `/pay/citation-publisher-location` | $0.002 | `url` | Highwire Press `name=citation_publisher_location` publisher cities |
| `/pay/citation-day` | $0.002 | `url` | Highwire Press `name=citation_day` publication day-of-month values |
| `/pay/citation-cover-date` | $0.002 | `url` | Highwire Press `name=citation_cover_date` issue cover dates |
| `/pay/citation-volume-title` | $0.002 | `url` | Highwire Press `name=citation_volume_title` volume titles |
| `/pay/citation-inbook-title` | $0.002 | `url` | Highwire Press `name=citation_inbook_title` in-book titles |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.90.0` (`whois` … `citation-patent-country`). `/pay/citation-id` remains Highwire citation_id; `/pay/citation-doi` remains Highwire citation_doi; `/pay/citation-pmid` remains Highwire citation_pmid; `/pay/citation-publisher` remains Highwire citation_publisher; `/pay/geo-region` remains HTML geo.region; `/pay/coverage` remains Dublin Core coverage; `/pay/citation-date` remains Highwire citation_date; `/pay/citation-year` remains Highwire citation_year; `/pay/citation-month` remains Highwire citation_month; `/pay/date` remains HTML/Dublin Core date; `/pay/citation-publication-date` remains Highwire citation_publication_date; `/pay/citation-online-date` remains Highwire citation_online_date; `/pay/citation-volume` remains Highwire citation_volume; `/pay/citation-title` remains Highwire citation_title; `/pay/citation-collection-title` remains Highwire citation_collection_title; `/pay/citation-series-title` remains Highwire citation_series_title; `/pay/citation-journal-title` remains Highwire citation_journal_title. Do not use `/pay/mjid` (`/pay/citation-mjid`), `/pay/publisher-location` (`/pay/citation-publisher-location`), `/pay/day` (`/pay/citation-day`), `/pay/cover-date` (`/pay/citation-cover-date`), `/pay/volume-title` (`/pay/citation-volume-title`), or `/pay/inbook-title` (`/pay/citation-inbook-title`). Remaining Highwire tags include citation_id_from_sass_path, citation_collection_id, citation_authors, citation_price, citation_abstract_pdf_url, and citation_arxiv_id. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 02:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 567 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.91.0 paths `/pay/citation-mjid`, `/pay/citation-publisher-location`, `/pay/citation-day`, `/pay/citation-cover-date`, `/pay/citation-volume-title`, and `/pay/citation-inbook-title` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.91.0 not indexed yet). New 1.91.0 paths will index after VPS deploy and another register.
