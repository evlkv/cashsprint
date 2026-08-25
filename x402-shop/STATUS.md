# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.158.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-eh` | $0.002 | `url` | Highwire Press `name=citation_eisbn_eh` Western-Sahara-edition electronic ISBNs |
| `/pay/citation-isbn-ps` | $0.002 | `url` | Highwire Press `name=citation_isbn_ps` Palestine-edition ISBNs |
| `/pay/citation-eisbn-ps` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ps` Palestine-edition electronic ISBNs |
| `/pay/citation-isbn-ic` | $0.002 | `url` | Highwire Press `name=citation_isbn_ic` Canary-Islands-edition ISBNs |
| `/pay/citation-author-icloudbleip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudbleip` author iCloud BLE IP identifiers |
| `/pay/citation-author-icloudwifiipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudwifiipv6` author iCloud Wi-Fi IPv6 identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.157.0` (`whois` … `citation-author-icloudblemac`). `/pay/citation-isbn-eh` remains Highwire citation_isbn_eh; `/pay/citation-author-icloudblemac` remains Highwire citation_author_icloudblemac; `/pay/citation-author-icloudwifiip` remains Highwire citation_author_icloudwifiip. Do not use `/pay/eisbn-eh` (`/pay/citation-eisbn-eh`; `/pay/citation-isbn-eh` is print EH; `/pay/citation-eisbn-um` is eisbn UM; `/pay/citation-eisbn-aq` is eisbn AQ), `/pay/isbn-ps` (`/pay/citation-isbn-ps`; `/pay/citation-isbn-eh` is EH; `/pay/citation-isbn-aq` is AQ; `/pay/citation-isbn-um` is UM), `/pay/eisbn-ps` (`/pay/citation-eisbn-ps`; `/pay/citation-isbn-ps` is print PS; `/pay/citation-eisbn-eh` is eisbn EH; `/pay/citation-eisbn-um` is eisbn UM), `/pay/isbn-ic` (`/pay/citation-isbn-ic`; `/pay/citation-isbn-ps` is PS; `/pay/citation-isbn-eh` is EH; `/pay/citation-isbn-aq` is AQ), `/pay/author-icloudbleip` (`/pay/citation-author-icloudbleip`; `/pay/citation-author-icloudblemac` is icloudblemac; `/pay/citation-author-icloudwifiip` is icloudwifiip; `/pay/citation-author-icloudbtaddr` is icloudbtaddr), or `/pay/author-icloudwifiipv6` (`/pay/citation-author-icloudwifiipv6`; `/pay/citation-author-icloudwifiip` is icloudwifiip; `/pay/citation-author-icloudbleip` is icloudbleip; `/pay/citation-author-icloudblemac` is icloudblemac). Remaining Highwire tags include citation_eisbn_ic, citation_isbn_ea, citation_eisbn_ea, citation_isbn_eu, citation_author_icloudbleipv6, and citation_author_icloudbtip. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 02:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 969 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` (45.88.175.165) answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-eh` is 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banners work, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.158.0 paths will index after rsync/restart and another register.
