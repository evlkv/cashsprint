# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.124.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-cl` | $0.002 | `url` | Highwire Press `name=citation_eisbn_cl` Chile-edition electronic ISBNs |
| `/pay/citation-isbn-co` | $0.002 | `url` | Highwire Press `name=citation_isbn_co` Colombia-edition ISBNs |
| `/pay/citation-eisbn-co` | $0.002 | `url` | Highwire Press `name=citation_eisbn_co` Colombia-edition electronic ISBNs |
| `/pay/citation-isbn-pe` | $0.002 | `url` | Highwire Press `name=citation_isbn_pe` Peru-edition ISBNs |
| `/pay/citation-author-instagram` | $0.002 | `url` | Highwire Press `name=citation_author_instagram` author Instagram identifiers |
| `/pay/citation-author-threads` | $0.002 | `url` | Highwire Press `name=citation_author_threads` author Threads identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.123.0` (`whois` … `citation-author-facebook`). `/pay/citation-isbn-cl` remains Highwire citation_isbn_cl; `/pay/citation-eisbn-ar` remains Highwire citation_eisbn_ar; `/pay/citation-eisbn-mx` remains Highwire citation_eisbn_mx; `/pay/citation-isbn-ar` remains Highwire citation_isbn_ar; `/pay/citation-author-facebook` remains Highwire citation_author_facebook; `/pay/citation-author-bluesky` remains Highwire citation_author_bluesky; `/pay/citation-author-twitter` remains Highwire citation_author_twitter. Do not use `/pay/eisbn-cl` (`/pay/citation-eisbn-cl`; `/pay/citation-isbn-cl` is print CL; `/pay/citation-eisbn-ar` is eisbn AR; `/pay/citation-eisbn-mx` is eisbn MX; `/pay/citation-eisbn-br` is eisbn BR), `/pay/isbn-co` (`/pay/citation-isbn-co`; `/pay/citation-isbn-cl` is CL; `/pay/citation-isbn-ar` is AR; `/pay/citation-isbn-pe` is PE; `/pay/citation-isbn-mx` is MX), `/pay/eisbn-co` (`/pay/citation-eisbn-co`; `/pay/citation-isbn-co` is print CO; `/pay/citation-eisbn-cl` is eisbn CL; `/pay/citation-eisbn-ar` is eisbn AR; `/pay/citation-eisbn-mx` is eisbn MX), `/pay/isbn-pe` (`/pay/citation-isbn-pe`; `/pay/citation-isbn-co` is CO; `/pay/citation-isbn-cl` is CL; `/pay/citation-isbn-ar` is AR; `/pay/citation-isbn-mx` is MX), `/pay/author-instagram` (`/pay/citation-author-instagram`; `/pay/citation-author-facebook` is facebook; `/pay/citation-author-bluesky` is bluesky; `/pay/citation-author-threads` is threads; `/pay/citation-author-twitter` is twitter), or `/pay/author-threads` (`/pay/citation-author-threads`; `/pay/citation-author-instagram` is instagram; `/pay/citation-author-facebook` is facebook; `/pay/citation-author-bluesky` is bluesky; `/pay/citation-author-twitter` is twitter). Remaining Highwire tags include citation_eisbn_pe, citation_isbn_ec, citation_eisbn_ec, citation_isbn_uy, citation_author_youtube, and citation_author_tiktok. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 11:01 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 765 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.124.0 paths `/pay/citation-eisbn-cl`, `/pay/citation-isbn-co`, `/pay/citation-eisbn-co`, `/pay/citation-isbn-pe`, `/pay/citation-author-instagram`, and `/pay/citation-author-threads` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.124.0 not indexed yet). New 1.124.0 paths will index after VPS deploy and another register.
