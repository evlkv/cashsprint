# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.131.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-bz` | $0.002 | `url` | Highwire Press `name=citation_eisbn_bz` Belize-edition electronic ISBNs |
| `/pay/citation-isbn-cu` | $0.002 | `url` | Highwire Press `name=citation_isbn_cu` Cuba-edition ISBNs |
| `/pay/citation-eisbn-cu` | $0.002 | `url` | Highwire Press `name=citation_eisbn_cu` Cuba-edition electronic ISBNs |
| `/pay/citation-isbn-do` | $0.002 | `url` | Highwire Press `name=citation_isbn_do` Dominican Republic-edition ISBNs |
| `/pay/citation-author-wechat` | $0.002 | `url` | Highwire Press `name=citation_author_wechat` author WeChat identifiers |
| `/pay/citation-author-kik` | $0.002 | `url` | Highwire Press `name=citation_author_kik` author Kik identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.130.0` (`whois` … `citation-author-line`). `/pay/citation-isbn-bz` remains Highwire citation_isbn_bz; `/pay/citation-eisbn-sv` remains Highwire citation_eisbn_sv; `/pay/citation-eisbn-ni` remains Highwire citation_eisbn_ni; `/pay/citation-author-line` remains Highwire citation_author_line; `/pay/citation-author-signal` remains Highwire citation_author_signal. Do not use `/pay/eisbn-bz` (`/pay/citation-eisbn-bz`; `/pay/citation-isbn-bz` is print BZ; `/pay/citation-eisbn-sv` is eisbn SV; `/pay/citation-eisbn-ni` is eisbn NI; `/pay/citation-eisbn-hn` is eisbn HN), `/pay/isbn-cu` (`/pay/citation-isbn-cu`; `/pay/citation-isbn-bz` is BZ; `/pay/citation-isbn-ni` is NI; `/pay/citation-isbn-sv` is SV), `/pay/eisbn-cu` (`/pay/citation-eisbn-cu`; `/pay/citation-isbn-cu` is print CU; `/pay/citation-eisbn-bz` is eisbn BZ; `/pay/citation-eisbn-sv` is eisbn SV), `/pay/isbn-do` (`/pay/citation-isbn-do`; `/pay/citation-isbn-cu` is CU; `/pay/citation-isbn-bz` is BZ; `/pay/citation-isbn-ni` is NI), `/pay/author-wechat` (`/pay/citation-author-wechat`; `/pay/citation-author-line` is line; `/pay/citation-author-signal` is signal; `/pay/citation-author-whatsapp` is whatsapp; `/pay/citation-author-telegram` is telegram), or `/pay/author-kik` (`/pay/citation-author-kik`; `/pay/citation-author-wechat` is wechat; `/pay/citation-author-line` is line; `/pay/citation-author-signal` is signal). Remaining Highwire tags include citation_eisbn_do, citation_isbn_ht, citation_eisbn_ht, citation_isbn_jm, citation_author_skype, and citation_author_viber. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 18:01 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 807 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.131.0 paths `/pay/citation-eisbn-bz`, `/pay/citation-isbn-cu`, `/pay/citation-eisbn-cu`, `/pay/citation-isbn-do`, `/pay/citation-author-wechat`, and `/pay/citation-author-kik` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.131.0 not indexed yet). New 1.131.0 paths will index after VPS deploy and another register.
