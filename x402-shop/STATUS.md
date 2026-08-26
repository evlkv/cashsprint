# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.187.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sk` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sk` user-assigned-SK-edition electronic ISBNs |
| `/pay/citation-isbn-sl` | $0.002 | `url` | Highwire Press `name=citation_isbn_sl` user-assigned-SL-edition ISBNs |
| `/pay/citation-eisbn-sl` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sl` user-assigned-SL-edition electronic ISBNs |
| `/pay/citation-isbn-sm` | $0.002 | `url` | Highwire Press `name=citation_isbn_sm` user-assigned-SM-edition ISBNs |
| `/pay/citation-author-icloudcelluwbwifiip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbwifiip` author iCloud cellular ultra-wideband Wi-Fi IP identifiers |
| `/pay/citation-author-icloudcelluwbblemac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbblemac` author iCloud cellular ultra-wideband BLE MAC identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.186.0` (`whois` … `citation-author-icloudcelluwbbtaddr`). `/pay/citation-isbn-sk` remains Highwire citation_isbn_sk; `/pay/citation-eisbn-si` remains Highwire citation_eisbn_si; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbbtaddr` remains Highwire citation_author_icloudcelluwbbtaddr; `/pay/citation-author-icloudcellwifiip` remains Highwire citation_author_icloudcellwifiip. Do not use `/pay/eisbn-sk` (`/pay/citation-eisbn-sk`; `/pay/citation-isbn-sk` is print SK; `/pay/citation-eisbn-si` is eisbn SI; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sl` (`/pay/citation-isbn-sl`; `/pay/citation-isbn-sk` is SK; `/pay/citation-isbn-si` is SI; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-sl` (`/pay/citation-eisbn-sl`; `/pay/citation-isbn-sl` is print SL; `/pay/citation-eisbn-sk` is eisbn SK; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sm` (`/pay/citation-isbn-sm`; `/pay/citation-isbn-sl` is SL; `/pay/citation-isbn-sk` is SK; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbwifiip` (`/pay/citation-author-icloudcelluwbwifiip`; `/pay/citation-author-icloudcelluwbbtaddr` is celluwbbtaddr; `/pay/citation-author-icloudcellwifiip` is cellwifiip; `/pay/citation-author-icloudcellnfcwifiip` is nfcwifiip; `/pay/citation-author-icloudwifiip` is icloudwifiip), or `/pay/author-icloudcelluwbblemac` (`/pay/citation-author-icloudcelluwbblemac`; `/pay/citation-author-icloudcelluwbwifiip` is celluwbwifiip; `/pay/citation-author-icloudcellblemac` is cellblemac; `/pay/citation-author-icloudcellnfcblemac` is nfcblemac; `/pay/citation-author-icloudblemac` is icloudblemac). Remaining Highwire tags include citation_eisbn_sm, citation_isbn_sn, citation_eisbn_sn, citation_isbn_so, citation_author_icloudcelluwbbleip, and citation_author_icloudcelluwbwifiipv6. Skip `/pay/citation-isbn-sg` / `/pay/citation-eisbn-sg` (Singapore), `/pay/citation-isbn-sh` / `/pay/citation-eisbn-sh` (Saint Helena), `/pay/citation-isbn-sj` / `/pay/citation-eisbn-sj` (Svalbard), and `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 07:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1143 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-sk` and `/pay/citation-isbn-sl` (and the other four 1.187.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.187.0 paths will index after rsync/restart and another register.
