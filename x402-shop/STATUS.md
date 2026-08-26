# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.188.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sm` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sm` user-assigned-SM-edition electronic ISBNs |
| `/pay/citation-isbn-sn` | $0.002 | `url` | Highwire Press `name=citation_isbn_sn` user-assigned-SN-edition ISBNs |
| `/pay/citation-eisbn-sn` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sn` user-assigned-SN-edition electronic ISBNs |
| `/pay/citation-isbn-so` | $0.002 | `url` | Highwire Press `name=citation_isbn_so` user-assigned-SO-edition ISBNs |
| `/pay/citation-author-icloudcelluwbbleip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbbleip` author iCloud cellular ultra-wideband BLE IP identifiers |
| `/pay/citation-author-icloudcelluwbwifiipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbwifiipv6` author iCloud cellular ultra-wideband Wi-Fi IPv6 identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.187.0` (`whois` … `citation-author-icloudcelluwbblemac`). `/pay/citation-isbn-sm` remains Highwire citation_isbn_sm; `/pay/citation-eisbn-sl` remains Highwire citation_eisbn_sl; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbblemac` remains Highwire citation_author_icloudcelluwbblemac; `/pay/citation-author-icloudcellbleip` remains Highwire citation_author_icloudcellbleip. Do not use `/pay/eisbn-sm` (`/pay/citation-eisbn-sm`; `/pay/citation-isbn-sm` is print SM; `/pay/citation-eisbn-sl` is eisbn SL; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sn` (`/pay/citation-isbn-sn`; `/pay/citation-isbn-sm` is SM; `/pay/citation-isbn-sl` is SL; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-sn` (`/pay/citation-eisbn-sn`; `/pay/citation-isbn-sn` is print SN; `/pay/citation-eisbn-sm` is eisbn SM; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-so` (`/pay/citation-isbn-so`; `/pay/citation-isbn-sn` is SN; `/pay/citation-isbn-sm` is SM; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbbleip` (`/pay/citation-author-icloudcelluwbbleip`; `/pay/citation-author-icloudcelluwbblemac` is celluwbblemac; `/pay/citation-author-icloudcellbleip` is cellbleip; `/pay/citation-author-icloudcellnfcbleip` is nfcbleip; `/pay/citation-author-icloudbleip` is icloudbleip), or `/pay/author-icloudcelluwbwifiipv6` (`/pay/citation-author-icloudcelluwbwifiipv6`; `/pay/citation-author-icloudcelluwbwifiip` is celluwbwifiip; `/pay/citation-author-icloudcellwifiipv6` is cellwifiipv6; `/pay/citation-author-icloudcellnfcwifiipv6` is nfcwifiipv6; `/pay/citation-author-icloudwifiipv6` is icloudwifiipv6). Remaining Highwire tags include citation_eisbn_so, citation_isbn_sp, citation_eisbn_sp, citation_isbn_sq, citation_author_icloudcelluwbbleipv6, and citation_author_icloudcelluwbbtip. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), and `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 08:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1149 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-sm` and `/pay/citation-isbn-sn` (and the other four 1.188.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but deploy cannot run without a key. Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.188.0 paths will index after rsync/restart and another register.
