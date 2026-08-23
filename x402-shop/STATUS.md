# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.130.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sv` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sv` El Salvador-edition electronic ISBNs |
| `/pay/citation-isbn-ni` | $0.002 | `url` | Highwire Press `name=citation_isbn_ni` Nicaragua-edition ISBNs |
| `/pay/citation-eisbn-ni` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ni` Nicaragua-edition electronic ISBNs |
| `/pay/citation-isbn-bz` | $0.002 | `url` | Highwire Press `name=citation_isbn_bz` Belize-edition ISBNs |
| `/pay/citation-author-signal` | $0.002 | `url` | Highwire Press `name=citation_author_signal` author Signal identifiers |
| `/pay/citation-author-line` | $0.002 | `url` | Highwire Press `name=citation_author_line` author LINE identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.129.0` (`whois` … `citation-author-whatsapp`). `/pay/citation-isbn-sv` remains Highwire citation_isbn_sv; `/pay/citation-eisbn-hn` remains Highwire citation_eisbn_hn; `/pay/citation-eisbn-gt` remains Highwire citation_eisbn_gt; `/pay/ni` remains the 1.39.0 Named Information route; `/pay/citation-author-whatsapp` remains Highwire citation_author_whatsapp; `/pay/citation-author-telegram` remains Highwire citation_author_telegram. Do not use `/pay/eisbn-sv` (`/pay/citation-eisbn-sv`; `/pay/citation-isbn-sv` is print SV; `/pay/citation-eisbn-hn` is eisbn HN; `/pay/citation-eisbn-gt` is eisbn GT; `/pay/citation-eisbn-cr` is eisbn CR), `/pay/isbn-ni` (`/pay/citation-isbn-ni`; `/pay/ni` is 1.39.0 Named Information; `/pay/citation-isbn-sv` is SV; `/pay/citation-isbn-hn` is HN; `/pay/citation-isbn-gt` is GT), `/pay/eisbn-ni` (`/pay/citation-eisbn-ni`; `/pay/citation-isbn-ni` is print NI; `/pay/citation-eisbn-sv` is eisbn SV; `/pay/citation-eisbn-hn` is eisbn HN), `/pay/isbn-bz` (`/pay/citation-isbn-bz`; `/pay/citation-isbn-ni` is NI; `/pay/citation-isbn-sv` is SV; `/pay/citation-isbn-hn` is HN), `/pay/author-signal` (`/pay/citation-author-signal`; `/pay/citation-author-whatsapp` is whatsapp; `/pay/citation-author-telegram` is telegram; `/pay/citation-author-discord` is discord; `/pay/citation-author-reddit` is reddit), or `/pay/author-line` (`/pay/citation-author-line`; `/pay/citation-author-signal` is signal; `/pay/citation-author-whatsapp` is whatsapp; `/pay/citation-author-telegram` is telegram). Remaining Highwire tags include citation_eisbn_bz, citation_isbn_cu, citation_eisbn_cu, citation_isbn_do, citation_author_wechat, and citation_author_kik. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 17:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 801 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.130.0 paths `/pay/citation-eisbn-sv`, `/pay/citation-isbn-ni`, `/pay/citation-eisbn-ni`, `/pay/citation-isbn-bz`, `/pay/citation-author-signal`, and `/pay/citation-author-line` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.130.0 not indexed yet). New 1.130.0 paths will index after VPS deploy and another register.
