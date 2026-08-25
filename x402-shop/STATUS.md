# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.166.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-qq` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qq` user-assigned-QQ-edition electronic ISBNs |
| `/pay/citation-isbn-qr` | $0.002 | `url` | Highwire Press `name=citation_isbn_qr` user-assigned-QR-edition ISBNs |
| `/pay/citation-eisbn-qr` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qr` user-assigned-QR-edition electronic ISBNs |
| `/pay/citation-isbn-qs` | $0.002 | `url` | Highwire Press `name=citation_isbn_qs` user-assigned-QS-edition ISBNs |
| `/pay/citation-author-icloudcellwifimac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellwifimac` author iCloud cellular Wi-Fi MAC identifiers |
| `/pay/citation-author-icloudcellbtaddr` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellbtaddr` author iCloud cellular Bluetooth address identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.165.0` (`whois` … `citation-author-icloudcellsn`). `/pay/citation-isbn-qq` remains Highwire citation_isbn_qq; `/pay/citation-eisbn-qp` remains Highwire citation_eisbn_qp; `/pay/citation-author-icloudwifimac` remains Highwire citation_author_icloudwifimac; `/pay/citation-author-icloudbtaddr` remains Highwire citation_author_icloudbtaddr. Do not use `/pay/eisbn-qq` (`/pay/citation-eisbn-qq`; `/pay/citation-isbn-qq` is print QQ; `/pay/citation-eisbn-qp` is eisbn QP; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qr` (`/pay/citation-isbn-qr`; `/pay/citation-isbn-qq` is QQ; `/pay/citation-isbn-qp` is QP; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-qr` (`/pay/citation-eisbn-qr`; `/pay/citation-isbn-qr` is print QR; `/pay/citation-eisbn-qq` is eisbn QQ; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qs` (`/pay/citation-isbn-qs`; `/pay/citation-isbn-qr` is QR; `/pay/citation-isbn-qq` is QQ; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellwifimac` (`/pay/citation-author-icloudcellwifimac`; `/pay/citation-author-icloudwifimac` is icloudwifimac; `/pay/citation-author-icloudcellsn` is icloudcellsn; `/pay/citation-author-icloudcellmac` is icloudcellmac), or `/pay/author-icloudcellbtaddr` (`/pay/citation-author-icloudcellbtaddr`; `/pay/citation-author-icloudbtaddr` is icloudbtaddr; `/pay/citation-author-icloudcellwifimac` is icloudcellwifimac; `/pay/citation-author-icloudcellsn` is icloudcellsn). Remaining Highwire tags include citation_eisbn_qs, citation_isbn_qt, citation_eisbn_qt, citation_isbn_qu, citation_author_icloudcellwifiip, and citation_author_icloudcellblemac. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 10:08 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1017 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-qq` and `/pay/citation-isbn-qr` are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banner answers (OpenSSH_9.6p1 Ubuntu-3ubuntu13.18), but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.166.0 paths will index after rsync/restart and another register.
