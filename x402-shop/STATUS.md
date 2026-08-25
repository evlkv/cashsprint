# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.157.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-um` | $0.002 | `url` | Highwire Press `name=citation_eisbn_um` United-States-Minor-Outlying-Islands-edition electronic ISBNs |
| `/pay/citation-isbn-aq` | $0.002 | `url` | Highwire Press `name=citation_isbn_aq` Antarctica-edition ISBNs |
| `/pay/citation-eisbn-aq` | $0.002 | `url` | Highwire Press `name=citation_eisbn_aq` Antarctica-edition electronic ISBNs |
| `/pay/citation-isbn-eh` | $0.002 | `url` | Highwire Press `name=citation_isbn_eh` Western-Sahara-edition ISBNs |
| `/pay/citation-author-icloudwifiip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudwifiip` author iCloud Wi-Fi IP identifiers |
| `/pay/citation-author-icloudblemac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudblemac` author iCloud BLE MAC identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.156.0` (`whois` … `citation-author-icloudbtaddr`). `/pay/citation-isbn-um` remains Highwire citation_isbn_um; `/pay/citation-author-icloudbtaddr` remains Highwire citation_author_icloudbtaddr; `/pay/citation-author-icloudwifimac` remains Highwire citation_author_icloudwifimac. Do not use `/pay/eisbn-um` (`/pay/citation-eisbn-um`; `/pay/citation-isbn-um` is print UM; `/pay/citation-eisbn-hm` is eisbn HM; `/pay/citation-eisbn-bv` is eisbn BV), `/pay/isbn-aq` (`/pay/citation-isbn-aq`; `/pay/citation-isbn-um` is UM; `/pay/citation-isbn-hm` is HM; `/pay/citation-isbn-bv` is BV), `/pay/eisbn-aq` (`/pay/citation-eisbn-aq`; `/pay/citation-isbn-aq` is print AQ; `/pay/citation-eisbn-um` is eisbn UM; `/pay/citation-eisbn-hm` is eisbn HM), `/pay/isbn-eh` (`/pay/citation-isbn-eh`; `/pay/citation-isbn-aq` is AQ; `/pay/citation-isbn-um` is UM; `/pay/citation-isbn-hm` is HM), `/pay/author-icloudwifiip` (`/pay/citation-author-icloudwifiip`; `/pay/citation-author-icloudbtaddr` is icloudbtaddr; `/pay/citation-author-icloudwifimac` is icloudwifimac; `/pay/citation-author-icloudesn` is icloudesn), or `/pay/author-icloudblemac` (`/pay/citation-author-icloudblemac`; `/pay/citation-author-icloudwifiip` is icloudwifiip; `/pay/citation-author-icloudbtaddr` is icloudbtaddr; `/pay/citation-author-icloudwifimac` is icloudwifimac). Remaining Highwire tags include citation_eisbn_eh, citation_isbn_ps, citation_eisbn_ps, citation_isbn_ic, citation_author_icloudbleip, and citation_author_icloudwifiipv6. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 01:01 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 963 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` (45.88.175.165) answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-um` is 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banners work, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.157.0 paths will index after rsync/restart and another register.
