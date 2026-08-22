# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.90.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-collection-title` | $0.002 | `url` | Highwire Press `name=citation_collection_title` collection titles |
| `/pay/citation-series-title` | $0.002 | `url` | Highwire Press `name=citation_series_title` series titles |
| `/pay/citation-conference-place` | $0.002 | `url` | Highwire Press `name=citation_conference_place` venue locations |
| `/pay/citation-conference-date` | $0.002 | `url` | Highwire Press `name=citation_conference_date` event dates |
| `/pay/citation-patent-number` | $0.002 | `url` | Highwire Press `name=citation_patent_number` patent identifiers |
| `/pay/citation-patent-country` | $0.002 | `url` | Highwire Press `name=citation_patent_country` issuing-country codes |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.89.0` (`whois` … `citation-editor`). `/pay/collection` remains IANA `rel=collection`; `/pay/citation-title` remains Highwire citation_title; `/pay/citation-journal-title` remains Highwire citation_journal_title; `/pay/is-part-of` remains DCTERMS isPartOf; `/pay/citation-conference-title` remains Highwire citation_conference_title; `/pay/geo-region` remains HTML geo.region; `/pay/coverage` remains Dublin Core coverage; `/pay/citation-date` remains Highwire citation_date; `/pay/citation-publication-date` remains Highwire citation_publication_date; `/pay/date` remains HTML/Dublin Core date; `/pay/citation-id` remains Highwire citation_id; `/pay/citation-doi` remains Highwire citation_doi; `/pay/identifier-url` remains HTML identifier-url / DC.identifier. Do not use `/pay/conference` for citation_conference — that alias is reserved for `/pay/citation-conference-title`. Remaining Highwire tags include citation_mjid, citation_publisher_location, citation_day, citation_cover_date, citation_volume_title, and citation_inbook_title. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 01:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 561 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.90.0 paths `/pay/citation-collection-title`, `/pay/citation-series-title`, `/pay/citation-conference-place`, `/pay/citation-conference-date`, `/pay/citation-patent-number`, and `/pay/citation-patent-country` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.90.0 not indexed yet). New 1.90.0 paths will index after VPS deploy and another register.
