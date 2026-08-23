# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.114.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-au` | $0.002 | `url` | Highwire Press `name=citation_eisbn_au` Australian-edition electronic ISBNs |
| `/pay/citation-isbn-ca` | $0.002 | `url` | Highwire Press `name=citation_isbn_ca` Canadian-edition ISBNs |
| `/pay/citation-eisbn-ca` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ca` Canadian-edition electronic ISBNs |
| `/pay/citation-isbn-nz` | $0.002 | `url` | Highwire Press `name=citation_isbn_nz` New Zealand-edition ISBNs |
| `/pay/citation-author-dimensions` | $0.002 | `url` | Highwire Press `name=citation_author_dimensions` author Dimensions identifiers |
| `/pay/citation-author-mendeley` | $0.002 | `url` | Highwire Press `name=citation_author_mendeley` author Mendeley identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.113.0` (`whois` … `citation-author-webofscience`). `/pay/citation-isbn-au` remains Highwire citation_isbn_au; `/pay/citation-eisbn-uk` remains Highwire citation_eisbn_uk; `/pay/citation-eisbn-us` remains Highwire citation_eisbn_us; `/pay/citation-eisbn-international` remains Highwire citation_eisbn_international; `/pay/citation-isbn-uk` remains Highwire citation_isbn_uk; `/pay/citation-isbn-us` remains Highwire citation_isbn_us; `/pay/citation-isbn-international` remains Highwire citation_isbn_international; `/pay/citation-author-orcid` remains Highwire citation_author_orcid; `/pay/citation-author-scopus` remains Highwire citation_author_scopus; `/pay/citation-author-researchgate` remains Highwire citation_author_researchgate. Do not use `/pay/eisbn-au` (`/pay/citation-eisbn-au`; `/pay/citation-isbn-au` is print AU; `/pay/citation-eisbn-uk` is eisbn UK; `/pay/citation-eisbn-us` is eisbn US), `/pay/isbn-ca` (`/pay/citation-isbn-ca`; `/pay/citation-isbn-uk` is UK; `/pay/citation-isbn-us` is US; `/pay/citation-isbn-au` is AU), `/pay/eisbn-ca` (`/pay/citation-eisbn-ca`; `/pay/citation-isbn-ca` is print CA; `/pay/citation-eisbn-au` is eisbn AU; `/pay/citation-eisbn-uk` is eisbn UK), `/pay/isbn-nz` (`/pay/citation-isbn-nz`; `/pay/citation-isbn-au` is AU; `/pay/citation-isbn-uk` is UK; `/pay/citation-isbn-international` is international), `/pay/author-dimensions` (`/pay/citation-author-dimensions`; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-scopus` is scopus; `/pay/citation-author-researchgate` is researchgate), or `/pay/author-mendeley` (`/pay/citation-author-mendeley`; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-researchgate` is researchgate; `/pay/citation-author-scopus` is scopus). Remaining Highwire tags include citation_eisbn_nz, citation_isbn_za, citation_eisbn_za, citation_isbn_ie, citation_author_semanticscholar, and citation_author_googlescholar. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 01:01 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 705 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.114.0 paths `/pay/citation-eisbn-au`, `/pay/citation-isbn-ca`, `/pay/citation-eisbn-ca`, `/pay/citation-isbn-nz`, `/pay/citation-author-dimensions`, and `/pay/citation-author-mendeley` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.114.0 not indexed yet). New 1.114.0 paths will index after VPS deploy and another register.
