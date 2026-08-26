# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.189.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-so` | $0.002 | `url` | Highwire Press `name=citation_eisbn_so` user-assigned-SO-edition electronic ISBNs |
| `/pay/citation-isbn-sp` | $0.002 | `url` | Highwire Press `name=citation_isbn_sp` user-assigned-SP-edition ISBNs |
| `/pay/citation-eisbn-sp` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sp` user-assigned-SP-edition electronic ISBNs |
| `/pay/citation-isbn-sq` | $0.002 | `url` | Highwire Press `name=citation_isbn_sq` user-assigned-SQ-edition ISBNs |
| `/pay/citation-author-icloudcelluwbbleipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbbleipv6` author iCloud cellular ultra-wideband BLE IPv6 identifiers |
| `/pay/citation-author-icloudcelluwbbtip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbbtip` author iCloud cellular ultra-wideband Bluetooth IP identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.188.0` (`whois` … `citation-author-icloudcelluwbwifiipv6`). `/pay/citation-isbn-so` remains Highwire citation_isbn_so; `/pay/citation-eisbn-sn` remains Highwire citation_eisbn_sn; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbbleip` remains Highwire citation_author_icloudcelluwbbleip; `/pay/citation-author-icloudcellbleipv6` remains Highwire citation_author_icloudcellbleipv6. Do not use `/pay/eisbn-so` (`/pay/citation-eisbn-so`; `/pay/citation-isbn-so` is print SO; `/pay/citation-eisbn-sn` is eisbn SN; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sp` (`/pay/citation-isbn-sp`; `/pay/citation-isbn-so` is SO; `/pay/citation-isbn-sn` is SN; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-sp` (`/pay/citation-eisbn-sp`; `/pay/citation-isbn-sp` is print SP; `/pay/citation-eisbn-so` is eisbn SO; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sq` (`/pay/citation-isbn-sq`; `/pay/citation-isbn-sp` is SP; `/pay/citation-isbn-so` is SO; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbbleipv6` (`/pay/citation-author-icloudcelluwbbleipv6`; `/pay/citation-author-icloudcelluwbbleip` is celluwbbleip; `/pay/citation-author-icloudcellbleipv6` is cellbleipv6; `/pay/citation-author-icloudcellnfcbleipv6` is nfcbleipv6; `/pay/citation-author-icloudbleipv6` is icloudbleipv6), or `/pay/author-icloudcelluwbbtip` (`/pay/citation-author-icloudcelluwbbtip`; `/pay/citation-author-icloudcelluwbbtaddr` is celluwbbtaddr; `/pay/citation-author-icloudcellbtip` is cellbtip; `/pay/citation-author-icloudcellnfcbtip` is nfcbtip; `/pay/citation-author-icloudbtip` is icloudbtip). Remaining Highwire tags include citation_eisbn_sq, citation_isbn_sr, citation_eisbn_sr, citation_isbn_ss, citation_author_icloudcelluwbbtipv6, and citation_author_icloudcelluwbnfcip. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), and `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 09:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1155 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-so` and `/pay/citation-isbn-sp` (and the other four 1.189.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@`/`ubuntu@`/`evgeny@` are Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.189.0 paths will index after rsync/restart and another register.
