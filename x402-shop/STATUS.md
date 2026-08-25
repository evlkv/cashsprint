# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.178.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rp` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rp` user-assigned-RP-edition electronic ISBNs |
| `/pay/citation-isbn-rq` | $0.002 | `url` | Highwire Press `name=citation_isbn_rq` user-assigned-RQ-edition ISBNs |
| `/pay/citation-eisbn-rq` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rq` user-assigned-RQ-edition electronic ISBNs |
| `/pay/citation-isbn-rr` | $0.002 | `url` | Highwire Press `name=citation_isbn_rr` user-assigned-RR-edition ISBNs |
| `/pay/citation-author-icloudcellnfcbleip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcbleip` author iCloud cellular NFC Bluetooth LE IP identifiers |
| `/pay/citation-author-icloudcellnfcwifiipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcwifiipv6` author iCloud cellular NFC Wi-Fi IPv6 identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.177.0` (`whois` … `citation-author-icloudcellnfcblemac`). `/pay/citation-isbn-rp` remains Highwire citation_isbn_rp; `/pay/citation-eisbn-ro` remains Highwire citation_eisbn_ro; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcellbleip` remains Highwire citation_author_icloudcellbleip; `/pay/citation-author-icloudcellwifiipv6` remains Highwire citation_author_icloudcellwifiipv6. Do not use `/pay/eisbn-rp` (`/pay/citation-eisbn-rp`; `/pay/citation-isbn-rp` is print RP; `/pay/citation-eisbn-ro` is eisbn RO; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rq` (`/pay/citation-isbn-rq`; `/pay/citation-isbn-rp` is RP; `/pay/citation-isbn-ro` is RO; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-rq` (`/pay/citation-eisbn-rq`; `/pay/citation-isbn-rq` is print RQ; `/pay/citation-eisbn-rp` is eisbn RP; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rr` (`/pay/citation-isbn-rr`; `/pay/citation-isbn-rq` is RQ; `/pay/citation-isbn-rp` is RP; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcbleip` (`/pay/citation-author-icloudcellnfcbleip`; `/pay/citation-author-icloudcellbleip` is cellbleip; `/pay/citation-author-icloudbleip` is icloudbleip; `/pay/citation-author-icloudcellnfcip` is nfcip), or `/pay/author-icloudcellnfcwifiipv6` (`/pay/citation-author-icloudcellnfcwifiipv6`; `/pay/citation-author-icloudcellwifiipv6` is cellwifiipv6; `/pay/citation-author-icloudwifiipv6` is icloudwifiipv6; `/pay/citation-author-icloudcellnfcip` is nfcip). Remaining Highwire tags include citation_eisbn_rr, citation_isbn_rs, citation_eisbn_rs, citation_isbn_rt, citation_author_icloudcellnfcbleipv6, and citation_author_icloudcellnfcbtip. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 22:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1089 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rp` and `/pay/citation-isbn-rq` (and the other four 1.178.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.178.0 paths will index after rsync/restart and another register.
