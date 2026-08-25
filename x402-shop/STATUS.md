# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.173.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rf` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rf` user-assigned-RF-edition electronic ISBNs |
| `/pay/citation-isbn-rg` | $0.002 | `url` | Highwire Press `name=citation_isbn_rg` user-assigned-RG-edition ISBNs |
| `/pay/citation-eisbn-rg` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rg` user-assigned-RG-edition electronic ISBNs |
| `/pay/citation-isbn-rh` | $0.002 | `url` | Highwire Press `name=citation_isbn_rh` user-assigned-RH-edition ISBNs |
| `/pay/citation-author-icloudcellnfcimsi` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcimsi` author iCloud cellular NFC IMSI identifiers |
| `/pay/citation-author-icloudcellnfciccid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfciccid` author iCloud cellular NFC ICCID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.172.0` (`whois` … `citation-author-icloudcellnfcimei`). `/pay/citation-isbn-rf` remains Highwire citation_isbn_rf; `/pay/citation-eisbn-rd` remains Highwire citation_eisbn_rd; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcellimsi` remains Highwire citation_author_icloudcellimsi; `/pay/citation-author-icloudcelliccid` remains Highwire citation_author_icloudcelliccid. Do not use `/pay/eisbn-rf` (`/pay/citation-eisbn-rf`; `/pay/citation-isbn-rf` is print RF; `/pay/citation-eisbn-rd` is eisbn RD; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rg` (`/pay/citation-isbn-rg`; `/pay/citation-isbn-rf` is RF; `/pay/citation-isbn-rd` is RD; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-rg` (`/pay/citation-eisbn-rg`; `/pay/citation-isbn-rg` is print RG; `/pay/citation-eisbn-rf` is eisbn RF; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rh` (`/pay/citation-isbn-rh`; `/pay/citation-isbn-rg` is RG; `/pay/citation-isbn-rf` is RF; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcimsi` (`/pay/citation-author-icloudcellnfcimsi`; `/pay/citation-author-icloudcellimsi` is cellimsi; `/pay/citation-author-icloudimsi` is icloudimsi; `/pay/citation-author-icloudcellnfcip` is nfcip), or `/pay/author-icloudcellnfciccid` (`/pay/citation-author-icloudcellnfciccid`; `/pay/citation-author-icloudcelliccid` is celliccid; `/pay/citation-author-icloudiccid` is icloudiccid; `/pay/citation-author-icloudcellnfcip` is nfcip). Remaining Highwire tags include citation_eisbn_rh, citation_isbn_ri, citation_eisbn_ri, citation_isbn_rj, citation_author_icloudcellnfcmsisdn, and citation_author_icloudcellnfceid. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 17:07 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1059 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rf` and `/pay/citation-isbn-rg` (and the other four 1.173.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.173.0 paths will index after rsync/restart and another register.
