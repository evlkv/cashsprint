# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.134.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-bb` | $0.002 | `url` | Highwire Press `name=citation_eisbn_bb` Barbados-edition electronic ISBNs |
| `/pay/citation-isbn-bs` | $0.002 | `url` | Highwire Press `name=citation_isbn_bs` Bahamas-edition ISBNs |
| `/pay/citation-eisbn-bs` | $0.002 | `url` | Highwire Press `name=citation_eisbn_bs` Bahamas-edition electronic ISBNs |
| `/pay/citation-isbn-lc` | $0.002 | `url` | Highwire Press `name=citation_isbn_lc` Saint Lucia-edition ISBNs |
| `/pay/citation-author-yahoo` | $0.002 | `url` | Highwire Press `name=citation_author_yahoo` author Yahoo identifiers |
| `/pay/citation-author-msn` | $0.002 | `url` | Highwire Press `name=citation_author_msn` author MSN identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.133.0` (`whois` … `citation-author-aim`). `/pay/citation-isbn-bb` remains Highwire citation_isbn_bb; `/pay/citation-eisbn-tt` remains Highwire citation_eisbn_tt; `/pay/citation-author-aim` remains Highwire citation_author_aim; `/pay/citation-author-icq` remains Highwire citation_author_icq. Do not use `/pay/eisbn-bb` (`/pay/citation-eisbn-bb`; `/pay/citation-isbn-bb` is print BB; `/pay/citation-eisbn-tt` is eisbn TT; `/pay/citation-eisbn-jm` is eisbn JM; `/pay/citation-eisbn-ht` is eisbn HT), `/pay/isbn-bs` (`/pay/citation-isbn-bs`; `/pay/citation-isbn-bb` is BB; `/pay/citation-isbn-tt` is TT; `/pay/citation-isbn-jm` is JM; `/pay/citation-isbn-lc` is LC), `/pay/eisbn-bs` (`/pay/citation-eisbn-bs`; `/pay/citation-isbn-bs` is print BS; `/pay/citation-eisbn-bb` is eisbn BB; `/pay/citation-eisbn-tt` is eisbn TT), `/pay/isbn-lc` (`/pay/citation-isbn-lc`; `/pay/citation-isbn-bs` is BS; `/pay/citation-isbn-bb` is BB; `/pay/citation-isbn-tt` is TT), `/pay/author-yahoo` (`/pay/citation-author-yahoo`; `/pay/citation-author-aim` is aim; `/pay/citation-author-icq` is icq; `/pay/citation-author-viber` is viber; `/pay/citation-author-skype` is skype), or `/pay/author-msn` (`/pay/citation-author-msn`; `/pay/citation-author-yahoo` is yahoo; `/pay/citation-author-aim` is aim; `/pay/citation-author-icq` is icq). Remaining Highwire tags include citation_eisbn_lc, citation_isbn_gd, citation_eisbn_gd, citation_isbn_vc, citation_author_aol, and citation_author_hotmail. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 21:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 825 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.134.0 paths `/pay/citation-eisbn-bb`, `/pay/citation-isbn-bs`, `/pay/citation-eisbn-bs`, `/pay/citation-isbn-lc`, `/pay/citation-author-yahoo`, and `/pay/citation-author-msn` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.134.0 not indexed yet). New 1.134.0 paths will index after VPS deploy and another register.
