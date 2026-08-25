# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.162.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-un` | $0.002 | `url` | Highwire Press `name=citation_eisbn_un` United-Nations-edition electronic ISBNs |
| `/pay/citation-isbn-cp` | $0.002 | `url` | Highwire Press `name=citation_isbn_cp` Clipperton-Island-edition ISBNs |
| `/pay/citation-eisbn-cp` | $0.002 | `url` | Highwire Press `name=citation_eisbn_cp` Clipperton-Island-edition electronic ISBNs |
| `/pay/citation-isbn-dg` | $0.002 | `url` | Highwire Press `name=citation_isbn_dg` Diego-Garcia-edition ISBNs |
| `/pay/citation-author-icloudcellgw` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellgw` author iCloud cellular gateway identifiers |
| `/pay/citation-author-icloudcellimei` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellimei` author iCloud cellular IMEI identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.161.0` (`whois` … `citation-author-icloudcellmac`). `/pay/citation-isbn-un` remains Highwire citation_isbn_un; `/pay/citation-eisbn-su` remains Highwire citation_eisbn_su; `/pay/citation-author-icloudimei` remains Highwire citation_author_icloudimei. Do not use `/pay/eisbn-un` (`/pay/citation-eisbn-un`; `/pay/citation-isbn-un` is print UN; `/pay/citation-eisbn-su` is eisbn SU; `/pay/citation-eisbn-fx` is eisbn FX), `/pay/isbn-cp` (`/pay/citation-isbn-cp`; `/pay/citation-isbn-un` is UN; `/pay/citation-isbn-su` is SU; `/pay/citation-isbn-fx` is FX), `/pay/eisbn-cp` (`/pay/citation-eisbn-cp`; `/pay/citation-isbn-cp` is print CP; `/pay/citation-eisbn-un` is eisbn UN; `/pay/citation-eisbn-su` is eisbn SU), `/pay/isbn-dg` (`/pay/citation-isbn-dg`; `/pay/citation-isbn-cp` is CP; `/pay/citation-isbn-un` is UN; `/pay/citation-isbn-su` is SU), `/pay/author-icloudcellgw` (`/pay/citation-author-icloudcellgw`; `/pay/citation-author-icloudcellmac` is icloudcellmac; `/pay/citation-author-icloudcellipv6` is icloudcellipv6; `/pay/citation-author-icloudcellip` is icloudcellip), or `/pay/author-icloudcellimei` (`/pay/citation-author-icloudcellimei`; `/pay/citation-author-icloudimei` is icloudimei; `/pay/citation-author-icloudcellgw` is icloudcellgw; `/pay/citation-author-icloudmeid` is icloudmeid). Remaining Highwire tags include citation_eisbn_dg, citation_isbn_aa, citation_eisbn_aa, citation_isbn_qm, citation_author_icloudcellimsi, and citation_author_icloudcelliccid. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 06:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 993 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-un` and `/pay/citation-isbn-cp` are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banner answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.162.0 paths will index after rsync/restart and another register.
