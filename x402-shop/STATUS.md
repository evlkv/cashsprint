# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.128.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-cr` | $0.002 | `url` | Highwire Press `name=citation_eisbn_cr` Costa Rica-edition electronic ISBNs |
| `/pay/citation-isbn-pa` | $0.002 | `url` | Highwire Press `name=citation_isbn_pa` Panama-edition ISBNs |
| `/pay/citation-eisbn-pa` | $0.002 | `url` | Highwire Press `name=citation_eisbn_pa` Panama-edition electronic ISBNs |
| `/pay/citation-isbn-gt` | $0.002 | `url` | Highwire Press `name=citation_isbn_gt` Guatemala-edition ISBNs |
| `/pay/citation-author-reddit` | $0.002 | `url` | Highwire Press `name=citation_author_reddit` author Reddit identifiers |
| `/pay/citation-author-discord` | $0.002 | `url` | Highwire Press `name=citation_author_discord` author Discord identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.127.0` (`whois` … `citation-author-twitch`). `/pay/citation-isbn-cr` remains Highwire citation_isbn_cr; `/pay/citation-eisbn-ve` remains Highwire citation_eisbn_ve; `/pay/citation-eisbn-bo` remains Highwire citation_eisbn_bo; `/pay/citation-isbn-ve` remains Highwire citation_isbn_ve; `/pay/citation-author-twitch` remains Highwire citation_author_twitch; `/pay/citation-author-snapchat` remains Highwire citation_author_snapchat; `/pay/discord` remains Discord discovery. Do not use `/pay/eisbn-cr` (`/pay/citation-eisbn-cr`; `/pay/citation-isbn-cr` is print CR; `/pay/citation-eisbn-ve` is eisbn VE; `/pay/citation-eisbn-bo` is eisbn BO; `/pay/citation-eisbn-py` is eisbn PY), `/pay/isbn-pa` (`/pay/citation-isbn-pa`; `/pay/citation-isbn-cr` is CR; `/pay/citation-isbn-ve` is VE; `/pay/citation-isbn-bo` is BO; `/pay/citation-isbn-py` is PY), `/pay/eisbn-pa` (`/pay/citation-eisbn-pa`; `/pay/citation-isbn-pa` is print PA; `/pay/citation-eisbn-cr` is eisbn CR; `/pay/citation-eisbn-ve` is eisbn VE; `/pay/citation-eisbn-bo` is eisbn BO), `/pay/isbn-gt` (`/pay/citation-isbn-gt`; `/pay/citation-isbn-pa` is PA; `/pay/citation-isbn-cr` is CR; `/pay/citation-isbn-ve` is VE), `/pay/author-reddit` (`/pay/citation-author-reddit`; `/pay/citation-author-twitch` is twitch; `/pay/citation-author-snapchat` is snapchat; `/pay/citation-author-pinterest` is pinterest; `/pay/citation-author-vimeo` is vimeo), or `/pay/author-discord` (`/pay/citation-author-discord`; `/pay/discord` is Discord discovery; `/pay/citation-author-reddit` is reddit; `/pay/citation-author-twitch` is twitch; `/pay/citation-author-snapchat` is snapchat). Remaining Highwire tags include citation_eisbn_gt, citation_isbn_hn, citation_eisbn_hn, citation_isbn_sv, citation_author_telegram, and citation_author_whatsapp. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 15:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 789 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.128.0 paths `/pay/citation-eisbn-cr`, `/pay/citation-isbn-pa`, `/pay/citation-eisbn-pa`, `/pay/citation-isbn-gt`, `/pay/citation-author-reddit`, and `/pay/citation-author-discord` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru` and `ubuntu@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.128.0 not indexed yet). New 1.128.0 paths will index after VPS deploy and another register.
