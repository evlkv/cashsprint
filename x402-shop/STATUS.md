# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.168.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-qu` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qu` user-assigned-QU-edition electronic ISBNs |
| `/pay/citation-isbn-qv` | $0.002 | `url` | Highwire Press `name=citation_isbn_qv` user-assigned-QV-edition ISBNs |
| `/pay/citation-eisbn-qv` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qv` user-assigned-QV-edition electronic ISBNs |
| `/pay/citation-isbn-qw` | $0.002 | `url` | Highwire Press `name=citation_isbn_qw` user-assigned-QW-edition ISBNs |
| `/pay/citation-author-icloudcellbleip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellbleip` author iCloud cellular BLE IP identifiers |
| `/pay/citation-author-icloudcellwifiipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellwifiipv6` author iCloud cellular Wi-Fi IPv6 identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.167.0` (`whois` … `citation-author-icloudcellblemac`). `/pay/citation-isbn-qu` remains Highwire citation_isbn_qu; `/pay/citation-eisbn-qt` remains Highwire citation_eisbn_qt; `/pay/citation-author-icloudbleip` remains Highwire citation_author_icloudbleip; `/pay/citation-author-icloudwifiipv6` remains Highwire citation_author_icloudwifiipv6. Do not use `/pay/eisbn-qu` (`/pay/citation-eisbn-qu`; `/pay/citation-isbn-qu` is print QU; `/pay/citation-eisbn-qt` is eisbn QT; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qv` (`/pay/citation-isbn-qv`; `/pay/citation-isbn-qu` is QU; `/pay/citation-isbn-qt` is QT; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-qv` (`/pay/citation-eisbn-qv`; `/pay/citation-isbn-qv` is print QV; `/pay/citation-eisbn-qu` is eisbn QU; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qw` (`/pay/citation-isbn-qw`; `/pay/citation-isbn-qv` is QV; `/pay/citation-isbn-qu` is QU; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellbleip` (`/pay/citation-author-icloudcellbleip`; `/pay/citation-author-icloudbleip` is icloudbleip; `/pay/citation-author-icloudcellip` is icloudcellip; `/pay/citation-author-icloudcellwifiip` is icloudcellwifiip), or `/pay/author-icloudcellwifiipv6` (`/pay/citation-author-icloudcellwifiipv6`; `/pay/citation-author-icloudwifiipv6` is icloudwifiipv6; `/pay/citation-author-icloudcellipv6` is icloudcellipv6; `/pay/citation-author-icloudcellwifiip` is icloudcellwifiip). Remaining Highwire tags include citation_eisbn_qw, citation_isbn_qx, citation_eisbn_qx, citation_isbn_qy, citation_author_icloudcellbleipv6, and citation_author_icloudcellbtip. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 12:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1029 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-qu` and `/pay/citation-isbn-qv` (and the other four 1.168.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.168.0 paths will index after rsync/restart and another register.
