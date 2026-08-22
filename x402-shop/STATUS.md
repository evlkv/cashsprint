# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.97.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-isbn-electronic` | $0.002 | `url` | Highwire Press `name=citation_isbn_electronic` electronic ISBNs |
| `/pay/citation-isbn-ebook` | $0.002 | `url` | Highwire Press `name=citation_isbn_ebook` ebook ISBNs |
| `/pay/citation-issn-electronic` | $0.002 | `url` | Highwire Press `name=citation_issn_electronic` electronic ISSNs |
| `/pay/citation-funder-name` | $0.002 | `url` | Highwire Press `name=citation_funder_name` research funder display names |
| `/pay/citation-grant-id` | $0.002 | `url` | Highwire Press `name=citation_grant_id` grant identifiers |
| `/pay/citation-award-number` | $0.002 | `url` | Highwire Press `name=citation_award_number` award numbers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.96.0` (`whois` … `citation-grant-number`). `/pay/citation-isbn` remains Highwire citation_isbn; `/pay/citation-isbn-print` remains Highwire citation_isbn_print; `/pay/citation-isbn-online` remains Highwire citation_isbn_online; `/pay/citation-eisbn` remains Highwire citation_eisbn; `/pay/citation-issn` remains Highwire citation_issn; `/pay/citation-issn-print` remains Highwire citation_issn_print; `/pay/citation-issn-online` remains Highwire citation_issn_online; `/pay/citation-eissn` remains Highwire citation_eissn; `/pay/citation-funder` remains Highwire citation_funder; `/pay/citation-grant-number` remains Highwire citation_grant_number; `/pay/funding` remains FLOSS `/.well-known/funding-manifest-urls`. Do not use `/pay/isbn-electronic` (`/pay/citation-isbn-electronic`; `/pay/citation-isbn` is the generic ISBN, `/pay/citation-isbn-print` is print, `/pay/citation-isbn-online` is online, and `/pay/citation-eisbn` is eisbn), `/pay/isbn-ebook` (`/pay/citation-isbn-ebook`), `/pay/issn-electronic` (`/pay/citation-issn-electronic`; `/pay/citation-issn` is the generic ISSN), `/pay/funder-name` (`/pay/citation-funder-name`; `/pay/citation-funder` is funder names), `/pay/grant-id` (`/pay/citation-grant-id`; `/pay/citation-grant-number` is grant numbers), or `/pay/award-number` (`/pay/citation-award-number`). Remaining Highwire tags include citation_isbn13, citation_isbn10, citation_eisbn13, citation_award_id, citation_funder_doi, and citation_funding_statement. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 08:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 603 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.97.0 paths `/pay/citation-isbn-electronic`, `/pay/citation-isbn-ebook`, `/pay/citation-issn-electronic`, `/pay/citation-funder-name`, `/pay/citation-grant-id`, and `/pay/citation-award-number` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.97.0 not indexed yet). New 1.97.0 paths will index after VPS deploy and another register.
