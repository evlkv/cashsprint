# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.194.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-td` | $0.002 | `url` | Highwire Press `name=citation_eisbn_td` user-assigned-TD-edition electronic ISBNs |
| `/pay/citation-isbn-te` | $0.002 | `url` | Highwire Press `name=citation_isbn_te` user-assigned-TE-edition ISBNs |
| `/pay/citation-eisbn-te` | $0.002 | `url` | Highwire Press `name=citation_eisbn_te` user-assigned-TE-edition electronic ISBNs |
| `/pay/citation-isbn-tg` | $0.002 | `url` | Highwire Press `name=citation_isbn_tg` user-assigned-TG-edition ISBNs |
| `/pay/citation-author-icloudcelluwbnfcmsisdn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfcmsisdn` author iCloud cellular ultra-wideband NFC MSISDN identifiers |
| `/pay/citation-author-icloudcelluwbnfceid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfceid` author iCloud cellular ultra-wideband NFC EID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.193.0` (`whois` … `citation-author-icloudcelluwbnfciccid`). `/pay/citation-isbn-td` remains Highwire citation_isbn_td; `/pay/citation-eisbn-tb` remains Highwire citation_eisbn_tb; `/pay/citation-isbn-sz` remains Highwire citation_isbn_sz; `/pay/citation-author-icloudcelluwbnfciccid` remains Highwire citation_author_icloudcelluwbnfciccid; `/pay/citation-author-icloudcellnfcmsisdn` remains Highwire citation_author_icloudcellnfcmsisdn. Do not use `/pay/eisbn-td` (`/pay/citation-eisbn-td`; `/pay/citation-isbn-td` is print TD; `/pay/citation-eisbn-tb` is eisbn TB; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-te` (`/pay/citation-isbn-te`; `/pay/citation-isbn-td` is TD; `/pay/citation-isbn-tb` is TB; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-te` (`/pay/citation-eisbn-te`; `/pay/citation-isbn-te` is print TE; `/pay/citation-eisbn-td` is eisbn TD; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-tg` (`/pay/citation-isbn-tg`; `/pay/citation-isbn-te` is TE; `/pay/citation-isbn-td` is TD; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbnfcmsisdn` (`/pay/citation-author-icloudcelluwbnfcmsisdn`; `/pay/citation-author-icloudcellnfcmsisdn` is nfcmsisdn; `/pay/citation-author-icloudcelluwbmsisdn` is uwbmsisdn; `/pay/citation-author-icloudmsisdn` is icloudmsisdn), or `/pay/author-icloudcelluwbnfceid` (`/pay/citation-author-icloudcelluwbnfceid`; `/pay/citation-author-icloudcellnfceid` is nfceid; `/pay/citation-author-icloudcelluwbeid` is uwbeid; `/pay/citation-author-icloudeid` is icloudeid). Remaining Highwire tags include citation_eisbn_tg, citation_isbn_tj, citation_eisbn_tj, citation_isbn_tk, citation_author_icloudcelluwbnfcuuid, and citation_author_icloudcelluwbnfcsn. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0), `/pay/citation-isbn-su` / `/pay/citation-eisbn-su` (Soviet Union, 1.161.0), `/pay/citation-isbn-sv` / `/pay/citation-eisbn-sv` (El Salvador, 1.129.0), `/pay/citation-isbn-sx` / `/pay/citation-eisbn-sx` (Sint Maarten, 1.141.0), `/pay/citation-isbn-ta` / `/pay/citation-eisbn-ta` (Tristan da Cunha, 1.154.0), `/pay/citation-isbn-tc` / `/pay/citation-eisbn-tc` (Turks and Caicos, 1.140.0), `/pay/citation-isbn-tf` / `/pay/citation-eisbn-tf` (French Southern Territories, 1.148.0), and `/pay/citation-isbn-th` / `/pay/citation-eisbn-th` (Thailand, 1.119.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 14:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1185 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-td` and `/pay/citation-isbn-te` (and the other four 1.194.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@`/`ubuntu@`/`evgeny@` are Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.194.0 paths will index after rsync/restart and another register.
