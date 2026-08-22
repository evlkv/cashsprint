# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.112.0`
- Batch date: `2026-08-22`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-global` | $0.002 | `url` | Highwire Press `name=citation_eisbn_global` global-edition electronic ISBNs |
| `/pay/citation-eisbn-european` | $0.002 | `url` | Highwire Press `name=citation_eisbn_european` European-edition electronic ISBNs |
| `/pay/citation-author-publons` | $0.002 | `url` | Highwire Press `name=citation_author_publons` author Publons identifiers |
| `/pay/citation-author-clarivate` | $0.002 | `url` | Highwire Press `name=citation_author_clarivate` author Clarivate identifiers |
| `/pay/citation-isbn-uk` | $0.002 | `url` | Highwire Press `name=citation_isbn_uk` UK-edition ISBNs |
| `/pay/citation-author-rid` | $0.002 | `url` | Highwire Press `name=citation_author_rid` author RID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.111.0` (`whois` … `citation-isbn-european`). `/pay/citation-isbn-global` remains Highwire citation_isbn_global; `/pay/citation-eisbn-international` remains Highwire citation_eisbn_international; `/pay/citation-eisbn` remains Highwire citation_eisbn; `/pay/citation-isbn-european` remains Highwire citation_isbn_european; `/pay/citation-author-wos` remains Highwire citation_author_wos; `/pay/citation-author-researcherid` remains Highwire citation_author_researcherid; `/pay/citation-author-researchid` remains Highwire citation_author_researchid; `/pay/citation-author-orcid` remains Highwire citation_author_orcid; `/pay/citation-isbn-international` remains Highwire citation_isbn_international. Do not use `/pay/eisbn-global` (`/pay/citation-eisbn-global`; `/pay/citation-isbn-global` is print global; `/pay/citation-eisbn-international` is eisbn international; `/pay/citation-eisbn` is eisbn), `/pay/eisbn-european` (`/pay/citation-eisbn-european`; `/pay/citation-isbn-european` is print european; `/pay/citation-eisbn-international` is international; `/pay/citation-eisbn-global` is global), `/pay/author-publons` (`/pay/citation-author-publons`; `/pay/citation-author-wos` is wos; `/pay/citation-author-researcherid` is researcherid; `/pay/citation-author-orcid` is orcid), `/pay/author-clarivate` (`/pay/citation-author-clarivate`; `/pay/citation-author-wos` is wos; `/pay/citation-author-publons` is publons; `/pay/citation-author-researcherid` is researcherid), `/pay/isbn-uk` (`/pay/citation-isbn-uk`; `/pay/citation-isbn-european` is european; `/pay/citation-isbn-international` is international; `/pay/citation-isbn-global` is global), or `/pay/author-rid` (`/pay/citation-author-rid`; `/pay/citation-author-researcherid` is researcherid; `/pay/citation-author-researchid` is researchid; `/pay/citation-author-wos` is wos). Remaining Highwire tags include citation_eisbn_uk, citation_isbn_us, citation_eisbn_us, citation_isbn_au, citation_author_researchgate, and citation_author_webofscience. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-22 23:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 693 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.112.0 paths `/pay/citation-eisbn-global`, `/pay/citation-eisbn-european`, `/pay/citation-author-publons`, `/pay/citation-author-clarivate`, `/pay/citation-isbn-uk`, and `/pay/citation-author-rid` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.112.0 not indexed yet). New 1.112.0 paths will index after VPS deploy and another register.
