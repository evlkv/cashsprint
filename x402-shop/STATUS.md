# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.175.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rj` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rj` user-assigned-RJ-edition electronic ISBNs |
| `/pay/citation-isbn-rk` | $0.002 | `url` | Highwire Press `name=citation_isbn_rk` user-assigned-RK-edition ISBNs |
| `/pay/citation-eisbn-rk` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rk` user-assigned-RK-edition electronic ISBNs |
| `/pay/citation-isbn-rl` | $0.002 | `url` | Highwire Press `name=citation_isbn_rl` user-assigned-RL-edition ISBNs |
| `/pay/citation-author-icloudcellnfcuuid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcuuid` author iCloud cellular NFC UUID identifiers |
| `/pay/citation-author-icloudcellnfcsn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcsn` author iCloud cellular NFC serial-number identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.174.0` (`whois` … `citation-author-icloudcellnfceid`). `/pay/citation-isbn-rj` remains Highwire citation_isbn_rj; `/pay/citation-eisbn-ri` remains Highwire citation_eisbn_ri; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluuid` remains Highwire citation_author_icloudcelluuid; `/pay/citation-author-icloudcellsn` remains Highwire citation_author_icloudcellsn. Do not use `/pay/eisbn-rj` (`/pay/citation-eisbn-rj`; `/pay/citation-isbn-rj` is print RJ; `/pay/citation-eisbn-ri` is eisbn RI; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rk` (`/pay/citation-isbn-rk`; `/pay/citation-isbn-rj` is RJ; `/pay/citation-isbn-ri` is RI; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-rk` (`/pay/citation-eisbn-rk`; `/pay/citation-isbn-rk` is print RK; `/pay/citation-eisbn-rj` is eisbn RJ; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rl` (`/pay/citation-isbn-rl`; `/pay/citation-isbn-rk` is RK; `/pay/citation-isbn-rj` is RJ; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcuuid` (`/pay/citation-author-icloudcellnfcuuid`; `/pay/citation-author-icloudcelluuid` is celluuid; `/pay/citation-author-iclouduuid` is iclouduuid; `/pay/citation-author-icloudcellnfcip` is nfcip), or `/pay/author-icloudcellnfcsn` (`/pay/citation-author-icloudcellnfcsn`; `/pay/citation-author-icloudcellsn` is cellsn; `/pay/citation-author-icloudesn` is icloudsn; `/pay/citation-author-icloudcellnfcip` is nfcip). Remaining Highwire tags include citation_eisbn_rl, citation_isbn_rm, citation_eisbn_rm, citation_isbn_rn, citation_author_icloudcellnfcwifimac, and citation_author_icloudcellnfcbtaddr. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 19:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1071 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rj` and `/pay/citation-isbn-rk` (and the other four 1.175.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.175.0 paths will index after rsync/restart and another register.
