# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.191.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-ss` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ss` user-assigned-SS-edition electronic ISBNs |
| `/pay/citation-isbn-st` | $0.002 | `url` | Highwire Press `name=citation_isbn_st` user-assigned-ST-edition ISBNs |
| `/pay/citation-eisbn-st` | $0.002 | `url` | Highwire Press `name=citation_eisbn_st` user-assigned-ST-edition electronic ISBNs |
| `/pay/citation-isbn-sw` | $0.002 | `url` | Highwire Press `name=citation_isbn_sw` user-assigned-SW-edition ISBNs |
| `/pay/citation-author-icloudcelluwbnfcipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfcipv6` author iCloud cellular ultra-wideband NFC IPv6 identifiers |
| `/pay/citation-author-icloudcelluwbnfcmac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfcmac` author iCloud cellular ultra-wideband NFC MAC identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.190.0` (`whois` … `citation-author-icloudcelluwbnfcip`). `/pay/citation-isbn-ss` remains Highwire citation_isbn_ss; `/pay/citation-eisbn-sr` remains Highwire citation_eisbn_sr; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbnfcip` remains Highwire citation_author_icloudcelluwbnfcip; `/pay/citation-author-icloudcellnfcipv6` remains Highwire citation_author_icloudcellnfcipv6. Do not use `/pay/eisbn-ss` (`/pay/citation-eisbn-ss`; `/pay/citation-isbn-ss` is print SS; `/pay/citation-eisbn-sr` is eisbn SR; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-st` (`/pay/citation-isbn-st`; `/pay/citation-isbn-ss` is SS; `/pay/citation-isbn-sr` is SR; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-st` (`/pay/citation-eisbn-st`; `/pay/citation-isbn-st` is print ST; `/pay/citation-eisbn-ss` is eisbn SS; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sw` (`/pay/citation-isbn-sw`; `/pay/citation-isbn-st` is ST; `/pay/citation-isbn-ss` is SS; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbnfcipv6` (`/pay/citation-author-icloudcelluwbnfcipv6`; `/pay/citation-author-icloudcelluwbnfcip` is celluwbnfcip; `/pay/citation-author-icloudcellnfcipv6` is cellnfcipv6; `/pay/citation-author-icloudcelluwbipv6` is celluwbipv6; `/pay/citation-author-icloudcellnfcwifiipv6` is nfcwifiipv6), or `/pay/author-icloudcelluwbnfcmac` (`/pay/citation-author-icloudcelluwbnfcmac`; `/pay/citation-author-icloudcellnfcmac` is cellnfcmac; `/pay/citation-author-icloudcelluwbmac` is celluwbmac; `/pay/citation-author-icloudcellnfcwifimac` is nfcwifimac; `/pay/citation-author-icloudcelluwbwifimac` is uwbwifimac). Remaining Highwire tags include citation_eisbn_sw, citation_isbn_sy, citation_eisbn_sy, citation_isbn_sz, citation_author_icloudcelluwbnfcgw, and citation_author_icloudcelluwbnfcimei. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0), `/pay/citation-isbn-su` / `/pay/citation-eisbn-su` (Soviet Union, 1.161.0), `/pay/citation-isbn-sv` / `/pay/citation-eisbn-sv` (El Salvador, 1.129.0), and `/pay/citation-isbn-sx` / `/pay/citation-eisbn-sx` (Sint Maarten, 1.141.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 11:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1167 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-ss` and `/pay/citation-isbn-st` (and the other four 1.191.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@`/`ubuntu@`/`evgeny@` are Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.191.0 paths will index after rsync/restart and another register.
