# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.123.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-mx` | $0.002 | `url` | Highwire Press `name=citation_eisbn_mx` Mexico-edition electronic ISBNs |
| `/pay/citation-isbn-ar` | $0.002 | `url` | Highwire Press `name=citation_isbn_ar` Argentina-edition ISBNs |
| `/pay/citation-eisbn-ar` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ar` Argentina-edition electronic ISBNs |
| `/pay/citation-isbn-cl` | $0.002 | `url` | Highwire Press `name=citation_isbn_cl` Chile-edition ISBNs |
| `/pay/citation-author-bluesky` | $0.002 | `url` | Highwire Press `name=citation_author_bluesky` author Bluesky identifiers |
| `/pay/citation-author-facebook` | $0.002 | `url` | Highwire Press `name=citation_author_facebook` author Facebook identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.122.0` (`whois` … `citation-author-mastodon`). `/pay/citation-isbn-mx` remains Highwire citation_isbn_mx; `/pay/citation-eisbn-br` remains Highwire citation_eisbn_br; `/pay/citation-eisbn-cn` remains Highwire citation_eisbn_cn; `/pay/citation-isbn-br` remains Highwire citation_isbn_br; `/pay/citation-author-twitter` remains Highwire citation_author_twitter; `/pay/citation-author-mastodon` remains Highwire citation_author_mastodon; `/pay/citation-author-linkedin` remains Highwire citation_author_linkedin. Do not use `/pay/eisbn-mx` (`/pay/citation-eisbn-mx`; `/pay/citation-isbn-mx` is print MX; `/pay/citation-eisbn-br` is eisbn BR; `/pay/citation-eisbn-cn` is eisbn CN; `/pay/citation-eisbn-ar` is eisbn AR), `/pay/isbn-ar` (`/pay/citation-isbn-ar`; `/pay/citation-isbn-mx` is MX; `/pay/citation-isbn-br` is BR; `/pay/citation-isbn-cl` is CL; `/pay/citation-isbn-cn` is CN), `/pay/eisbn-ar` (`/pay/citation-eisbn-ar`; `/pay/citation-isbn-ar` is print AR; `/pay/citation-eisbn-mx` is eisbn MX; `/pay/citation-eisbn-br` is eisbn BR; `/pay/citation-eisbn-cn` is eisbn CN), `/pay/isbn-cl` (`/pay/citation-isbn-cl`; `/pay/citation-isbn-ar` is AR; `/pay/citation-isbn-mx` is MX; `/pay/citation-isbn-br` is BR; `/pay/citation-isbn-cn` is CN), `/pay/author-bluesky` (`/pay/citation-author-bluesky`; `/pay/citation-author-twitter` is twitter; `/pay/citation-author-mastodon` is mastodon; `/pay/citation-author-facebook` is facebook; `/pay/citation-author-linkedin` is linkedin), or `/pay/author-facebook` (`/pay/citation-author-facebook`; `/pay/citation-author-bluesky` is bluesky; `/pay/citation-author-twitter` is twitter; `/pay/citation-author-mastodon` is mastodon; `/pay/citation-author-linkedin` is linkedin). Remaining Highwire tags include citation_eisbn_cl, citation_isbn_co, citation_eisbn_co, citation_isbn_pe, citation_author_instagram, and citation_author_threads. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 10:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 759 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.123.0 paths `/pay/citation-eisbn-mx`, `/pay/citation-isbn-ar`, `/pay/citation-eisbn-ar`, `/pay/citation-isbn-cl`, `/pay/citation-author-bluesky`, and `/pay/citation-author-facebook` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.123.0 not indexed yet). New 1.123.0 paths will index after VPS deploy and another register.
