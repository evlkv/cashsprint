# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.160.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-eu` | $0.002 | `url` | Highwire Press `name=citation_eisbn_eu` European-Union-edition electronic ISBNs |
| `/pay/citation-isbn-ez` | $0.002 | `url` | Highwire Press `name=citation_isbn_ez` Eurozone-edition ISBNs |
| `/pay/citation-eisbn-ez` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ez` Eurozone-edition electronic ISBNs |
| `/pay/citation-isbn-fx` | $0.002 | `url` | Highwire Press `name=citation_isbn_fx` Metropolitan-France-edition ISBNs |
| `/pay/citation-author-icloudbtipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudbtipv6` author iCloud Bluetooth IPv6 identifiers |
| `/pay/citation-author-icloudcellip` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellip` author iCloud cellular IP identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.159.0` (`whois` … `citation-author-icloudbtip`). `/pay/citation-isbn-eu` remains Highwire citation_isbn_eu; `/pay/citation-eisbn-european` remains Highwire citation_eisbn_european; `/pay/citation-author-icloudbtip` remains Highwire citation_author_icloudbtip. Do not use `/pay/eisbn-eu` (`/pay/citation-eisbn-eu`; `/pay/citation-isbn-eu` is print EU; `/pay/citation-eisbn-ea` is eisbn EA; `/pay/citation-eisbn-ic` is eisbn IC; `/pay/citation-eisbn-european` is eisbn european), `/pay/isbn-ez` (`/pay/citation-isbn-ez`; `/pay/citation-isbn-eu` is EU; `/pay/citation-isbn-ea` is EA; `/pay/citation-isbn-ic` is IC), `/pay/eisbn-ez` (`/pay/citation-eisbn-ez`; `/pay/citation-isbn-ez` is print EZ; `/pay/citation-eisbn-eu` is eisbn EU; `/pay/citation-eisbn-ea` is eisbn EA), `/pay/isbn-fx` (`/pay/citation-isbn-fx`; `/pay/citation-isbn-ez` is EZ; `/pay/citation-isbn-eu` is EU; `/pay/citation-isbn-ea` is EA), `/pay/author-icloudbtipv6` (`/pay/citation-author-icloudbtipv6`; `/pay/citation-author-icloudbtip` is icloudbtip; `/pay/citation-author-icloudbleipv6` is icloudbleipv6; `/pay/citation-author-icloudwifiipv6` is icloudwifiipv6), or `/pay/author-icloudcellip` (`/pay/citation-author-icloudcellip`; `/pay/citation-author-icloudwifiip` is icloudwifiip; `/pay/citation-author-icloudbleip` is icloudbleip; `/pay/citation-author-icloudbtip` is icloudbtip). Remaining Highwire tags include citation_eisbn_fx, citation_isbn_su, citation_eisbn_su, citation_isbn_un, citation_author_icloudcellipv6, and citation_author_icloudcellmac. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 04:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 981 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-eu` and `/pay/citation-isbn-ez` are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; TCP 22 is open and the SSH banner answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.160.0 paths will index after rsync/restart and another register.
