# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.167.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-qs` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qs` user-assigned-QS-edition electronic ISBNs |
| `/pay/citation-isbn-qt` | $0.002 | `url` | Highwire Press `name=citation_isbn_qt` user-assigned-QT-edition ISBNs |
| `/pay/citation-eisbn-qt` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qt` user-assigned-QT-edition electronic ISBNs |
| `/pay/citation-isbn-qu` | $0.002 | `url` | Highwire Press `name=citation_isbn_qu` user-assigned-QU-edition ISBNs |
| `/pay/citation-author-icloudcellwifiip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellwifiip` author iCloud cellular Wi-Fi IP identifiers |
| `/pay/citation-author-icloudcellblemac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellblemac` author iCloud cellular BLE MAC identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.166.0` (`whois` … `citation-author-icloudcellbtaddr`). `/pay/citation-isbn-qs` remains Highwire citation_isbn_qs; `/pay/citation-eisbn-qr` remains Highwire citation_eisbn_qr; `/pay/citation-author-icloudwifiip` remains Highwire citation_author_icloudwifiip; `/pay/citation-author-icloudblemac` remains Highwire citation_author_icloudblemac. Do not use `/pay/eisbn-qs` (`/pay/citation-eisbn-qs`; `/pay/citation-isbn-qs` is print QS; `/pay/citation-eisbn-qr` is eisbn QR; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qt` (`/pay/citation-isbn-qt`; `/pay/citation-isbn-qs` is QS; `/pay/citation-isbn-qr` is QR; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-qt` (`/pay/citation-eisbn-qt`; `/pay/citation-isbn-qt` is print QT; `/pay/citation-eisbn-qs` is eisbn QS; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qu` (`/pay/citation-isbn-qu`; `/pay/citation-isbn-qt` is QT; `/pay/citation-isbn-qs` is QS; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellwifiip` (`/pay/citation-author-icloudcellwifiip`; `/pay/citation-author-icloudwifiip` is icloudwifiip; `/pay/citation-author-icloudcellip` is icloudcellip; `/pay/citation-author-icloudcellwifimac` is icloudcellwifimac), or `/pay/author-icloudcellblemac` (`/pay/citation-author-icloudcellblemac`; `/pay/citation-author-icloudblemac` is icloudblemac; `/pay/citation-author-icloudcellwifiip` is icloudcellwifiip; `/pay/citation-author-icloudcellwifimac` is icloudcellwifimac). Remaining Highwire tags include citation_eisbn_qu, citation_isbn_qv, citation_eisbn_qv, citation_isbn_qw, citation_author_icloudcellbleip, and citation_author_icloudcellwifiipv6. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 11:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1023 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-qs` and `/pay/citation-isbn-qt` (and the other four 1.167.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banner answers (OpenSSH_9.6p1 Ubuntu-3ubuntu13.18), but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.167.0 paths will index after rsync/restart and another register.
