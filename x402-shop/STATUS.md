# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.190.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sq` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sq` user-assigned-SQ-edition electronic ISBNs |
| `/pay/citation-isbn-sr` | $0.002 | `url` | Highwire Press `name=citation_isbn_sr` user-assigned-SR-edition ISBNs |
| `/pay/citation-eisbn-sr` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sr` user-assigned-SR-edition electronic ISBNs |
| `/pay/citation-isbn-ss` | $0.002 | `url` | Highwire Press `name=citation_isbn_ss` user-assigned-SS-edition ISBNs |
| `/pay/citation-author-icloudcelluwbbtipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbbtipv6` author iCloud cellular ultra-wideband Bluetooth IPv6 identifiers |
| `/pay/citation-author-icloudcelluwbnfcip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbnfcip` author iCloud cellular ultra-wideband NFC IP identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.189.0` (`whois` … `citation-author-icloudcelluwbbtip`). `/pay/citation-isbn-sq` remains Highwire citation_isbn_sq; `/pay/citation-eisbn-sp` remains Highwire citation_eisbn_sp; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbbtip` remains Highwire citation_author_icloudcelluwbbtip; `/pay/citation-author-icloudcellbtipv6` remains Highwire citation_author_icloudcellbtipv6. Do not use `/pay/eisbn-sq` (`/pay/citation-eisbn-sq`; `/pay/citation-isbn-sq` is print SQ; `/pay/citation-eisbn-sp` is eisbn SP; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sr` (`/pay/citation-isbn-sr`; `/pay/citation-isbn-sq` is SQ; `/pay/citation-isbn-sp` is SP; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-sr` (`/pay/citation-eisbn-sr`; `/pay/citation-isbn-sr` is print SR; `/pay/citation-eisbn-sq` is eisbn SQ; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-ss` (`/pay/citation-isbn-ss`; `/pay/citation-isbn-sr` is SR; `/pay/citation-isbn-sq` is SQ; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbbtipv6` (`/pay/citation-author-icloudcelluwbbtipv6`; `/pay/citation-author-icloudcelluwbbtip` is celluwbbtip; `/pay/citation-author-icloudcellbtipv6` is cellbtipv6; `/pay/citation-author-icloudcellnfcbtipv6` is nfcbtipv6; `/pay/citation-author-icloudbtipv6` is icloudbtipv6), or `/pay/author-icloudcelluwbnfcip` (`/pay/citation-author-icloudcelluwbnfcip`; `/pay/citation-author-icloudcellnfcip` is cellnfcip; `/pay/citation-author-icloudcelluwbip` is celluwbip; `/pay/citation-author-icloudcellnfcwifiip` is nfcwifiip; `/pay/citation-author-icloudcelluwbwifiip` is uwbwifiip). Remaining Highwire tags include citation_eisbn_ss, citation_isbn_st, citation_eisbn_st, citation_isbn_sw, citation_author_icloudcelluwbnfcipv6, and citation_author_icloudcelluwbnfcmac. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0), `/pay/citation-isbn-su` / `/pay/citation-eisbn-su` (Soviet Union, 1.161.0), `/pay/citation-isbn-sv` / `/pay/citation-eisbn-sv` (El Salvador, 1.129.0), and `/pay/citation-isbn-sx` / `/pay/citation-eisbn-sx` (Sint Maarten, 1.141.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 10:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1161 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-sq` and `/pay/citation-isbn-sr` (and the other four 1.190.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@`/`ubuntu@`/`evgeny@` are Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.190.0 paths will index after rsync/restart and another register.
