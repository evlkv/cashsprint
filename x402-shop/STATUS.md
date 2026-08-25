# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.176.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rl` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rl` user-assigned-RL-edition electronic ISBNs |
| `/pay/citation-isbn-rm` | $0.002 | `url` | Highwire Press `name=citation_isbn_rm` user-assigned-RM-edition ISBNs |
| `/pay/citation-eisbn-rm` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rm` user-assigned-RM-edition electronic ISBNs |
| `/pay/citation-isbn-rn` | $0.002 | `url` | Highwire Press `name=citation_isbn_rn` user-assigned-RN-edition ISBNs |
| `/pay/citation-author-icloudcellnfcwifimac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcwifimac` author iCloud cellular NFC Wi-Fi MAC identifiers |
| `/pay/citation-author-icloudcellnfcbtaddr` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcbtaddr` author iCloud cellular NFC Bluetooth-address identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.175.0` (`whois` … `citation-author-icloudcellnfcsn`). `/pay/citation-isbn-rl` remains Highwire citation_isbn_rl; `/pay/citation-eisbn-rk` remains Highwire citation_eisbn_rk; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcellwifimac` remains Highwire citation_author_icloudcellwifimac; `/pay/citation-author-icloudcellbtaddr` remains Highwire citation_author_icloudcellbtaddr. Do not use `/pay/eisbn-rl` (`/pay/citation-eisbn-rl`; `/pay/citation-isbn-rl` is print RL; `/pay/citation-eisbn-rk` is eisbn RK; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rm` (`/pay/citation-isbn-rm`; `/pay/citation-isbn-rl` is RL; `/pay/citation-isbn-rk` is RK; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-rm` (`/pay/citation-eisbn-rm`; `/pay/citation-isbn-rm` is print RM; `/pay/citation-eisbn-rl` is eisbn RL; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rn` (`/pay/citation-isbn-rn`; `/pay/citation-isbn-rm` is RM; `/pay/citation-isbn-rl` is RL; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcwifimac` (`/pay/citation-author-icloudcellnfcwifimac`; `/pay/citation-author-icloudcellwifimac` is cellwifimac; `/pay/citation-author-icloudwifimac` is icloudwifimac; `/pay/citation-author-icloudcellnfcip` is nfcip), or `/pay/author-icloudcellnfcbtaddr` (`/pay/citation-author-icloudcellnfcbtaddr`; `/pay/citation-author-icloudcellbtaddr` is cellbtaddr; `/pay/citation-author-icloudbtaddr` is icloudbtaddr; `/pay/citation-author-icloudcellnfcip` is nfcip). Remaining Highwire tags include citation_eisbn_rn, citation_isbn_ro, citation_eisbn_ro, citation_isbn_rp, citation_author_icloudcellnfcwifiip, and citation_author_icloudcellnfcblemac. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 20:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1077 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rl` and `/pay/citation-isbn-rm` (and the other four 1.176.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.176.0 paths will index after rsync/restart and another register.
