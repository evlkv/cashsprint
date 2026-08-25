# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.163.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-dg` | $0.002 | `url` | Highwire Press `name=citation_eisbn_dg` Diego-Garcia-edition electronic ISBNs |
| `/pay/citation-isbn-aa` | $0.002 | `url` | Highwire Press `name=citation_isbn_aa` user-assigned-AA-edition ISBNs |
| `/pay/citation-eisbn-aa` | $0.002 | `url` | Highwire Press `name=citation_eisbn_aa` user-assigned-AA-edition electronic ISBNs |
| `/pay/citation-isbn-qm` | $0.002 | `url` | Highwire Press `name=citation_isbn_qm` user-assigned-QM-edition ISBNs |
| `/pay/citation-author-icloudcellimsi` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellimsi` author iCloud cellular IMSI identifiers |
| `/pay/citation-author-icloudcelliccid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelliccid` author iCloud cellular ICCID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.162.0` (`whois` … `citation-author-icloudcellimei`). `/pay/citation-isbn-dg` remains Highwire citation_isbn_dg; `/pay/citation-eisbn-cp` remains Highwire citation_eisbn_cp; `/pay/citation-author-icloudimsi` remains Highwire citation_author_icloudimsi; `/pay/citation-author-icloudiccid` remains Highwire citation_author_icloudiccid. Do not use `/pay/eisbn-dg` (`/pay/citation-eisbn-dg`; `/pay/citation-isbn-dg` is print DG; `/pay/citation-eisbn-cp` is eisbn CP; `/pay/citation-eisbn-un` is eisbn UN), `/pay/isbn-aa` (`/pay/citation-isbn-aa`; `/pay/citation-isbn-dg` is DG; `/pay/citation-isbn-un` is UN; `/pay/citation-isbn-cp` is CP), `/pay/eisbn-aa` (`/pay/citation-eisbn-aa`; `/pay/citation-isbn-aa` is print AA; `/pay/citation-eisbn-dg` is eisbn DG; `/pay/citation-eisbn-cp` is eisbn CP), `/pay/isbn-qm` (`/pay/citation-isbn-qm`; `/pay/citation-isbn-aa` is AA; `/pay/citation-isbn-dg` is DG; `/pay/citation-isbn-un` is UN), `/pay/author-icloudcellimsi` (`/pay/citation-author-icloudcellimsi`; `/pay/citation-author-icloudimsi` is icloudimsi; `/pay/citation-author-icloudcellimei` is icloudcellimei; `/pay/citation-author-icloudcellgw` is icloudcellgw), or `/pay/author-icloudcelliccid` (`/pay/citation-author-icloudcelliccid`; `/pay/citation-author-icloudiccid` is icloudiccid; `/pay/citation-author-icloudcellimsi` is icloudcellimsi; `/pay/citation-author-icloudcellimei` is icloudcellimei). Remaining Highwire tags include citation_eisbn_qm, citation_isbn_qn, citation_eisbn_qn, citation_isbn_qo, citation_author_icloudcellmsisdn, and citation_author_icloudcelleid. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 07:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 999 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-dg` and `/pay/citation-isbn-aa` are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banner answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.163.0 paths will index after rsync/restart and another register.
