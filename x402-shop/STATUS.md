# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.132.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-do` | $0.002 | `url` | Highwire Press `name=citation_eisbn_do` Dominican Republic-edition electronic ISBNs |
| `/pay/citation-isbn-ht` | $0.002 | `url` | Highwire Press `name=citation_isbn_ht` Haiti-edition ISBNs |
| `/pay/citation-eisbn-ht` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ht` Haiti-edition electronic ISBNs |
| `/pay/citation-isbn-jm` | $0.002 | `url` | Highwire Press `name=citation_isbn_jm` Jamaica-edition ISBNs |
| `/pay/citation-author-skype` | $0.002 | `url` | Highwire Press `name=citation_author_skype` author Skype identifiers |
| `/pay/citation-author-viber` | $0.002 | `url` | Highwire Press `name=citation_author_viber` author Viber identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.131.0` (`whois` … `citation-author-kik`). `/pay/citation-isbn-do` remains Highwire citation_isbn_do; `/pay/citation-eisbn-cu` remains Highwire citation_eisbn_cu; `/pay/citation-eisbn-bz` remains Highwire citation_eisbn_bz; `/pay/citation-author-kik` remains Highwire citation_author_kik; `/pay/citation-author-wechat` remains Highwire citation_author_wechat. Do not use `/pay/eisbn-do` (`/pay/citation-eisbn-do`; `/pay/citation-isbn-do` is print DO; `/pay/citation-eisbn-cu` is eisbn CU; `/pay/citation-eisbn-bz` is eisbn BZ; `/pay/citation-eisbn-ht` is eisbn HT), `/pay/isbn-ht` (`/pay/citation-isbn-ht`; `/pay/citation-isbn-do` is DO; `/pay/citation-isbn-cu` is CU; `/pay/citation-isbn-bz` is BZ; `/pay/citation-isbn-jm` is JM), `/pay/eisbn-ht` (`/pay/citation-eisbn-ht`; `/pay/citation-isbn-ht` is print HT; `/pay/citation-eisbn-do` is eisbn DO; `/pay/citation-eisbn-cu` is eisbn CU), `/pay/isbn-jm` (`/pay/citation-isbn-jm`; `/pay/citation-isbn-ht` is HT; `/pay/citation-isbn-do` is DO; `/pay/citation-isbn-cu` is CU), `/pay/author-skype` (`/pay/citation-author-skype`; `/pay/citation-author-kik` is kik; `/pay/citation-author-wechat` is wechat; `/pay/citation-author-line` is line; `/pay/citation-author-signal` is signal), or `/pay/author-viber` (`/pay/citation-author-viber`; `/pay/citation-author-skype` is skype; `/pay/citation-author-kik` is kik; `/pay/citation-author-wechat` is wechat). Remaining Highwire tags include citation_eisbn_jm, citation_isbn_tt, citation_eisbn_tt, citation_isbn_bb, citation_author_icq, and citation_author_aim. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 19:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 813 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.132.0 paths `/pay/citation-eisbn-do`, `/pay/citation-isbn-ht`, `/pay/citation-eisbn-ht`, `/pay/citation-isbn-jm`, `/pay/citation-author-skype`, and `/pay/citation-author-viber` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.132.0 not indexed yet). New 1.132.0 paths will index after VPS deploy and another register.
