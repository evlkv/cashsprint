# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.159.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-ic` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ic` Canary-Islands-edition electronic ISBNs |
| `/pay/citation-isbn-ea` | $0.002 | `url` | Highwire Press `name=citation_isbn_ea` Ceuta-and-Melilla-edition ISBNs |
| `/pay/citation-eisbn-ea` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ea` Ceuta-and-Melilla-edition electronic ISBNs |
| `/pay/citation-isbn-eu` | $0.002 | `url` | Highwire Press `name=citation_isbn_eu` European-Union-edition ISBNs |
| `/pay/citation-author-icloudbleipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudbleipv6` author iCloud BLE IPv6 identifiers |
| `/pay/citation-author-icloudbtip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudbtip` author iCloud Bluetooth IP identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.158.0` (`whois` … `citation-author-icloudwifiipv6`). `/pay/citation-isbn-ic` remains Highwire citation_isbn_ic; `/pay/citation-author-icloudbleip` remains Highwire citation_author_icloudbleip; `/pay/citation-author-icloudwifiipv6` remains Highwire citation_author_icloudwifiipv6. Do not use `/pay/eisbn-ic` (`/pay/citation-eisbn-ic`; `/pay/citation-isbn-ic` is print IC; `/pay/citation-eisbn-eh` is eisbn EH; `/pay/citation-eisbn-ps` is eisbn PS), `/pay/isbn-ea` (`/pay/citation-isbn-ea`; `/pay/citation-isbn-ic` is IC; `/pay/citation-isbn-ps` is PS; `/pay/citation-isbn-eh` is EH), `/pay/eisbn-ea` (`/pay/citation-eisbn-ea`; `/pay/citation-isbn-ea` is print EA; `/pay/citation-eisbn-ic` is eisbn IC; `/pay/citation-eisbn-eh` is eisbn EH), `/pay/isbn-eu` (`/pay/citation-isbn-eu`; `/pay/citation-isbn-ea` is EA; `/pay/citation-isbn-ic` is IC; `/pay/citation-isbn-european` is european), `/pay/author-icloudbleipv6` (`/pay/citation-author-icloudbleipv6`; `/pay/citation-author-icloudbleip` is icloudbleip; `/pay/citation-author-icloudwifiipv6` is icloudwifiipv6; `/pay/citation-author-icloudblemac` is icloudblemac), or `/pay/author-icloudbtip` (`/pay/citation-author-icloudbtip`; `/pay/citation-author-icloudbtaddr` is icloudbtaddr; `/pay/citation-author-icloudbleip` is icloudbleip; `/pay/citation-author-icloudwifiip` is icloudwifiip). Remaining Highwire tags include citation_eisbn_eu, citation_isbn_ez, citation_eisbn_ez, citation_isbn_fx, citation_author_icloudbtipv6, and citation_author_icloudcellip. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 03:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 975 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` (45.88.175.165) answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-ic` and `/pay/citation-isbn-ea` are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; TCP 22 is open and the SSH banner answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.159.0 paths will index after rsync/restart and another register.
