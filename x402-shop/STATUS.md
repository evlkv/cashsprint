# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.172.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rc` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rc` user-assigned-RC-edition electronic ISBNs |
| `/pay/citation-isbn-rd` | $0.002 | `url` | Highwire Press `name=citation_isbn_rd` user-assigned-RD-edition ISBNs |
| `/pay/citation-eisbn-rd` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rd` user-assigned-RD-edition electronic ISBNs |
| `/pay/citation-isbn-rf` | $0.002 | `url` | Highwire Press `name=citation_isbn_rf` user-assigned-RF-edition ISBNs |
| `/pay/citation-author-icloudcellnfcgw` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcgw` author iCloud cellular NFC gateway identifiers |
| `/pay/citation-author-icloudcellnfcimei` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcimei` author iCloud cellular NFC IMEI identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.171.0` (`whois` … `citation-author-icloudcellnfcmac`). `/pay/citation-isbn-rc` remains Highwire citation_isbn_rc; `/pay/citation-eisbn-rb` remains Highwire citation_eisbn_rb; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcellgw` remains Highwire citation_author_icloudcellgw; `/pay/citation-author-icloudcellimei` remains Highwire citation_author_icloudcellimei. Do not use `/pay/eisbn-rc` (`/pay/citation-eisbn-rc`; `/pay/citation-isbn-rc` is print RC; `/pay/citation-eisbn-rb` is eisbn RB; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rd` (`/pay/citation-isbn-rd`; `/pay/citation-isbn-rc` is RC; `/pay/citation-isbn-rb` is RB; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-rd` (`/pay/citation-eisbn-rd`; `/pay/citation-isbn-rd` is print RD; `/pay/citation-eisbn-rc` is eisbn RC; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rf` (`/pay/citation-isbn-rf`; `/pay/citation-isbn-rd` is RD; `/pay/citation-isbn-re` is Reunion RE; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcgw` (`/pay/citation-author-icloudcellnfcgw`; `/pay/citation-author-icloudcellgw` is cellgw; `/pay/citation-author-icloudcellnfcip` is nfcip; `/pay/citation-author-icloudcellnfcipv6` is nfcipv6), or `/pay/author-icloudcellnfcimei` (`/pay/citation-author-icloudcellnfcimei`; `/pay/citation-author-icloudcellimei` is cellimei; `/pay/citation-author-icloudimei` is icloudimei; `/pay/citation-author-icloudcellnfcip` is nfcip). Remaining Highwire tags include citation_eisbn_rf, citation_isbn_rg, citation_eisbn_rg, citation_isbn_rh, citation_author_icloudcellnfcimsi, and citation_author_icloudcellnfciccid. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 16:07 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1053 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rc` and `/pay/citation-isbn-rd` (and the other four 1.172.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.172.0 paths will index after rsync/restart and another register.
