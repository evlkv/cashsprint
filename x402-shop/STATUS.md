# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.186.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sf` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sf` user-assigned-SF-edition electronic ISBNs |
| `/pay/citation-isbn-si` | $0.002 | `url` | Highwire Press `name=citation_isbn_si` user-assigned-SI-edition ISBNs |
| `/pay/citation-eisbn-si` | $0.002 | `url` | Highwire Press `name=citation_eisbn_si` user-assigned-SI-edition electronic ISBNs |
| `/pay/citation-isbn-sk` | $0.002 | `url` | Highwire Press `name=citation_isbn_sk` user-assigned-SK-edition ISBNs |
| `/pay/citation-author-icloudcelluwbwifimac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbwifimac` author iCloud cellular ultra-wideband Wi-Fi MAC identifiers |
| `/pay/citation-author-icloudcelluwbbtaddr` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbbtaddr` author iCloud cellular ultra-wideband Bluetooth-address identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.185.0` (`whois` … `citation-author-icloudcelluwbsn`). `/pay/citation-isbn-sf` remains Highwire citation_isbn_sf; `/pay/citation-eisbn-se` remains Highwire citation_eisbn_se; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbsn` remains Highwire citation_author_icloudcelluwbsn; `/pay/citation-author-icloudcellwifimac` remains Highwire citation_author_icloudcellwifimac. Do not use `/pay/eisbn-sf` (`/pay/citation-eisbn-sf`; `/pay/citation-isbn-sf` is print SF; `/pay/citation-eisbn-se` is eisbn SE; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-si` (`/pay/citation-isbn-si`; `/pay/citation-isbn-sf` is SF; `/pay/citation-isbn-se` is SE; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-si` (`/pay/citation-eisbn-si`; `/pay/citation-isbn-si` is print SI; `/pay/citation-eisbn-sf` is eisbn SF; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sk` (`/pay/citation-isbn-sk`; `/pay/citation-isbn-si` is SI; `/pay/citation-isbn-sf` is SF; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbwifimac` (`/pay/citation-author-icloudcelluwbwifimac`; `/pay/citation-author-icloudcelluwbsn` is celluwbsn; `/pay/citation-author-icloudcellwifimac` is cellwifimac; `/pay/citation-author-icloudcellnfcwifimac` is nfcwifimac; `/pay/citation-author-icloudwifimac` is icloudwifimac), or `/pay/author-icloudcelluwbbtaddr` (`/pay/citation-author-icloudcelluwbbtaddr`; `/pay/citation-author-icloudcelluwbwifimac` is celluwbwifimac; `/pay/citation-author-icloudcellbtaddr` is cellbtaddr; `/pay/citation-author-icloudcellnfcbtaddr` is nfcbtaddr; `/pay/citation-author-icloudbtaddr` is icloudbtaddr). Remaining Highwire tags include citation_eisbn_sk, citation_isbn_sl, citation_eisbn_sl, citation_isbn_sm, citation_author_icloudcelluwbwifiip, and citation_author_icloudcelluwbblemac. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), and `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 06:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1137 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-sf` and `/pay/citation-isbn-si` (and the other four 1.186.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.186.0 paths will index after rsync/restart and another register.
