# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.96.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-isbn-online` | $0.002 | `url` | Highwire Press `name=citation_isbn_online` electronic/online ISBNs |
| `/pay/citation-eisbn` | $0.002 | `url` | Highwire Press `name=citation_eisbn` electronic ISBNs |
| `/pay/citation-issn-linking` | $0.002 | `url` | Highwire Press `name=citation_issn_linking` linking ISSNs |
| `/pay/citation-funder-id` | $0.002 | `url` | Highwire Press `name=citation_funder_id` research funder identifiers |
| `/pay/citation-funding-source` | $0.002 | `url` | Highwire Press `name=citation_funding_source` funding-source labels |
| `/pay/citation-grant-number` | $0.002 | `url` | Highwire Press `name=citation_grant_number` award/grant numbers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.95.0` (`whois` … `citation-funder`). `/pay/citation-isbn` remains Highwire citation_isbn; `/pay/citation-isbn-print` remains Highwire citation_isbn_print; `/pay/citation-issn` remains Highwire citation_issn; `/pay/citation-issn-print` remains Highwire citation_issn_print; `/pay/citation-issn-online` remains Highwire citation_issn_online; `/pay/citation-eissn` remains Highwire citation_eissn; `/pay/citation-funder` remains Highwire citation_funder; `/pay/funding` remains FLOSS `/.well-known/funding-manifest-urls`. Do not use `/pay/isbn-online` (`/pay/citation-isbn-online`; `/pay/citation-isbn` is the generic ISBN and `/pay/citation-isbn-print` is print), `/pay/eisbn` (`/pay/citation-eisbn`), `/pay/issn-linking` (`/pay/citation-issn-linking`; `/pay/citation-issn` is the generic ISSN), `/pay/funder-id` (`/pay/citation-funder-id`; `/pay/citation-funder` is funder names), `/pay/funding-source` (`/pay/citation-funding-source`; `/pay/funding` is FLOSS funding-manifest-urls), or `/pay/grant-number` (`/pay/citation-grant-number`). Remaining Highwire tags include citation_isbn_electronic, citation_isbn_ebook, citation_issn_electronic, citation_funder_name, citation_grant_id, and citation_award_number. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 07:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 597 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.96.0 paths `/pay/citation-isbn-online`, `/pay/citation-eisbn`, `/pay/citation-issn-linking`, `/pay/citation-funder-id`, `/pay/citation-funding-source`, and `/pay/citation-grant-number` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.96.0 not indexed yet). New 1.96.0 paths will index after VPS deploy and another register.
