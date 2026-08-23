# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.118.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-my` | $0.002 | `url` | Highwire Press `name=citation_eisbn_my` Malaysian-edition electronic ISBNs |
| `/pay/citation-isbn-ph` | $0.002 | `url` | Highwire Press `name=citation_isbn_ph` Philippines-edition ISBNs |
| `/pay/citation-eisbn-ph` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ph` Philippines-edition electronic ISBNs |
| `/pay/citation-isbn-th` | $0.002 | `url` | Highwire Press `name=citation_isbn_th` Thailand-edition ISBNs |
| `/pay/citation-author-ncbi` | $0.002 | `url` | Highwire Press `name=citation_author_ncbi` author NCBI identifiers |
| `/pay/citation-author-repec` | $0.002 | `url` | Highwire Press `name=citation_author_repec` author RePEc identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.117.0` (`whois` … `citation-author-ssrn`). `/pay/citation-isbn-my` remains Highwire citation_isbn_my; `/pay/citation-eisbn-sg` remains Highwire citation_eisbn_sg; `/pay/citation-eisbn-hk` remains Highwire citation_eisbn_hk; `/pay/citation-eisbn-in` remains Highwire citation_eisbn_in; `/pay/citation-isbn-sg` remains Highwire citation_isbn_sg; `/pay/citation-isbn-hk` remains Highwire citation_isbn_hk; `/pay/citation-isbn-international` remains Highwire citation_isbn_international; `/pay/citation-author-pmc` remains Highwire citation_author_pmc; `/pay/citation-author-pubmed` remains Highwire citation_author_pubmed; `/pay/citation-author-ssrn` remains Highwire citation_author_ssrn; `/pay/citation-author-orcid` remains Highwire citation_author_orcid. Do not use `/pay/eisbn-my` (`/pay/citation-eisbn-my`; `/pay/citation-isbn-my` is print MY; `/pay/citation-eisbn-sg` is eisbn SG; `/pay/citation-eisbn-hk` is eisbn HK; `/pay/citation-eisbn-in` is eisbn IN), `/pay/isbn-ph` (`/pay/citation-isbn-ph`; `/pay/citation-isbn-my` is MY; `/pay/citation-isbn-sg` is SG; `/pay/citation-isbn-hk` is HK; `/pay/citation-isbn-international` is international), `/pay/eisbn-ph` (`/pay/citation-eisbn-ph`; `/pay/citation-isbn-ph` is print PH; `/pay/citation-eisbn-my` is eisbn MY; `/pay/citation-eisbn-sg` is eisbn SG; `/pay/citation-eisbn-in` is eisbn IN), `/pay/isbn-th` (`/pay/citation-isbn-th`; `/pay/citation-isbn-ph` is PH; `/pay/citation-isbn-my` is MY; `/pay/citation-isbn-sg` is SG; `/pay/citation-isbn-international` is international), `/pay/author-ncbi` (`/pay/citation-author-ncbi`; `/pay/citation-author-pmc` is pmc; `/pay/citation-author-pubmed` is pubmed; `/pay/citation-author-ssrn` is ssrn), or `/pay/author-repec` (`/pay/citation-author-repec`; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-ssrn` is ssrn; `/pay/citation-author-ncbi` is ncbi). Remaining Highwire tags include citation_eisbn_th, citation_isbn_id, citation_eisbn_id, citation_isbn_vn, citation_author_nih, and citation_author_sciprofiles. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 05:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 729 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.118.0 paths `/pay/citation-eisbn-my`, `/pay/citation-isbn-ph`, `/pay/citation-eisbn-ph`, `/pay/citation-isbn-th`, `/pay/citation-author-ncbi`, and `/pay/citation-author-repec` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.118.0 not indexed yet). New 1.118.0 paths will index after VPS deploy and another register.
