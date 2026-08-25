# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.179.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rr` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rr` user-assigned-RR-edition electronic ISBNs |
| `/pay/citation-isbn-rs` | $0.002 | `url` | Highwire Press `name=citation_isbn_rs` user-assigned-RS-edition ISBNs |
| `/pay/citation-eisbn-rs` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rs` user-assigned-RS-edition electronic ISBNs |
| `/pay/citation-isbn-rt` | $0.002 | `url` | Highwire Press `name=citation_isbn_rt` user-assigned-RT-edition ISBNs |
| `/pay/citation-author-icloudcellnfcbleipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcbleipv6` author iCloud cellular NFC Bluetooth LE IPv6 identifiers |
| `/pay/citation-author-icloudcellnfcbtip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcbtip` author iCloud cellular NFC Bluetooth IP identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.178.0` (`whois` … `citation-author-icloudcellnfcwifiipv6`). `/pay/citation-isbn-rr` remains Highwire citation_isbn_rr; `/pay/citation-eisbn-rq` remains Highwire citation_eisbn_rq; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcellbleipv6` remains Highwire citation_author_icloudcellbleipv6; `/pay/citation-author-icloudcellbtip` remains Highwire citation_author_icloudcellbtip. Do not use `/pay/eisbn-rr` (`/pay/citation-eisbn-rr`; `/pay/citation-isbn-rr` is print RR; `/pay/citation-eisbn-rq` is eisbn RQ; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rs` (`/pay/citation-isbn-rs`; `/pay/citation-isbn-rr` is RR; `/pay/citation-isbn-rq` is RQ; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-rs` (`/pay/citation-eisbn-rs`; `/pay/citation-isbn-rs` is print RS; `/pay/citation-eisbn-rr` is eisbn RR; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rt` (`/pay/citation-isbn-rt`; `/pay/citation-isbn-rs` is RS; `/pay/citation-isbn-rr` is RR; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcbleipv6` (`/pay/citation-author-icloudcellnfcbleipv6`; `/pay/citation-author-icloudcellbleipv6` is cellbleipv6; `/pay/citation-author-icloudbleipv6` is icloudbleipv6; `/pay/citation-author-icloudcellnfcbleip` is nfcbleip), or `/pay/author-icloudcellnfcbtip` (`/pay/citation-author-icloudcellnfcbtip`; `/pay/citation-author-icloudcellbtip` is cellbtip; `/pay/citation-author-icloudbtip` is icloudbtip; `/pay/citation-author-icloudcellnfcip` is nfcip). Remaining Highwire tags include citation_eisbn_rt, citation_isbn_ru, citation_eisbn_ru, citation_isbn_rv, citation_author_icloudcellnfcbtipv6, and citation_author_icloudcelluwbip. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 23:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1095 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rr` and `/pay/citation-isbn-rs` (and the other four 1.179.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.179.0 paths will index after rsync/restart and another register.
