# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.171.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-ra` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ra` user-assigned-RA-edition electronic ISBNs |
| `/pay/citation-isbn-rb` | $0.002 | `url` | Highwire Press `name=citation_isbn_rb` user-assigned-RB-edition ISBNs |
| `/pay/citation-eisbn-rb` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rb` user-assigned-RB-edition electronic ISBNs |
| `/pay/citation-isbn-rc` | $0.002 | `url` | Highwire Press `name=citation_isbn_rc` user-assigned-RC-edition ISBNs |
| `/pay/citation-author-icloudcellnfcipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcipv6` author iCloud cellular NFC IPv6 identifiers |
| `/pay/citation-author-icloudcellnfcmac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcmac` author iCloud cellular NFC MAC identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.170.0` (`whois` … `citation-author-icloudcellnfcip`). `/pay/citation-isbn-ra` remains Highwire citation_isbn_ra; `/pay/citation-eisbn-qz` remains Highwire citation_eisbn_qz; `/pay/citation-author-icloudcellipv6` remains Highwire citation_author_icloudcellipv6; `/pay/citation-author-icloudcellnfcip` remains Highwire citation_author_icloudcellnfcip. Do not use `/pay/eisbn-ra` (`/pay/citation-eisbn-ra`; `/pay/citation-isbn-ra` is print RA; `/pay/citation-eisbn-qz` is eisbn QZ; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rb` (`/pay/citation-isbn-rb`; `/pay/citation-isbn-ra` is RA; `/pay/citation-isbn-qz` is QZ; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-rb` (`/pay/citation-eisbn-rb`; `/pay/citation-isbn-rb` is print RB; `/pay/citation-eisbn-ra` is eisbn RA; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rc` (`/pay/citation-isbn-rc`; `/pay/citation-isbn-rb` is RB; `/pay/citation-isbn-ra` is RA; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcipv6` (`/pay/citation-author-icloudcellnfcipv6`; `/pay/citation-author-icloudcellipv6` is icloudcellipv6; `/pay/citation-author-icloudcellnfcip` is nfcip; `/pay/citation-author-icloudcellwifiipv6` is wifiipv6), or `/pay/author-icloudcellnfcmac` (`/pay/citation-author-icloudcellnfcmac`; `/pay/citation-author-icloudcellmac` is cellmac; `/pay/citation-author-icloudcellnfcip` is nfcip; `/pay/citation-author-icloudcellwifimac` is wifimac). Remaining Highwire tags include citation_eisbn_rc, citation_isbn_rd, citation_eisbn_rd, citation_isbn_re, citation_author_icloudcellnfcgw, and citation_author_icloudcellnfcimei. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 15:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1047 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-ra` and `/pay/citation-isbn-rb` (and the other four 1.171.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.171.0 paths will index after rsync/restart and another register.
