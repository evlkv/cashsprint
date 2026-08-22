# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.100.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-hardcover` | $0.002 | `url` | Highwire Press `name=citation_eisbn_hardcover` hardcover electronic ISBNs |
| `/pay/citation-eisbn-paperback` | $0.002 | `url` | Highwire Press `name=citation_eisbn_paperback` paperback electronic ISBNs |
| `/pay/citation-isbn-softcover` | $0.002 | `url` | Highwire Press `name=citation_isbn_softcover` softcover ISBNs |
| `/pay/citation-funder-ror` | $0.002 | `url` | Highwire Press `name=citation_funder_ror` funder ROR IDs |
| `/pay/citation-grant-doi` | $0.002 | `url` | Highwire Press `name=citation_grant_doi` grant DOIs |
| `/pay/citation-issn13` | $0.002 | `url` | Highwire Press `name=citation_issn13` 13-digit ISSNs |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.99.0` (`whois` … `citation-funding-agency`). `/pay/citation-eisbn` remains Highwire citation_eisbn; `/pay/citation-eisbn10` remains Highwire citation_eisbn10; `/pay/citation-eisbn13` remains Highwire citation_eisbn13; `/pay/citation-isbn-hardcover` remains Highwire citation_isbn_hardcover; `/pay/citation-isbn-paperback` remains Highwire citation_isbn_paperback; `/pay/citation-isbn` remains Highwire citation_isbn; `/pay/citation-isbn-print` remains Highwire citation_isbn_print; `/pay/citation-funder` remains Highwire citation_funder; `/pay/citation-funder-id` remains Highwire citation_funder_id; `/pay/citation-funder-identifier` remains Highwire citation_funder_identifier; `/pay/citation-funder-doi` remains Highwire citation_funder_doi; `/pay/citation-doi` remains Highwire citation_doi; `/pay/citation-award-doi` remains Highwire citation_award_doi; `/pay/citation-grant-id` remains Highwire citation_grant_id; `/pay/citation-issn` remains Highwire citation_issn; `/pay/citation-eissn` remains Highwire citation_eissn; `/pay/citation-isbn13` remains Highwire citation_isbn13. Do not use `/pay/eisbn-hardcover` (`/pay/citation-eisbn-hardcover`; `/pay/citation-eisbn` is eisbn; `/pay/citation-isbn-hardcover` is print hardcover), `/pay/eisbn-paperback` (`/pay/citation-eisbn-paperback`; `/pay/citation-isbn-paperback` is print paperback), `/pay/isbn-softcover` (`/pay/citation-isbn-softcover`; `/pay/citation-isbn-paperback` is paperback), `/pay/funder-ror` (`/pay/citation-funder-ror`; `/pay/citation-funder` is funder names; `/pay/citation-funder-id` is funder ids), `/pay/grant-doi` (`/pay/citation-grant-doi`; `/pay/citation-doi` is article DOIs; `/pay/citation-award-doi` is award DOIs), or `/pay/issn13` (`/pay/citation-issn13`; `/pay/citation-issn` is issn; `/pay/citation-isbn13` is isbn13). Remaining Highwire tags include citation_issn10, citation_eissn13, citation_eissn10, citation_isbn_cloth, citation_eisbn_softcover, and citation_funder_rorid. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 11:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 621 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.100.0 paths `/pay/citation-eisbn-hardcover`, `/pay/citation-eisbn-paperback`, `/pay/citation-isbn-softcover`, `/pay/citation-funder-ror`, `/pay/citation-grant-doi`, and `/pay/citation-issn13` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.100.0 not indexed yet). New 1.100.0 paths will index after VPS deploy and another register.
