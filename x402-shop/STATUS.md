# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.121.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-kr` | $0.002 | `url` | Highwire Press `name=citation_eisbn_kr` Korea-edition electronic ISBNs |
| `/pay/citation-isbn-jp` | $0.002 | `url` | Highwire Press `name=citation_isbn_jp` Japan-edition ISBNs |
| `/pay/citation-eisbn-jp` | $0.002 | `url` | Highwire Press `name=citation_eisbn_jp` Japan-edition electronic ISBNs |
| `/pay/citation-isbn-cn` | $0.002 | `url` | Highwire Press `name=citation_isbn_cn` China-edition ISBNs |
| `/pay/citation-author-academia` | $0.002 | `url` | Highwire Press `name=citation_author_academia` author Academia.edu identifiers |
| `/pay/citation-author-linkedin` | $0.002 | `url` | Highwire Press `name=citation_author_linkedin` author LinkedIn identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.120.0` (`whois` … `citation-author-figshare`). `/pay/citation-isbn-kr` remains Highwire citation_isbn_kr; `/pay/citation-eisbn-tw` remains Highwire citation_eisbn_tw; `/pay/citation-eisbn-vn` remains Highwire citation_eisbn_vn; `/pay/citation-eisbn-th` remains Highwire citation_eisbn_th; `/pay/citation-isbn-tw` remains Highwire citation_isbn_tw; `/pay/citation-isbn-th` remains Highwire citation_isbn_th; `/pay/citation-isbn-vn` remains Highwire citation_isbn_vn; `/pay/citation-author-orcid` remains Highwire citation_author_orcid; `/pay/citation-author-researchgate` remains Highwire citation_author_researchgate; `/pay/citation-author-figshare` remains Highwire citation_author_figshare; `/pay/citation-author-nih` remains Highwire citation_author_nih. Do not use `/pay/eisbn-kr` (`/pay/citation-eisbn-kr`; `/pay/citation-isbn-kr` is print KR; `/pay/citation-eisbn-tw` is eisbn TW; `/pay/citation-eisbn-vn` is eisbn VN; `/pay/citation-eisbn-th` is eisbn TH), `/pay/isbn-jp` (`/pay/citation-isbn-jp`; `/pay/citation-isbn-kr` is KR; `/pay/citation-isbn-tw` is TW; `/pay/citation-isbn-th` is TH; `/pay/citation-isbn-vn` is VN), `/pay/eisbn-jp` (`/pay/citation-eisbn-jp`; `/pay/citation-isbn-jp` is print JP; `/pay/citation-eisbn-kr` is eisbn KR; `/pay/citation-eisbn-tw` is eisbn TW; `/pay/citation-eisbn-vn` is eisbn VN), `/pay/isbn-cn` (`/pay/citation-isbn-cn`; `/pay/citation-isbn-jp` is JP; `/pay/citation-isbn-kr` is KR; `/pay/citation-isbn-tw` is TW; `/pay/citation-isbn-th` is TH), `/pay/author-academia` (`/pay/citation-author-academia`; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-researchgate` is researchgate; `/pay/citation-author-figshare` is figshare; `/pay/citation-author-nih` is nih), or `/pay/author-linkedin` (`/pay/citation-author-linkedin`; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-academia` is academia; `/pay/citation-author-researchgate` is researchgate; `/pay/citation-author-figshare` is figshare). Remaining Highwire tags include citation_eisbn_cn, citation_isbn_br, citation_eisbn_br, citation_isbn_mx, citation_author_twitter, and citation_author_mastodon. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 08:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 747 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.121.0 paths `/pay/citation-eisbn-kr`, `/pay/citation-isbn-jp`, `/pay/citation-eisbn-jp`, `/pay/citation-isbn-cn`, `/pay/citation-author-academia`, and `/pay/citation-author-linkedin` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.121.0 not indexed yet). New 1.121.0 paths will index after VPS deploy and another register.
