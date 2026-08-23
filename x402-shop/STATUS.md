# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.117.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sg` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sg` Singapore-edition electronic ISBNs |
| `/pay/citation-isbn-hk` | $0.002 | `url` | Highwire Press `name=citation_isbn_hk` Hong Kong-edition ISBNs |
| `/pay/citation-eisbn-hk` | $0.002 | `url` | Highwire Press `name=citation_eisbn_hk` Hong Kong-edition electronic ISBNs |
| `/pay/citation-isbn-my` | $0.002 | `url` | Highwire Press `name=citation_isbn_my` Malaysian-edition ISBNs |
| `/pay/citation-author-pmc` | $0.002 | `url` | Highwire Press `name=citation_author_pmc` author PubMed Central identifiers |
| `/pay/citation-author-ssrn` | $0.002 | `url` | Highwire Press `name=citation_author_ssrn` author SSRN identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.116.0` (`whois` … `citation-author-arxiv`). `/pay/citation-isbn-sg` remains Highwire citation_isbn_sg; `/pay/citation-eisbn-in` remains Highwire citation_eisbn_in; `/pay/citation-eisbn-au` remains Highwire citation_eisbn_au; `/pay/citation-eisbn-international` remains Highwire citation_eisbn_international; `/pay/citation-isbn-in` remains Highwire citation_isbn_in; `/pay/citation-isbn-international` remains Highwire citation_isbn_international; `/pay/citation-pmc` remains Highwire citation_pmc; `/pay/citation-pmcid` remains Highwire citation_pmcid; `/pay/citation-author-pubmed` remains Highwire citation_author_pubmed; `/pay/citation-author-orcid` remains Highwire citation_author_orcid; `/pay/citation-author-arxiv` remains Highwire citation_author_arxiv. Do not use `/pay/eisbn-sg` (`/pay/citation-eisbn-sg`; `/pay/citation-isbn-sg` is print SG; `/pay/citation-eisbn-in` is eisbn IN; `/pay/citation-eisbn-au` is eisbn AU), `/pay/isbn-hk` (`/pay/citation-isbn-hk`; `/pay/citation-isbn-sg` is SG; `/pay/citation-isbn-in` is IN; `/pay/citation-isbn-international` is international), `/pay/eisbn-hk` (`/pay/citation-eisbn-hk`; `/pay/citation-isbn-hk` is print HK; `/pay/citation-eisbn-sg` is eisbn SG; `/pay/citation-eisbn-in` is eisbn IN), `/pay/isbn-my` (`/pay/citation-isbn-my`; `/pay/citation-isbn-sg` is SG; `/pay/citation-isbn-hk` is HK; `/pay/citation-isbn-international` is international), `/pay/author-pmc` (`/pay/citation-author-pmc`; `/pay/citation-pmc` is pmc; `/pay/citation-pmcid` is pmcid; `/pay/citation-author-pubmed` is pubmed), or `/pay/author-ssrn` (`/pay/citation-author-ssrn`; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-pubmed` is pubmed; `/pay/citation-author-pmc` is pmc). Remaining Highwire tags include citation_eisbn_my, citation_isbn_ph, citation_eisbn_ph, citation_isbn_th, citation_author_ncbi, and citation_author_repec. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 04:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 723 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.117.0 paths `/pay/citation-eisbn-sg`, `/pay/citation-isbn-hk`, `/pay/citation-eisbn-hk`, `/pay/citation-isbn-my`, `/pay/citation-author-pmc`, and `/pay/citation-author-ssrn` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.117.0 not indexed yet). New 1.117.0 paths will index after VPS deploy and another register.
