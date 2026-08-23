# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.126.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-uy` | $0.002 | `url` | Highwire Press `name=citation_eisbn_uy` Uruguay-edition electronic ISBNs |
| `/pay/citation-isbn-py` | $0.002 | `url` | Highwire Press `name=citation_isbn_py` Paraguay-edition ISBNs |
| `/pay/citation-eisbn-py` | $0.002 | `url` | Highwire Press `name=citation_eisbn_py` Paraguay-edition electronic ISBNs |
| `/pay/citation-isbn-bo` | $0.002 | `url` | Highwire Press `name=citation_isbn_bo` Bolivia-edition ISBNs |
| `/pay/citation-author-vimeo` | $0.002 | `url` | Highwire Press `name=citation_author_vimeo` author Vimeo identifiers |
| `/pay/citation-author-pinterest` | $0.002 | `url` | Highwire Press `name=citation_author_pinterest` author Pinterest identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.125.0` (`whois` … `citation-author-tiktok`). `/pay/citation-isbn-uy` remains Highwire citation_isbn_uy; `/pay/citation-eisbn-pe` remains Highwire citation_eisbn_pe; `/pay/citation-eisbn-ec` remains Highwire citation_eisbn_ec; `/pay/citation-isbn-pe` remains Highwire citation_isbn_pe; `/pay/citation-author-youtube` remains Highwire citation_author_youtube; `/pay/citation-author-tiktok` remains Highwire citation_author_tiktok. Do not use `/pay/eisbn-uy` (`/pay/citation-eisbn-uy`; `/pay/citation-isbn-uy` is print UY; `/pay/citation-eisbn-pe` is eisbn PE; `/pay/citation-eisbn-ec` is eisbn EC; `/pay/citation-eisbn-cl` is eisbn CL), `/pay/isbn-py` (`/pay/citation-isbn-py`; `/pay/citation-isbn-uy` is UY; `/pay/citation-isbn-pe` is PE; `/pay/citation-isbn-ec` is EC; `/pay/citation-isbn-co` is CO), `/pay/eisbn-py` (`/pay/citation-eisbn-py`; `/pay/citation-isbn-py` is print PY; `/pay/citation-eisbn-uy` is eisbn UY; `/pay/citation-eisbn-pe` is eisbn PE; `/pay/citation-eisbn-ec` is eisbn EC), `/pay/isbn-bo` (`/pay/citation-isbn-bo`; `/pay/citation-isbn-py` is PY; `/pay/citation-isbn-uy` is UY; `/pay/citation-isbn-pe` is PE; `/pay/citation-isbn-ec` is EC), `/pay/author-vimeo` (`/pay/citation-author-vimeo`; `/pay/citation-author-youtube` is youtube; `/pay/citation-author-tiktok` is tiktok; `/pay/citation-author-instagram` is instagram; `/pay/citation-author-threads` is threads), or `/pay/author-pinterest` (`/pay/citation-author-pinterest`; `/pay/citation-author-vimeo` is vimeo; `/pay/citation-author-youtube` is youtube; `/pay/citation-author-tiktok` is tiktok; `/pay/citation-author-instagram` is instagram). Remaining Highwire tags include citation_eisbn_bo, citation_isbn_ve, citation_eisbn_ve, citation_isbn_cr, citation_author_snapchat, and citation_author_twitch. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 13:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 777 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.126.0 paths `/pay/citation-eisbn-uy`, `/pay/citation-isbn-py`, `/pay/citation-eisbn-py`, `/pay/citation-isbn-bo`, `/pay/citation-author-vimeo`, and `/pay/citation-author-pinterest` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.126.0 not indexed yet). New 1.126.0 paths will index after VPS deploy and another register.
