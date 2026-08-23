# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.116.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-ie` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ie` Irish-edition electronic ISBNs |
| `/pay/citation-isbn-in` | $0.002 | `url` | Highwire Press `name=citation_isbn_in` Indian-edition ISBNs |
| `/pay/citation-eisbn-in` | $0.002 | `url` | Highwire Press `name=citation_eisbn_in` Indian-edition electronic ISBNs |
| `/pay/citation-isbn-sg` | $0.002 | `url` | Highwire Press `name=citation_isbn_sg` Singapore-edition ISBNs |
| `/pay/citation-author-pubmed` | $0.002 | `url` | Highwire Press `name=citation_author_pubmed` author PubMed identifiers |
| `/pay/citation-author-arxiv` | $0.002 | `url` | Highwire Press `name=citation_author_arxiv` author arXiv identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.115.0` (`whois` … `citation-author-googlescholar`). `/pay/citation-isbn-ie` remains Highwire citation_isbn_ie; `/pay/citation-eisbn-uk` remains Highwire citation_eisbn_uk; `/pay/citation-eisbn-european` remains Highwire citation_eisbn_european; `/pay/citation-eisbn-nz` remains Highwire citation_eisbn_nz; `/pay/citation-isbn-uk` remains Highwire citation_isbn_uk; `/pay/citation-isbn-international` remains Highwire citation_isbn_international; `/pay/citation-isbn-au` remains Highwire citation_isbn_au; `/pay/citation-pmid` remains Highwire citation_pmid; `/pay/citation-arxiv-id` remains Highwire citation_arxiv_id; `/pay/citation-author-orcid` remains Highwire citation_author_orcid; `/pay/citation-author-scopus` remains Highwire citation_author_scopus; `/pay/citation-author-semanticscholar` remains Highwire citation_author_semanticscholar. Do not use `/pay/eisbn-ie` (`/pay/citation-eisbn-ie`; `/pay/citation-isbn-ie` is print IE; `/pay/citation-eisbn-uk` is eisbn UK; `/pay/citation-eisbn-european` is eisbn European), `/pay/isbn-in` (`/pay/citation-isbn-in`; `/pay/citation-isbn-ie` is IE; `/pay/citation-isbn-uk` is UK; `/pay/citation-isbn-international` is international), `/pay/eisbn-in` (`/pay/citation-eisbn-in`; `/pay/citation-isbn-in` is print IN; `/pay/citation-eisbn-ie` is eisbn IE; `/pay/citation-eisbn-uk` is eisbn UK), `/pay/isbn-sg` (`/pay/citation-isbn-sg`; `/pay/citation-isbn-in` is IN; `/pay/citation-isbn-au` is AU; `/pay/citation-isbn-international` is international), `/pay/author-pubmed` (`/pay/citation-author-pubmed`; `/pay/citation-pmid` is pmid; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-scopus` is scopus), or `/pay/author-arxiv` (`/pay/citation-author-arxiv`; `/pay/citation-arxiv-id` is arxiv-id; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-pubmed` is pubmed). Remaining Highwire tags include citation_eisbn_sg, citation_isbn_hk, citation_eisbn_hk, citation_isbn_my, citation_author_pmc, and citation_author_ssrn. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 03:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 717 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.116.0 paths `/pay/citation-eisbn-ie`, `/pay/citation-isbn-in`, `/pay/citation-eisbn-in`, `/pay/citation-isbn-sg`, `/pay/citation-author-pubmed`, and `/pay/citation-author-arxiv` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.116.0 not indexed yet). New 1.116.0 paths will index after VPS deploy and another register.
