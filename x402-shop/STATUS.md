# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.170.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-qy` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qy` user-assigned-QY-edition electronic ISBNs |
| `/pay/citation-isbn-qz` | $0.002 | `url` | Highwire Press `name=citation_isbn_qz` user-assigned-QZ-edition ISBNs |
| `/pay/citation-eisbn-qz` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qz` user-assigned-QZ-edition electronic ISBNs |
| `/pay/citation-isbn-ra` | $0.002 | `url` | Highwire Press `name=citation_isbn_ra` user-assigned-RA-edition ISBNs |
| `/pay/citation-author-icloudcellbtipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellbtipv6` author iCloud cellular Bluetooth IPv6 identifiers |
| `/pay/citation-author-icloudcellnfcip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcip` author iCloud cellular NFC IP identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.169.0` (`whois` … `citation-author-icloudcellbtip`). `/pay/citation-isbn-qy` remains Highwire citation_isbn_qy; `/pay/citation-eisbn-qx` remains Highwire citation_eisbn_qx; `/pay/citation-author-icloudbtipv6` remains Highwire citation_author_icloudbtipv6; `/pay/citation-author-icloudcellbtip` remains Highwire citation_author_icloudcellbtip. Do not use `/pay/eisbn-qy` (`/pay/citation-eisbn-qy`; `/pay/citation-isbn-qy` is print QY; `/pay/citation-eisbn-qx` is eisbn QX; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qz` (`/pay/citation-isbn-qz`; `/pay/citation-isbn-qy` is QY; `/pay/citation-isbn-qx` is QX; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-qz` (`/pay/citation-eisbn-qz`; `/pay/citation-isbn-qz` is print QZ; `/pay/citation-eisbn-qy` is eisbn QY; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-ra` (`/pay/citation-isbn-ra`; `/pay/citation-isbn-qz` is QZ; `/pay/citation-isbn-qy` is QY; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellbtipv6` (`/pay/citation-author-icloudcellbtipv6`; `/pay/citation-author-icloudbtipv6` is icloudbtipv6; `/pay/citation-author-icloudcellipv6` is icloudcellipv6; `/pay/citation-author-icloudcellbtip` is icloudcellbtip), or `/pay/author-icloudcellnfcip` (`/pay/citation-author-icloudcellnfcip`; `/pay/citation-author-icloudcellip` is icloudcellip; `/pay/citation-author-icloudcellbtip` is icloudcellbtip; `/pay/citation-author-icloudcellwifiip` is icloudcellwifiip). Remaining Highwire tags include citation_eisbn_ra, citation_isbn_rb, citation_eisbn_rb, citation_isbn_rc, citation_author_icloudcellnfcipv6, and citation_author_icloudcellnfcmac. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 14:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1041 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-qy` and `/pay/citation-isbn-qz` (and the other four 1.170.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.170.0 paths will index after rsync/restart and another register.
