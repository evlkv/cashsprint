# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.192.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sw` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sw` user-assigned-SW-edition electronic ISBNs |
| `/pay/citation-isbn-sy` | $0.002 | `url` | Highwire Press `name=citation_isbn_sy` user-assigned-SY-edition ISBNs |
| `/pay/citation-eisbn-sy` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sy` user-assigned-SY-edition electronic ISBNs |
| `/pay/citation-isbn-sz` | $0.002 | `url` | Highwire Press `name=citation_isbn_sz` user-assigned-SZ-edition ISBNs |
| `/pay/citation-author-icloudcelluwbnfcgw` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfcgw` author iCloud cellular ultra-wideband NFC gateway identifiers |
| `/pay/citation-author-icloudcelluwbnfcimei` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfcimei` author iCloud cellular ultra-wideband NFC IMEI identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.191.0` (`whois` … `citation-author-icloudcelluwbnfcmac`). `/pay/citation-isbn-sw` remains Highwire citation_isbn_sw; `/pay/citation-eisbn-st` remains Highwire citation_eisbn_st; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbnfcmac` remains Highwire citation_author_icloudcelluwbnfcmac; `/pay/citation-author-icloudcellnfcgw` remains Highwire citation_author_icloudcellnfcgw. Do not use `/pay/eisbn-sw` (`/pay/citation-eisbn-sw`; `/pay/citation-isbn-sw` is print SW; `/pay/citation-eisbn-st` is eisbn ST; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sy` (`/pay/citation-isbn-sy`; `/pay/citation-isbn-sw` is SW; `/pay/citation-isbn-st` is ST; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-sy` (`/pay/citation-eisbn-sy`; `/pay/citation-isbn-sy` is print SY; `/pay/citation-eisbn-sw` is eisbn SW; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sz` (`/pay/citation-isbn-sz`; `/pay/citation-isbn-sy` is SY; `/pay/citation-isbn-sw` is SW; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbnfcgw` (`/pay/citation-author-icloudcelluwbnfcgw`; `/pay/citation-author-icloudcellnfcgw` is nfcgw; `/pay/citation-author-icloudcelluwbgw` is uwbgw; `/pay/citation-author-icloudcellgw` is cellgw), or `/pay/author-icloudcelluwbnfcimei` (`/pay/citation-author-icloudcelluwbnfcimei`; `/pay/citation-author-icloudcellnfcimei` is nfcimei; `/pay/citation-author-icloudcelluwbimei` is uwbimei; `/pay/citation-author-icloudimei` is icloudimei). Remaining Highwire tags include citation_eisbn_sz, citation_isbn_tb, citation_eisbn_tb, citation_isbn_td, citation_author_icloudcelluwbnfcimsi, and citation_author_icloudcelluwbnfciccid. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0), `/pay/citation-isbn-su` / `/pay/citation-eisbn-su` (Soviet Union, 1.161.0), `/pay/citation-isbn-sv` / `/pay/citation-eisbn-sv` (El Salvador, 1.129.0), `/pay/citation-isbn-sx` / `/pay/citation-eisbn-sx` (Sint Maarten, 1.141.0), and `/pay/citation-isbn-ta` / `/pay/citation-eisbn-ta` (Tristan da Cunha, 1.154.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 12:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1173 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-sw` and `/pay/citation-isbn-sy` (and the other four 1.192.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@`/`ubuntu@`/`evgeny@` are Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.192.0 paths will index after rsync/restart and another register.
