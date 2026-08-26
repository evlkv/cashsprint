# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.181.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rv` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rv` user-assigned-RV-edition electronic ISBNs |
| `/pay/citation-isbn-rw` | $0.002 | `url` | Highwire Press `name=citation_isbn_rw` user-assigned-RW-edition ISBNs |
| `/pay/citation-eisbn-rw` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rw` user-assigned-RW-edition electronic ISBNs |
| `/pay/citation-isbn-rx` | $0.002 | `url` | Highwire Press `name=citation_isbn_rx` user-assigned-RX-edition ISBNs |
| `/pay/citation-author-icloudcelluwbipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbipv6` author iCloud cellular ultra-wideband IPv6 identifiers |
| `/pay/citation-author-icloudcelluwbmac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbmac` author iCloud cellular ultra-wideband MAC identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.180.0` (`whois` … `citation-author-icloudcelluwbip`). `/pay/citation-isbn-rv` remains Highwire citation_isbn_rv; `/pay/citation-eisbn-ru` remains Highwire citation_eisbn_ru; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbip` remains Highwire citation_author_icloudcelluwbip; `/pay/citation-author-icloudcellnfcbtipv6` remains Highwire citation_author_icloudcellnfcbtipv6. Do not use `/pay/eisbn-rv` (`/pay/citation-eisbn-rv`; `/pay/citation-isbn-rv` is print RV; `/pay/citation-eisbn-ru` is eisbn RU; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rw` (`/pay/citation-isbn-rw`; `/pay/citation-isbn-rv` is RV; `/pay/citation-isbn-ru` is RU; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-rw` (`/pay/citation-eisbn-rw`; `/pay/citation-isbn-rw` is print RW; `/pay/citation-eisbn-rv` is eisbn RV; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rx` (`/pay/citation-isbn-rx`; `/pay/citation-isbn-rw` is RW; `/pay/citation-isbn-rv` is RV; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbipv6` (`/pay/citation-author-icloudcelluwbipv6`; `/pay/citation-author-icloudcelluwbip` is celluwbip; `/pay/citation-author-icloudcellnfcbtipv6` is nfcbtipv6; `/pay/citation-author-icloudcellbtipv6` is cellbtipv6), or `/pay/author-icloudcelluwbmac` (`/pay/citation-author-icloudcelluwbmac`; `/pay/citation-author-icloudcellmac` is cellmac; `/pay/citation-author-icloudcellnfcmac` is nfcmac; `/pay/citation-author-icloudcellwifimac` is cellwifimac). Remaining Highwire tags include citation_eisbn_rx, citation_isbn_ry, citation_eisbn_ry, citation_isbn_rz, citation_author_icloudcelluwbgw, and citation_author_icloudcelluwbimei. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 01:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1107 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rv` and `/pay/citation-isbn-rw` (and the other four 1.181.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.181.0 paths will index after rsync/restart and another register.
