# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.129.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-gt` | $0.002 | `url` | Highwire Press `name=citation_eisbn_gt` Guatemala-edition electronic ISBNs |
| `/pay/citation-isbn-hn` | $0.002 | `url` | Highwire Press `name=citation_isbn_hn` Honduras-edition ISBNs |
| `/pay/citation-eisbn-hn` | $0.002 | `url` | Highwire Press `name=citation_eisbn_hn` Honduras-edition electronic ISBNs |
| `/pay/citation-isbn-sv` | $0.002 | `url` | Highwire Press `name=citation_isbn_sv` El Salvador-edition ISBNs |
| `/pay/citation-author-telegram` | $0.002 | `url` | Highwire Press `name=citation_author_telegram` author Telegram identifiers |
| `/pay/citation-author-whatsapp` | $0.002 | `url` | Highwire Press `name=citation_author_whatsapp` author WhatsApp identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.128.0` (`whois` … `citation-author-discord`). `/pay/citation-isbn-gt` remains Highwire citation_isbn_gt; `/pay/citation-eisbn-cr` remains Highwire citation_eisbn_cr; `/pay/citation-eisbn-pa` remains Highwire citation_eisbn_pa; `/pay/citation-isbn-pa` remains Highwire citation_isbn_pa; `/pay/citation-author-discord` remains Highwire citation_author_discord; `/pay/citation-author-reddit` remains Highwire citation_author_reddit. Do not use `/pay/eisbn-gt` (`/pay/citation-eisbn-gt`; `/pay/citation-isbn-gt` is print GT; `/pay/citation-eisbn-cr` is eisbn CR; `/pay/citation-eisbn-pa` is eisbn PA; `/pay/citation-eisbn-ve` is eisbn VE), `/pay/isbn-hn` (`/pay/citation-isbn-hn`; `/pay/citation-isbn-gt` is GT; `/pay/citation-isbn-pa` is PA; `/pay/citation-isbn-cr` is CR), `/pay/eisbn-hn` (`/pay/citation-eisbn-hn`; `/pay/citation-isbn-hn` is print HN; `/pay/citation-eisbn-gt` is eisbn GT; `/pay/citation-eisbn-cr` is eisbn CR), `/pay/isbn-sv` (`/pay/citation-isbn-sv`; `/pay/citation-isbn-hn` is HN; `/pay/citation-isbn-gt` is GT; `/pay/citation-isbn-pa` is PA), `/pay/author-telegram` (`/pay/citation-author-telegram`; `/pay/citation-author-discord` is discord; `/pay/citation-author-reddit` is reddit; `/pay/citation-author-twitch` is twitch; `/pay/citation-author-snapchat` is snapchat), or `/pay/author-whatsapp` (`/pay/citation-author-whatsapp`; `/pay/citation-author-telegram` is telegram; `/pay/citation-author-discord` is discord; `/pay/citation-author-reddit` is reddit). Remaining Highwire tags include citation_eisbn_sv, citation_isbn_ni, citation_eisbn_ni, citation_isbn_bz, citation_author_signal, and citation_author_line. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 16:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 795 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.129.0 paths `/pay/citation-eisbn-gt`, `/pay/citation-isbn-hn`, `/pay/citation-eisbn-hn`, `/pay/citation-isbn-sv`, `/pay/citation-author-telegram`, and `/pay/citation-author-whatsapp` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.129.0 not indexed yet). New 1.129.0 paths will index after VPS deploy and another register.
