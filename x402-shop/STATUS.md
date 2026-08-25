# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.177.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rn` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rn` user-assigned-RN-edition electronic ISBNs |
| `/pay/citation-isbn-ro` | $0.002 | `url` | Highwire Press `name=citation_isbn_ro` user-assigned-RO-edition ISBNs |
| `/pay/citation-eisbn-ro` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ro` user-assigned-RO-edition electronic ISBNs |
| `/pay/citation-isbn-rp` | $0.002 | `url` | Highwire Press `name=citation_isbn_rp` user-assigned-RP-edition ISBNs |
| `/pay/citation-author-icloudcellnfcwifiip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcwifiip` author iCloud cellular NFC Wi-Fi IP identifiers |
| `/pay/citation-author-icloudcellnfcblemac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcblemac` author iCloud cellular NFC Bluetooth LE MAC identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.176.0` (`whois` … `citation-author-icloudcellnfcbtaddr`). `/pay/citation-isbn-rn` remains Highwire citation_isbn_rn; `/pay/citation-eisbn-rm` remains Highwire citation_eisbn_rm; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcellwifiip` remains Highwire citation_author_icloudcellwifiip; `/pay/citation-author-icloudcellblemac` remains Highwire citation_author_icloudcellblemac. Do not use `/pay/eisbn-rn` (`/pay/citation-eisbn-rn`; `/pay/citation-isbn-rn` is print RN; `/pay/citation-eisbn-rm` is eisbn RM; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-ro` (`/pay/citation-isbn-ro`; `/pay/citation-isbn-rn` is RN; `/pay/citation-isbn-rm` is RM; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-ro` (`/pay/citation-eisbn-ro`; `/pay/citation-isbn-ro` is print RO; `/pay/citation-eisbn-rn` is eisbn RN; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rp` (`/pay/citation-isbn-rp`; `/pay/citation-isbn-ro` is RO; `/pay/citation-isbn-rn` is RN; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcwifiip` (`/pay/citation-author-icloudcellnfcwifiip`; `/pay/citation-author-icloudcellwifiip` is cellwifiip; `/pay/citation-author-icloudwifiip` is icloudwifiip; `/pay/citation-author-icloudcellnfcip` is nfcip), or `/pay/author-icloudcellnfcblemac` (`/pay/citation-author-icloudcellnfcblemac`; `/pay/citation-author-icloudcellblemac` is cellblemac; `/pay/citation-author-icloudblemac` is icloudblemac; `/pay/citation-author-icloudcellnfcip` is nfcip). Remaining Highwire tags include citation_eisbn_rp, citation_isbn_rq, citation_eisbn_rq, citation_isbn_rr, citation_author_icloudcellnfcbleip, and citation_author_icloudcellnfcwifiipv6. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 21:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1083 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rn` and `/pay/citation-isbn-ro` (and the other four 1.177.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.177.0 paths will index after rsync/restart and another register.
