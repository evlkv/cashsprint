# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.161.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-fx` | $0.002 | `url` | Highwire Press `name=citation_eisbn_fx` Metropolitan-France-edition electronic ISBNs |
| `/pay/citation-isbn-su` | $0.002 | `url` | Highwire Press `name=citation_isbn_su` Soviet-Union-edition ISBNs |
| `/pay/citation-eisbn-su` | $0.002 | `url` | Highwire Press `name=citation_eisbn_su` Soviet-Union-edition electronic ISBNs |
| `/pay/citation-isbn-un` | $0.002 | `url` | Highwire Press `name=citation_isbn_un` United-Nations-edition ISBNs |
| `/pay/citation-author-icloudcellipv6` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellipv6` author iCloud cellular IPv6 identifiers |
| `/pay/citation-author-icloudcellmac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellmac` author iCloud cellular MAC identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.160.0` (`whois` … `citation-author-icloudcellip`). `/pay/citation-isbn-fx` remains Highwire citation_isbn_fx; `/pay/citation-eisbn-ez` remains Highwire citation_eisbn_ez; `/pay/citation-author-icloudcellip` remains Highwire citation_author_icloudcellip. Do not use `/pay/eisbn-fx` (`/pay/citation-eisbn-fx`; `/pay/citation-isbn-fx` is print FX; `/pay/citation-eisbn-ez` is eisbn EZ; `/pay/citation-eisbn-eu` is eisbn EU), `/pay/isbn-su` (`/pay/citation-isbn-su`; `/pay/citation-isbn-fx` is FX; `/pay/citation-isbn-ez` is EZ; `/pay/citation-isbn-eu` is EU), `/pay/eisbn-su` (`/pay/citation-eisbn-su`; `/pay/citation-isbn-su` is print SU; `/pay/citation-eisbn-fx` is eisbn FX; `/pay/citation-eisbn-ez` is eisbn EZ), `/pay/isbn-un` (`/pay/citation-isbn-un`; `/pay/citation-isbn-su` is SU; `/pay/citation-isbn-fx` is FX; `/pay/citation-isbn-ez` is EZ), `/pay/author-icloudcellipv6` (`/pay/citation-author-icloudcellipv6`; `/pay/citation-author-icloudcellip` is icloudcellip; `/pay/citation-author-icloudwifiipv6` is icloudwifiipv6; `/pay/citation-author-icloudbleipv6` is icloudbleipv6), or `/pay/author-icloudcellmac` (`/pay/citation-author-icloudcellmac`; `/pay/citation-author-icloudwifimac` is icloudwifimac; `/pay/citation-author-icloudblemac` is icloudblemac; `/pay/citation-author-icloudbtaddr` is icloudbtaddr). Remaining Highwire tags include citation_eisbn_un, citation_isbn_cp, citation_eisbn_cp, citation_isbn_dg, citation_author_icloudcellgw, and citation_author_icloudcellimei. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 05:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 987 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-fx` and `/pay/citation-isbn-su` are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banner answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.161.0 paths will index after rsync/restart and another register.
