# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.122.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-cn` | $0.002 | `url` | Highwire Press `name=citation_eisbn_cn` China-edition electronic ISBNs |
| `/pay/citation-isbn-br` | $0.002 | `url` | Highwire Press `name=citation_isbn_br` Brazil-edition ISBNs |
| `/pay/citation-eisbn-br` | $0.002 | `url` | Highwire Press `name=citation_eisbn_br` Brazil-edition electronic ISBNs |
| `/pay/citation-isbn-mx` | $0.002 | `url` | Highwire Press `name=citation_isbn_mx` Mexico-edition ISBNs |
| `/pay/citation-author-twitter` | $0.002 | `url` | Highwire Press `name=citation_author_twitter` author Twitter identifiers |
| `/pay/citation-author-mastodon` | $0.002 | `url` | Highwire Press `name=citation_author_mastodon` author Mastodon identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.121.0` (`whois` … `citation-author-linkedin`). `/pay/citation-isbn-cn` remains Highwire citation_isbn_cn; `/pay/citation-eisbn-kr` remains Highwire citation_eisbn_kr; `/pay/citation-eisbn-jp` remains Highwire citation_eisbn_jp; `/pay/citation-eisbn-tw` remains Highwire citation_eisbn_tw; `/pay/citation-isbn-jp` remains Highwire citation_isbn_jp; `/pay/citation-isbn-kr` remains Highwire citation_isbn_kr; `/pay/citation-author-linkedin` remains Highwire citation_author_linkedin; `/pay/citation-author-academia` remains Highwire citation_author_academia; `/pay/citation-author-orcid` remains Highwire citation_author_orcid. Do not use `/pay/eisbn-cn` (`/pay/citation-eisbn-cn`; `/pay/citation-isbn-cn` is print CN; `/pay/citation-eisbn-kr` is eisbn KR; `/pay/citation-eisbn-jp` is eisbn JP; `/pay/citation-eisbn-tw` is eisbn TW), `/pay/isbn-br` (`/pay/citation-isbn-br`; `/pay/citation-isbn-cn` is CN; `/pay/citation-isbn-jp` is JP; `/pay/citation-isbn-mx` is MX; `/pay/citation-isbn-kr` is KR), `/pay/eisbn-br` (`/pay/citation-eisbn-br`; `/pay/citation-isbn-br` is print BR; `/pay/citation-eisbn-cn` is eisbn CN; `/pay/citation-eisbn-jp` is eisbn JP; `/pay/citation-eisbn-kr` is eisbn KR), `/pay/isbn-mx` (`/pay/citation-isbn-mx`; `/pay/citation-isbn-br` is BR; `/pay/citation-isbn-cn` is CN; `/pay/citation-isbn-jp` is JP; `/pay/citation-isbn-kr` is KR), `/pay/author-twitter` (`/pay/citation-author-twitter`; `/pay/citation-author-linkedin` is linkedin; `/pay/citation-author-academia` is academia; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-mastodon` is mastodon), or `/pay/author-mastodon` (`/pay/citation-author-mastodon`; `/pay/citation-author-twitter` is twitter; `/pay/citation-author-linkedin` is linkedin; `/pay/citation-author-orcid` is orcid; `/pay/citation-author-academia` is academia). Remaining Highwire tags include citation_eisbn_mx, citation_isbn_ar, citation_eisbn_ar, citation_isbn_cl, citation_author_bluesky, and citation_author_facebook. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 09:01 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 753 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.122.0 paths `/pay/citation-eisbn-cn`, `/pay/citation-isbn-br`, `/pay/citation-eisbn-br`, `/pay/citation-isbn-mx`, `/pay/citation-author-twitter`, and `/pay/citation-author-mastodon` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.122.0 not indexed yet). New 1.122.0 paths will index after VPS deploy and another register.
