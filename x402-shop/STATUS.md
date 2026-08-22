# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.99.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn10` | $0.002 | `url` | Highwire Press `name=citation_eisbn10` 10-digit electronic ISBNs |
| `/pay/citation-isbn-hardcover` | $0.002 | `url` | Highwire Press `name=citation_isbn_hardcover` hardcover ISBNs |
| `/pay/citation-isbn-paperback` | $0.002 | `url` | Highwire Press `name=citation_isbn_paperback` paperback ISBNs |
| `/pay/citation-funder-identifier` | $0.002 | `url` | Highwire Press `name=citation_funder_identifier` funder identifiers |
| `/pay/citation-award-doi` | $0.002 | `url` | Highwire Press `name=citation_award_doi` award DOIs |
| `/pay/citation-funding-agency` | $0.002 | `url` | Highwire Press `name=citation_funding_agency` funding agencies |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.98.0` (`whois` … `citation-funding-statement`). `/pay/citation-eisbn` remains Highwire citation_eisbn; `/pay/citation-eisbn13` remains Highwire citation_eisbn13; `/pay/citation-isbn` remains Highwire citation_isbn; `/pay/citation-isbn-print` remains Highwire citation_isbn_print; `/pay/citation-isbn-ebook` remains Highwire citation_isbn_ebook; `/pay/citation-funder` remains Highwire citation_funder; `/pay/citation-funder-id` remains Highwire citation_funder_id; `/pay/citation-funder-doi` remains Highwire citation_funder_doi; `/pay/citation-funder-name` remains Highwire citation_funder_name; `/pay/citation-award-id` remains Highwire citation_award_id; `/pay/citation-award-number` remains Highwire citation_award_number; `/pay/citation-doi` remains Highwire citation_doi; `/pay/citation-funding-source` remains Highwire citation_funding_source; `/pay/citation-funding-statement` remains Highwire citation_funding_statement; `/pay/funding` remains FLOSS `/.well-known/funding-manifest-urls`. Do not use `/pay/eisbn10` (`/pay/citation-eisbn10`; `/pay/citation-eisbn` is eisbn), `/pay/isbn-hardcover` (`/pay/citation-isbn-hardcover`), `/pay/isbn-paperback` (`/pay/citation-isbn-paperback`), `/pay/funder-identifier` (`/pay/citation-funder-identifier`; `/pay/citation-funder-id` is funder ids), `/pay/award-doi` (`/pay/citation-award-doi`; `/pay/citation-doi` is article DOIs), or `/pay/funding-agency` (`/pay/citation-funding-agency`; `/pay/citation-funding-source` is funding sources). Remaining Highwire tags include citation_eisbn_hardcover, citation_eisbn_paperback, citation_isbn_softcover, citation_funder_ror, citation_grant_doi, and citation_issn13. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 10:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 615 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.99.0 paths `/pay/citation-eisbn10`, `/pay/citation-isbn-hardcover`, `/pay/citation-isbn-paperback`, `/pay/citation-funder-identifier`, `/pay/citation-award-doi`, and `/pay/citation-funding-agency` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.99.0 not indexed yet). New 1.99.0 paths will index after VPS deploy and another register.
