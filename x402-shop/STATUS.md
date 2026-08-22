# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.95.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eissn` | $0.002 | `url` | Highwire Press `name=citation_eissn` electronic ISSNs |
| `/pay/citation-issn-print` | $0.002 | `url` | Highwire Press `name=citation_issn_print` print ISSNs |
| `/pay/citation-issn-online` | $0.002 | `url` | Highwire Press `name=citation_issn_online` online ISSNs |
| `/pay/citation-isbn-print` | $0.002 | `url` | Highwire Press `name=citation_isbn_print` print ISBNs |
| `/pay/citation-html-url` | $0.002 | `url` | Highwire Press `name=citation_html_url` HTML landing URLs |
| `/pay/citation-funder` | $0.002 | `url` | Highwire Press `name=citation_funder` research funder names |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.94.0` (`whois` … `citation-xml-url`). `/pay/citation-issn` remains Highwire citation_issn; `/pay/citation-isbn` remains Highwire citation_isbn; `/pay/citation-fulltext-html-url` remains Highwire citation_fulltext_html_url; `/pay/citation-abstract-html-url` remains Highwire citation_abstract_html_url; `/pay/citation-xml-url` remains Highwire citation_xml_url; `/pay/citation-pdf-url` remains Highwire citation_pdf_url; `/pay/citation-public-url` remains Highwire citation_public_url. Do not use `/pay/eissn` (`/pay/citation-eissn`), `/pay/issn-print` (`/pay/citation-issn-print`; `/pay/citation-issn` is the generic ISSN), `/pay/issn-online` (`/pay/citation-issn-online`), `/pay/isbn-print` (`/pay/citation-isbn-print`; `/pay/citation-isbn` is the generic ISBN), `/pay/html-url` (`/pay/citation-html-url`; `/pay/citation-fulltext-html-url` and `/pay/citation-abstract-html-url` stay separate), or `/pay/funder` (`/pay/citation-funder`). Remaining Highwire tags include citation_isbn_online, citation_eisbn, citation_issn_linking, citation_funder_id, citation_funding_source, and citation_grant_number. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 06:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 591 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.95.0 paths `/pay/citation-eissn`, `/pay/citation-issn-print`, `/pay/citation-issn-online`, `/pay/citation-isbn-print`, `/pay/citation-html-url`, and `/pay/citation-funder` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.95.0 not indexed yet). New 1.95.0 paths will index after VPS deploy and another register.
