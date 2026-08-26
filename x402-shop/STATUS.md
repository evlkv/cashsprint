# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.185.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sd` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sd` user-assigned-SD-edition electronic ISBNs |
| `/pay/citation-isbn-se` | $0.002 | `url` | Highwire Press `name=citation_isbn_se` user-assigned-SE-edition ISBNs |
| `/pay/citation-eisbn-se` | $0.002 | `url` | Highwire Press `name=citation_eisbn_se` user-assigned-SE-edition electronic ISBNs |
| `/pay/citation-isbn-sf` | $0.002 | `url` | Highwire Press `name=citation_isbn_sf` user-assigned-SF-edition ISBNs |
| `/pay/citation-author-icloudcelluwbuuid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbuuid` author iCloud cellular ultra-wideband UUID identifiers |
| `/pay/citation-author-icloudcelluwbsn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbsn` author iCloud cellular ultra-wideband serial-number identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.184.0` (`whois` … `citation-author-icloudcelluwbeid`). `/pay/citation-isbn-sd` remains Highwire citation_isbn_sd; `/pay/citation-eisbn-sc` remains Highwire citation_eisbn_sc; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbeid` remains Highwire citation_author_icloudcelluwbeid; `/pay/citation-author-icloudcelluuid` remains Highwire citation_author_icloudcelluuid. Do not use `/pay/eisbn-sd` (`/pay/citation-eisbn-sd`; `/pay/citation-isbn-sd` is print SD; `/pay/citation-eisbn-sc` is eisbn SC; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-se` (`/pay/citation-isbn-se`; `/pay/citation-isbn-sd` is SD; `/pay/citation-isbn-sc` is SC; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-se` (`/pay/citation-eisbn-se`; `/pay/citation-isbn-se` is print SE; `/pay/citation-eisbn-sd` is eisbn SD; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sf` (`/pay/citation-isbn-sf`; `/pay/citation-isbn-se` is SE; `/pay/citation-isbn-sd` is SD; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbuuid` (`/pay/citation-author-icloudcelluwbuuid`; `/pay/citation-author-icloudcelluwbeid` is celluwbeid; `/pay/citation-author-icloudcelluuid` is celluuid; `/pay/citation-author-icloudcellnfcuuid` is nfcuuid; `/pay/citation-author-iclouduuid` is iclouduuid), or `/pay/author-icloudcelluwbsn` (`/pay/citation-author-icloudcelluwbsn`; `/pay/citation-author-icloudcelluwbuuid` is celluwbuuid; `/pay/citation-author-icloudcellsn` is cellsn; `/pay/citation-author-icloudcellnfcsn` is nfcsn; `/pay/citation-author-icloudesn` is icloudesn). Remaining Highwire tags include citation_eisbn_sf, citation_isbn_si, citation_eisbn_si, citation_isbn_sk, citation_author_icloudcelluwbwifimac, and citation_author_icloudcelluwbbtaddr. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), and `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 05:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1131 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-sd` and `/pay/citation-isbn-se` (and the other four 1.185.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.185.0 paths will index after rsync/restart and another register.
