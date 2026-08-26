# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.180.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rt` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rt` user-assigned-RT-edition electronic ISBNs |
| `/pay/citation-isbn-ru` | $0.002 | `url` | Highwire Press `name=citation_isbn_ru` user-assigned-RU-edition ISBNs |
| `/pay/citation-eisbn-ru` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ru` user-assigned-RU-edition electronic ISBNs |
| `/pay/citation-isbn-rv` | $0.002 | `url` | Highwire Press `name=citation_isbn_rv` user-assigned-RV-edition ISBNs |
| `/pay/citation-author-icloudcellnfcbtipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcbtipv6` author iCloud cellular NFC Bluetooth IPv6 identifiers |
| `/pay/citation-author-icloudcelluwbip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbip` author iCloud cellular ultra-wideband IP identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.179.0` (`whois` … `citation-author-icloudcellnfcbtip`). `/pay/citation-isbn-rt` remains Highwire citation_isbn_rt; `/pay/citation-eisbn-rs` remains Highwire citation_eisbn_rs; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcellbtipv6` remains Highwire citation_author_icloudcellbtipv6; `/pay/citation-author-icloudcellnfcbtip` remains Highwire citation_author_icloudcellnfcbtip. Do not use `/pay/eisbn-rt` (`/pay/citation-eisbn-rt`; `/pay/citation-isbn-rt` is print RT; `/pay/citation-eisbn-rs` is eisbn RS; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-ru` (`/pay/citation-isbn-ru`; `/pay/citation-isbn-rt` is RT; `/pay/citation-isbn-rs` is RS; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-ru` (`/pay/citation-eisbn-ru`; `/pay/citation-isbn-ru` is print RU; `/pay/citation-eisbn-rt` is eisbn RT; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rv` (`/pay/citation-isbn-rv`; `/pay/citation-isbn-ru` is RU; `/pay/citation-isbn-rt` is RT; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcbtipv6` (`/pay/citation-author-icloudcellnfcbtipv6`; `/pay/citation-author-icloudcellbtipv6` is cellbtipv6; `/pay/citation-author-icloudbtipv6` is icloudbtipv6; `/pay/citation-author-icloudcellnfcbtip` is nfcbtip), or `/pay/author-icloudcelluwbip` (`/pay/citation-author-icloudcelluwbip`; `/pay/citation-author-icloudcellnfcbtip` is nfcbtip; `/pay/citation-author-icloudcellip` is cellip; `/pay/citation-author-icloudcellwifiip` is cellwifiip). Remaining Highwire tags include citation_eisbn_rv, citation_isbn_rw, citation_eisbn_rw, citation_isbn_rx, citation_author_icloudcelluwbipv6, and citation_author_icloudcelluwbmac. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 00:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1101 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rt` and `/pay/citation-isbn-ru` (and the other four 1.180.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.180.0 paths will index after rsync/restart and another register.
