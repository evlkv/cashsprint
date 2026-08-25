# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.169.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-qw` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qw` user-assigned-QW-edition electronic ISBNs |
| `/pay/citation-isbn-qx` | $0.002 | `url` | Highwire Press `name=citation_isbn_qx` user-assigned-QX-edition ISBNs |
| `/pay/citation-eisbn-qx` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qx` user-assigned-QX-edition electronic ISBNs |
| `/pay/citation-isbn-qy` | $0.002 | `url` | Highwire Press `name=citation_isbn_qy` user-assigned-QY-edition ISBNs |
| `/pay/citation-author-icloudcellbleipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellbleipv6` author iCloud cellular BLE IPv6 identifiers |
| `/pay/citation-author-icloudcellbtip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellbtip` author iCloud cellular Bluetooth IP identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.168.0` (`whois` … `citation-author-icloudcellwifiipv6`). `/pay/citation-isbn-qw` remains Highwire citation_isbn_qw; `/pay/citation-eisbn-qv` remains Highwire citation_eisbn_qv; `/pay/citation-author-icloudbleipv6` remains Highwire citation_author_icloudbleipv6; `/pay/citation-author-icloudbtip` remains Highwire citation_author_icloudbtip. Do not use `/pay/eisbn-qw` (`/pay/citation-eisbn-qw`; `/pay/citation-isbn-qw` is print QW; `/pay/citation-eisbn-qv` is eisbn QV; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qx` (`/pay/citation-isbn-qx`; `/pay/citation-isbn-qw` is QW; `/pay/citation-isbn-qv` is QV; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-qx` (`/pay/citation-eisbn-qx`; `/pay/citation-isbn-qx` is print QX; `/pay/citation-eisbn-qw` is eisbn QW; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qy` (`/pay/citation-isbn-qy`; `/pay/citation-isbn-qx` is QX; `/pay/citation-isbn-qw` is QW; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellbleipv6` (`/pay/citation-author-icloudcellbleipv6`; `/pay/citation-author-icloudbleipv6` is icloudbleipv6; `/pay/citation-author-icloudcellipv6` is icloudcellipv6; `/pay/citation-author-icloudcellbleip` is icloudcellbleip), or `/pay/author-icloudcellbtip` (`/pay/citation-author-icloudcellbtip`; `/pay/citation-author-icloudbtip` is icloudbtip; `/pay/citation-author-icloudcellip` is icloudcellip; `/pay/citation-author-icloudcellwifiip` is icloudcellwifiip). Remaining Highwire tags include citation_eisbn_qy, citation_isbn_qz, citation_eisbn_qz, citation_isbn_ra, citation_author_icloudcellbtipv6, and citation_author_icloudcellnfcip. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 13:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1035 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-qw` and `/pay/citation-isbn-qx` (and the other four 1.169.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.169.0 paths will index after rsync/restart and another register.
