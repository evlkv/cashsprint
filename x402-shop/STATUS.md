# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.133.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-jm` | $0.002 | `url` | Highwire Press `name=citation_eisbn_jm` Jamaica-edition electronic ISBNs |
| `/pay/citation-isbn-tt` | $0.002 | `url` | Highwire Press `name=citation_isbn_tt` Trinidad and Tobago-edition ISBNs |
| `/pay/citation-eisbn-tt` | $0.002 | `url` | Highwire Press `name=citation_eisbn_tt` Trinidad and Tobago-edition electronic ISBNs |
| `/pay/citation-isbn-bb` | $0.002 | `url` | Highwire Press `name=citation_isbn_bb` Barbados-edition ISBNs |
| `/pay/citation-author-icq` | $0.002 | `url` | Highwire Press `name=citation_author_icq` author ICQ identifiers |
| `/pay/citation-author-aim` | $0.002 | `url` | Highwire Press `name=citation_author_aim` author AIM identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.132.0` (`whois` … `citation-author-viber`). `/pay/citation-isbn-jm` remains Highwire citation_isbn_jm; `/pay/citation-eisbn-ht` remains Highwire citation_eisbn_ht; `/pay/citation-eisbn-do` remains Highwire citation_eisbn_do; `/pay/citation-author-viber` remains Highwire citation_author_viber; `/pay/citation-author-skype` remains Highwire citation_author_skype. Do not use `/pay/eisbn-jm` (`/pay/citation-eisbn-jm`; `/pay/citation-isbn-jm` is print JM; `/pay/citation-eisbn-ht` is eisbn HT; `/pay/citation-eisbn-do` is eisbn DO; `/pay/citation-eisbn-tt` is eisbn TT), `/pay/isbn-tt` (`/pay/citation-isbn-tt`; `/pay/citation-isbn-jm` is JM; `/pay/citation-isbn-ht` is HT; `/pay/citation-isbn-do` is DO; `/pay/citation-isbn-bb` is BB), `/pay/eisbn-tt` (`/pay/citation-eisbn-tt`; `/pay/citation-isbn-tt` is print TT; `/pay/citation-eisbn-jm` is eisbn JM; `/pay/citation-eisbn-ht` is eisbn HT), `/pay/isbn-bb` (`/pay/citation-isbn-bb`; `/pay/citation-isbn-tt` is TT; `/pay/citation-isbn-jm` is JM; `/pay/citation-isbn-ht` is HT), `/pay/author-icq` (`/pay/citation-author-icq`; `/pay/citation-author-viber` is viber; `/pay/citation-author-skype` is skype; `/pay/citation-author-kik` is kik; `/pay/citation-author-wechat` is wechat), or `/pay/author-aim` (`/pay/citation-author-aim`; `/pay/citation-author-icq` is icq; `/pay/citation-author-viber` is viber; `/pay/citation-author-skype` is skype). Remaining Highwire tags include citation_eisbn_bb, citation_isbn_bs, citation_eisbn_bs, citation_isbn_lc, citation_author_yahoo, and citation_author_msn. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 20:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 819 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.133.0 paths `/pay/citation-eisbn-jm`, `/pay/citation-isbn-tt`, `/pay/citation-eisbn-tt`, `/pay/citation-isbn-bb`, `/pay/citation-author-icq`, and `/pay/citation-author-aim` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.133.0 not indexed yet). New 1.133.0 paths will index after VPS deploy and another register.
