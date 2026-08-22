# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.101.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-issn10` | $0.002 | `url` | Highwire Press `name=citation_issn10` 10-digit ISSNs |
| `/pay/citation-eissn13` | $0.002 | `url` | Highwire Press `name=citation_eissn13` 13-digit electronic ISSNs |
| `/pay/citation-eissn10` | $0.002 | `url` | Highwire Press `name=citation_eissn10` 10-digit electronic ISSNs |
| `/pay/citation-isbn-cloth` | $0.002 | `url` | Highwire Press `name=citation_isbn_cloth` cloth-bound ISBNs |
| `/pay/citation-eisbn-softcover` | $0.002 | `url` | Highwire Press `name=citation_eisbn_softcover` softcover electronic ISBNs |
| `/pay/citation-funder-rorid` | $0.002 | `url` | Highwire Press `name=citation_funder_rorid` funder ROR identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.100.0` (`whois` … `citation-issn13`). `/pay/citation-issn` remains Highwire citation_issn; `/pay/citation-issn13` remains Highwire citation_issn13; `/pay/citation-isbn10` remains Highwire citation_isbn10; `/pay/citation-eissn` remains Highwire citation_eissn; `/pay/citation-eisbn13` remains Highwire citation_eisbn13; `/pay/citation-eisbn10` remains Highwire citation_eisbn10; `/pay/citation-isbn-hardcover` remains Highwire citation_isbn_hardcover; `/pay/citation-isbn-softcover` remains Highwire citation_isbn_softcover; `/pay/citation-eisbn-paperback` remains Highwire citation_eisbn_paperback; `/pay/citation-funder-ror` remains Highwire citation_funder_ror; `/pay/citation-funder-id` remains Highwire citation_funder_id; `/pay/citation-funder-identifier` remains Highwire citation_funder_identifier. Do not use `/pay/issn10` (`/pay/citation-issn10`; `/pay/citation-issn` is issn; `/pay/citation-isbn10` is isbn10), `/pay/eissn13` (`/pay/citation-eissn13`; `/pay/citation-eissn` is eissn; `/pay/citation-issn13` is issn13), `/pay/eissn10` (`/pay/citation-eissn10`; `/pay/citation-eissn` is eissn; `/pay/citation-eisbn10` is eisbn10), `/pay/isbn-cloth` (`/pay/citation-isbn-cloth`; `/pay/citation-isbn-hardcover` is hardcover; `/pay/citation-isbn` is isbn), `/pay/eisbn-softcover` (`/pay/citation-eisbn-softcover`; `/pay/citation-isbn-softcover` is print softcover; `/pay/citation-eisbn-paperback` is eisbn paperback), or `/pay/funder-rorid` (`/pay/citation-funder-rorid`; `/pay/citation-funder-ror` is ror URLs; `/pay/citation-funder-id` is funder ids). Remaining Highwire tags include citation_isbn_hardback, citation_eisbn_cloth, citation_isbn_trade, citation_issn8, citation_coden, and citation_funder_ror_id. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 12:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 627 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.101.0 paths `/pay/citation-issn10`, `/pay/citation-eissn13`, `/pay/citation-eissn10`, `/pay/citation-isbn-cloth`, `/pay/citation-eisbn-softcover`, and `/pay/citation-funder-rorid` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.101.0 not indexed yet). New 1.101.0 paths will index after VPS deploy and another register.
