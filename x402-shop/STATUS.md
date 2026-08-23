# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.127.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-bo` | $0.002 | `url` | Highwire Press `name=citation_eisbn_bo` Bolivia-edition electronic ISBNs |
| `/pay/citation-isbn-ve` | $0.002 | `url` | Highwire Press `name=citation_isbn_ve` Venezuela-edition ISBNs |
| `/pay/citation-eisbn-ve` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ve` Venezuela-edition electronic ISBNs |
| `/pay/citation-isbn-cr` | $0.002 | `url` | Highwire Press `name=citation_isbn_cr` Costa Rica-edition ISBNs |
| `/pay/citation-author-snapchat` | $0.002 | `url` | Highwire Press `name=citation_author_snapchat` author Snapchat identifiers |
| `/pay/citation-author-twitch` | $0.002 | `url` | Highwire Press `name=citation_author_twitch` author Twitch identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.126.0` (`whois` … `citation-author-pinterest`). `/pay/citation-isbn-bo` remains Highwire citation_isbn_bo; `/pay/citation-eisbn-py` remains Highwire citation_eisbn_py; `/pay/citation-eisbn-uy` remains Highwire citation_eisbn_uy; `/pay/citation-isbn-py` remains Highwire citation_isbn_py; `/pay/citation-author-pinterest` remains Highwire citation_author_pinterest; `/pay/citation-author-vimeo` remains Highwire citation_author_vimeo. Do not use `/pay/eisbn-bo` (`/pay/citation-eisbn-bo`; `/pay/citation-isbn-bo` is print BO; `/pay/citation-eisbn-py` is eisbn PY; `/pay/citation-eisbn-uy` is eisbn UY; `/pay/citation-eisbn-pe` is eisbn PE), `/pay/isbn-ve` (`/pay/citation-isbn-ve`; `/pay/citation-isbn-bo` is BO; `/pay/citation-isbn-py` is PY; `/pay/citation-isbn-uy` is UY; `/pay/citation-isbn-pe` is PE), `/pay/eisbn-ve` (`/pay/citation-eisbn-ve`; `/pay/citation-isbn-ve` is print VE; `/pay/citation-eisbn-bo` is eisbn BO; `/pay/citation-eisbn-py` is eisbn PY; `/pay/citation-eisbn-uy` is eisbn UY), `/pay/isbn-cr` (`/pay/citation-isbn-cr`; `/pay/citation-isbn-ve` is VE; `/pay/citation-isbn-bo` is BO; `/pay/citation-isbn-py` is PY; `/pay/citation-isbn-uy` is UY), `/pay/author-snapchat` (`/pay/citation-author-snapchat`; `/pay/citation-author-pinterest` is pinterest; `/pay/citation-author-vimeo` is vimeo; `/pay/citation-author-youtube` is youtube; `/pay/citation-author-tiktok` is tiktok), or `/pay/author-twitch` (`/pay/citation-author-twitch`; `/pay/citation-author-snapchat` is snapchat; `/pay/citation-author-pinterest` is pinterest; `/pay/citation-author-vimeo` is vimeo; `/pay/citation-author-youtube` is youtube). Remaining Highwire tags include citation_eisbn_cr, citation_isbn_pa, citation_eisbn_pa, citation_isbn_gt, citation_author_reddit, and citation_author_discord. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 14:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 783 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.127.0 paths `/pay/citation-eisbn-bo`, `/pay/citation-isbn-ve`, `/pay/citation-eisbn-ve`, `/pay/citation-isbn-cr`, `/pay/citation-author-snapchat`, and `/pay/citation-author-twitch` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.127.0 not indexed yet). New 1.127.0 paths will index after VPS deploy and another register.
