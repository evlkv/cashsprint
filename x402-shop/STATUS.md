# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.93.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-pmc` | $0.002 | `url` | Highwire Press `name=citation_pmc` PubMed Central identifiers |
| `/pay/citation-pmcid` | $0.002 | `url` | Highwire Press `name=citation_pmcid` PubMed Central IDs |
| `/pay/citation-pii` | $0.002 | `url` | Highwire Press `name=citation_pii` publisher item identifiers |
| `/pay/citation-sici` | $0.002 | `url` | Highwire Press `name=citation_sici` serial item and contribution identifiers |
| `/pay/citation-oclc` | $0.002 | `url` | Highwire Press `name=citation_oclc` OCLC control numbers |
| `/pay/citation-type` | $0.002 | `url` | Highwire Press `name=citation_type` scholarly document types |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.92.0` (`whois` … `citation-arxiv-id`). `/pay/citation-pmid` remains Highwire citation_pmid; `/pay/citation-id` remains Highwire citation_id; `/pay/citation-doi` remains Highwire citation_doi; `/pay/citation-mjid` remains Highwire citation_mjid; `/pay/type` remains HTML rel=type; `/pay/dc-type` remains Dublin Core DC.type; `/pay/citation-section` remains Highwire citation_section; `/pay/citation-issn` remains Highwire citation_issn; `/pay/citation-isbn` remains Highwire citation_isbn. Do not use `/pay/pmc` (`/pay/citation-pmc`), `/pay/pmcid` (`/pay/citation-pmcid`), `/pay/pii` (`/pay/citation-pii`), `/pay/sici` (`/pay/citation-sici`), `/pay/oclc` (`/pay/citation-oclc`), or `/pay/type` (`/pay/citation-type`; `/pay/type` is HTML type). Remaining Highwire tags include citation_nihmsid, citation_manuscript_id, citation_publisher_id, citation_elocation_id, citation_article_type, and citation_xml_url. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 04:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 579 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.93.0 paths `/pay/citation-pmc`, `/pay/citation-pmcid`, `/pay/citation-pii`, `/pay/citation-sici`, `/pay/citation-oclc`, and `/pay/citation-type` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.93.0 not indexed yet). New 1.93.0 paths will index after VPS deploy and another register.
