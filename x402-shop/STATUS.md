# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.193.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sz` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sz` user-assigned-SZ-edition electronic ISBNs |
| `/pay/citation-isbn-tb` | $0.002 | `url` | Highwire Press `name=citation_isbn_tb` user-assigned-TB-edition ISBNs |
| `/pay/citation-eisbn-tb` | $0.002 | `url` | Highwire Press `name=citation_eisbn_tb` user-assigned-TB-edition electronic ISBNs |
| `/pay/citation-isbn-td` | $0.002 | `url` | Highwire Press `name=citation_isbn_td` user-assigned-TD-edition ISBNs |
| `/pay/citation-author-icloudcelluwbnfcimsi` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfcimsi` author iCloud cellular ultra-wideband NFC IMSI identifiers |
| `/pay/citation-author-icloudcelluwbnfciccid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfciccid` author iCloud cellular ultra-wideband NFC ICCID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.192.0` (`whois` … `citation-author-icloudcelluwbnfcimei`). `/pay/citation-isbn-sz` remains Highwire citation_isbn_sz; `/pay/citation-eisbn-sy` remains Highwire citation_eisbn_sy; `/pay/citation-isbn-sw` remains Highwire citation_isbn_sw; `/pay/citation-author-icloudcelluwbnfcimei` remains Highwire citation_author_icloudcelluwbnfcimei; `/pay/citation-author-icloudcellnfcimsi` remains Highwire citation_author_icloudcellnfcimsi. Do not use `/pay/eisbn-sz` (`/pay/citation-eisbn-sz`; `/pay/citation-isbn-sz` is print SZ; `/pay/citation-eisbn-sy` is eisbn SY; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-tb` (`/pay/citation-isbn-tb`; `/pay/citation-isbn-sz` is SZ; `/pay/citation-isbn-sw` is SW; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-tb` (`/pay/citation-eisbn-tb`; `/pay/citation-isbn-tb` is print TB; `/pay/citation-eisbn-sz` is eisbn SZ; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-td` (`/pay/citation-isbn-td`; `/pay/citation-isbn-tb` is TB; `/pay/citation-isbn-sz` is SZ; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbnfcimsi` (`/pay/citation-author-icloudcelluwbnfcimsi`; `/pay/citation-author-icloudcellnfcimsi` is nfcimsi; `/pay/citation-author-icloudcelluwbimsi` is uwbimsi; `/pay/citation-author-icloudimsi` is icloudimsi), or `/pay/author-icloudcelluwbnfciccid` (`/pay/citation-author-icloudcelluwbnfciccid`; `/pay/citation-author-icloudcellnfciccid` is nfciccid; `/pay/citation-author-icloudcelluwbiccid` is uwbiccid; `/pay/citation-author-icloudiccid` is icloudiccid). Remaining Highwire tags include citation_eisbn_td, citation_isbn_te, citation_eisbn_te, citation_isbn_tg, citation_author_icloudcelluwbnfcmsisdn, and citation_author_icloudcelluwbnfceid. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0), `/pay/citation-isbn-su` / `/pay/citation-eisbn-su` (Soviet Union, 1.161.0), `/pay/citation-isbn-sv` / `/pay/citation-eisbn-sv` (El Salvador, 1.129.0), `/pay/citation-isbn-sx` / `/pay/citation-eisbn-sx` (Sint Maarten, 1.141.0), `/pay/citation-isbn-ta` / `/pay/citation-eisbn-ta` (Tristan da Cunha, 1.154.0), `/pay/citation-isbn-tc` / `/pay/citation-eisbn-tc` (Turks and Caicos, 1.140.0), and `/pay/citation-isbn-tf` / `/pay/citation-eisbn-tf` (French Southern Territories, 1.148.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 13:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1179 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-sz` and `/pay/citation-isbn-tb` (and the other four 1.193.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@`/`ubuntu@`/`evgeny@` are Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.193.0 paths will index after rsync/restart and another register.
