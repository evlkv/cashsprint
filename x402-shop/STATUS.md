# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.182.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rx` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rx` user-assigned-RX-edition electronic ISBNs |
| `/pay/citation-isbn-ry` | $0.002 | `url` | Highwire Press `name=citation_isbn_ry` user-assigned-RY-edition ISBNs |
| `/pay/citation-eisbn-ry` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ry` user-assigned-RY-edition electronic ISBNs |
| `/pay/citation-isbn-rz` | $0.002 | `url` | Highwire Press `name=citation_isbn_rz` user-assigned-RZ-edition ISBNs |
| `/pay/citation-author-icloudcelluwbgw` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbgw` author iCloud cellular ultra-wideband gateway identifiers |
| `/pay/citation-author-icloudcelluwbimei` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbimei` author iCloud cellular ultra-wideband IMEI identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.181.0` (`whois` … `citation-author-icloudcelluwbmac`). `/pay/citation-isbn-rx` remains Highwire citation_isbn_rx; `/pay/citation-eisbn-rw` remains Highwire citation_eisbn_rw; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbmac` remains Highwire citation_author_icloudcelluwbmac; `/pay/citation-author-icloudcellgw` remains Highwire citation_author_icloudcellgw. Do not use `/pay/eisbn-rx` (`/pay/citation-eisbn-rx`; `/pay/citation-isbn-rx` is print RX; `/pay/citation-eisbn-rw` is eisbn RW; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-ry` (`/pay/citation-isbn-ry`; `/pay/citation-isbn-rx` is RX; `/pay/citation-isbn-rw` is RW; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-ry` (`/pay/citation-eisbn-ry`; `/pay/citation-isbn-ry` is print RY; `/pay/citation-eisbn-rx` is eisbn RX; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rz` (`/pay/citation-isbn-rz`; `/pay/citation-isbn-ry` is RY; `/pay/citation-isbn-rx` is RX; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbgw` (`/pay/citation-author-icloudcelluwbgw`; `/pay/citation-author-icloudcelluwbip` is celluwbip; `/pay/citation-author-icloudcellnfcgw` is nfcgw; `/pay/citation-author-icloudcellgw` is cellgw), or `/pay/author-icloudcelluwbimei` (`/pay/citation-author-icloudcelluwbimei`; `/pay/citation-author-icloudcelluwbmac` is celluwbmac; `/pay/citation-author-icloudcellimei` is cellimei; `/pay/citation-author-icloudcellnfcimei` is nfcimei; `/pay/citation-author-icloudimei` is icloudimei). Remaining Highwire tags include citation_eisbn_rz, citation_isbn_sa, citation_eisbn_sa, citation_isbn_sb, citation_author_icloudcelluwbimsi, and citation_author_icloudcelluwbiccid. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 02:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1113 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rx` and `/pay/citation-isbn-ry` (and the other four 1.182.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.182.0 paths will index after rsync/restart and another register.
