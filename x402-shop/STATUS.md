# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.102.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-isbn-hardback` | $0.002 | `url` | Highwire Press `name=citation_isbn_hardback` hardback ISBNs |
| `/pay/citation-eisbn-cloth` | $0.002 | `url` | Highwire Press `name=citation_eisbn_cloth` cloth-bound electronic ISBNs |
| `/pay/citation-isbn-trade` | $0.002 | `url` | Highwire Press `name=citation_isbn_trade` trade-edition ISBNs |
| `/pay/citation-issn8` | $0.002 | `url` | Highwire Press `name=citation_issn8` 8-digit ISSNs |
| `/pay/citation-coden` | $0.002 | `url` | Highwire Press `name=citation_coden` CODEN identifiers |
| `/pay/citation-funder-ror-id` | $0.002 | `url` | Highwire Press `name=citation_funder_ror_id` funder ROR IDs |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.101.0` (`whois` … `citation-funder-rorid`). `/pay/citation-isbn` remains Highwire citation_isbn; `/pay/citation-isbn-hardcover` remains Highwire citation_isbn_hardcover; `/pay/citation-isbn-cloth` remains Highwire citation_isbn_cloth; `/pay/citation-eisbn-hardcover` remains Highwire citation_eisbn_hardcover; `/pay/citation-eisbn` remains Highwire citation_eisbn; `/pay/citation-isbn-paperback` remains Highwire citation_isbn_paperback; `/pay/citation-isbn-softcover` remains Highwire citation_isbn_softcover; `/pay/citation-issn` remains Highwire citation_issn; `/pay/citation-issn10` remains Highwire citation_issn10; `/pay/citation-issn13` remains Highwire citation_issn13; `/pay/citation-eissn` remains Highwire citation_eissn; `/pay/citation-funder-rorid` remains Highwire citation_funder_rorid; `/pay/citation-funder-ror` remains Highwire citation_funder_ror; `/pay/citation-funder-id` remains Highwire citation_funder_id. Do not use `/pay/isbn-hardback` (`/pay/citation-isbn-hardback`; `/pay/citation-isbn-hardcover` is hardcover; `/pay/citation-isbn` is isbn), `/pay/eisbn-cloth` (`/pay/citation-eisbn-cloth`; `/pay/citation-isbn-cloth` is print cloth; `/pay/citation-eisbn` is eisbn), `/pay/isbn-trade` (`/pay/citation-isbn-trade`; `/pay/citation-isbn-paperback` is paperback; `/pay/citation-isbn` is isbn), `/pay/issn8` (`/pay/citation-issn8`; `/pay/citation-issn` is issn; `/pay/citation-issn10` is issn10), `/pay/coden` (`/pay/citation-coden`; `/pay/citation-id` is citation ids), or `/pay/funder-ror-id` (`/pay/citation-funder-ror-id`; `/pay/citation-funder-rorid` is rorid; `/pay/citation-funder-ror` is ror URLs). Remaining Highwire tags include citation_eisbn_hardback, citation_isbn_casebound, citation_isbn_pbk, citation_eissn8, citation_lccn, and citation_funder_isni. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 13:01 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 633 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.102.0 paths `/pay/citation-isbn-hardback`, `/pay/citation-eisbn-cloth`, `/pay/citation-isbn-trade`, `/pay/citation-issn8`, `/pay/citation-coden`, and `/pay/citation-funder-ror-id` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.102.0 not indexed yet). New 1.102.0 paths will index after VPS deploy and another register.
