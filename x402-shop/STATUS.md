# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.137.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-kn` | $0.002 | `url` | Highwire Press `name=citation_eisbn_kn` Saint Kitts-edition electronic ISBNs |
| `/pay/citation-isbn-dm` | $0.002 | `url` | Highwire Press `name=citation_isbn_dm` Dominica-edition ISBNs |
| `/pay/citation-eisbn-dm` | $0.002 | `url` | Highwire Press `name=citation_eisbn_dm` Dominica-edition electronic ISBNs |
| `/pay/citation-isbn-ky` | $0.002 | `url` | Highwire Press `name=citation_isbn_ky` Cayman-edition ISBNs |
| `/pay/citation-author-outlook` | $0.002 | `url` | Highwire Press `name=citation_author_outlook` author Outlook identifiers |
| `/pay/citation-author-icloud` | $0.002 | `url` | Highwire Press `name=citation_author_icloud` author iCloud identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.136.0` (`whois` … `citation-author-live`). `/pay/citation-isbn-kn` remains Highwire citation_isbn_kn; `/pay/citation-eisbn-ag` remains Highwire citation_eisbn_ag; `/pay/citation-author-live` remains Highwire citation_author_live; `/pay/citation-author-gmail` remains Highwire citation_author_gmail. Do not use `/pay/eisbn-kn` (`/pay/citation-eisbn-kn`; `/pay/citation-isbn-kn` is print KN; `/pay/citation-eisbn-ag` is eisbn AG; `/pay/citation-eisbn-vc` is eisbn VC; `/pay/citation-eisbn-gd` is eisbn GD), `/pay/isbn-dm` (`/pay/citation-isbn-dm`; `/pay/citation-isbn-kn` is KN; `/pay/citation-isbn-ag` is AG; `/pay/citation-isbn-vc` is VC; `/pay/citation-isbn-gd` is GD), `/pay/eisbn-dm` (`/pay/citation-eisbn-dm`; `/pay/citation-isbn-dm` is print DM; `/pay/citation-eisbn-kn` is eisbn KN; `/pay/citation-eisbn-ag` is eisbn AG), `/pay/isbn-ky` (`/pay/citation-isbn-ky`; `/pay/citation-isbn-dm` is DM; `/pay/citation-isbn-kn` is KN; `/pay/citation-isbn-ag` is AG), `/pay/author-outlook` (`/pay/citation-author-outlook`; `/pay/citation-author-live` is live; `/pay/citation-author-gmail` is gmail; `/pay/citation-author-hotmail` is hotmail; `/pay/citation-author-aol` is aol), or `/pay/author-icloud` (`/pay/citation-author-icloud`; `/pay/citation-author-outlook` is outlook; `/pay/citation-author-live` is live; `/pay/citation-author-gmail` is gmail). Remaining Highwire tags include citation_eisbn_ky, citation_isbn_ms, citation_eisbn_ms, citation_isbn_ai, citation_author_me, and citation_author_mac. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 00:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 843 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.137.0 paths `/pay/citation-eisbn-kn`, `/pay/citation-isbn-dm`, `/pay/citation-eisbn-dm`, `/pay/citation-isbn-ky`, `/pay/citation-author-outlook`, and `/pay/citation-author-icloud` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.137.0 not indexed yet). New 1.137.0 paths will index after VPS deploy and another register.
