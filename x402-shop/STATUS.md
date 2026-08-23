# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.125.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-pe` | $0.002 | `url` | Highwire Press `name=citation_eisbn_pe` Peru-edition electronic ISBNs |
| `/pay/citation-isbn-ec` | $0.002 | `url` | Highwire Press `name=citation_isbn_ec` Ecuador-edition ISBNs |
| `/pay/citation-eisbn-ec` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ec` Ecuador-edition electronic ISBNs |
| `/pay/citation-isbn-uy` | $0.002 | `url` | Highwire Press `name=citation_isbn_uy` Uruguay-edition ISBNs |
| `/pay/citation-author-youtube` | $0.002 | `url` | Highwire Press `name=citation_author_youtube` author YouTube identifiers |
| `/pay/citation-author-tiktok` | $0.002 | `url` | Highwire Press `name=citation_author_tiktok` author TikTok identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.124.0` (`whois` … `citation-author-threads`). `/pay/citation-isbn-pe` remains Highwire citation_isbn_pe; `/pay/citation-eisbn-cl` remains Highwire citation_eisbn_cl; `/pay/citation-eisbn-co` remains Highwire citation_eisbn_co; `/pay/citation-isbn-co` remains Highwire citation_isbn_co; `/pay/citation-author-instagram` remains Highwire citation_author_instagram; `/pay/citation-author-threads` remains Highwire citation_author_threads. Do not use `/pay/eisbn-pe` (`/pay/citation-eisbn-pe`; `/pay/citation-isbn-pe` is print PE; `/pay/citation-eisbn-cl` is eisbn CL; `/pay/citation-eisbn-co` is eisbn CO; `/pay/citation-eisbn-ar` is eisbn AR), `/pay/isbn-ec` (`/pay/citation-isbn-ec`; `/pay/citation-isbn-pe` is PE; `/pay/citation-isbn-co` is CO; `/pay/citation-isbn-cl` is CL; `/pay/citation-isbn-ar` is AR), `/pay/eisbn-ec` (`/pay/citation-eisbn-ec`; `/pay/citation-isbn-ec` is print EC; `/pay/citation-eisbn-pe` is eisbn PE; `/pay/citation-eisbn-cl` is eisbn CL; `/pay/citation-eisbn-co` is eisbn CO), `/pay/isbn-uy` (`/pay/citation-isbn-uy`; `/pay/citation-isbn-pe` is PE; `/pay/citation-isbn-ec` is EC; `/pay/citation-isbn-co` is CO; `/pay/citation-isbn-cl` is CL), `/pay/author-youtube` (`/pay/citation-author-youtube`; `/pay/citation-author-instagram` is instagram; `/pay/citation-author-threads` is threads; `/pay/citation-author-facebook` is facebook; `/pay/citation-author-twitter` is twitter), or `/pay/author-tiktok` (`/pay/citation-author-tiktok`; `/pay/citation-author-youtube` is youtube; `/pay/citation-author-instagram` is instagram; `/pay/citation-author-threads` is threads; `/pay/citation-author-facebook` is facebook). Remaining Highwire tags include citation_eisbn_uy, citation_isbn_py, citation_eisbn_py, citation_isbn_bo, citation_author_vimeo, and citation_author_pinterest. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 12:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 771 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.125.0 paths `/pay/citation-eisbn-pe`, `/pay/citation-isbn-ec`, `/pay/citation-eisbn-ec`, `/pay/citation-isbn-uy`, `/pay/citation-author-youtube`, and `/pay/citation-author-tiktok` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.125.0 not indexed yet). New 1.125.0 paths will index after VPS deploy and another register.
