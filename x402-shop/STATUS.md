# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.164.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-qm` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qm` user-assigned-QM-edition electronic ISBNs |
| `/pay/citation-isbn-qn` | $0.002 | `url` | Highwire Press `name=citation_isbn_qn` user-assigned-QN-edition ISBNs |
| `/pay/citation-eisbn-qn` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qn` user-assigned-QN-edition electronic ISBNs |
| `/pay/citation-isbn-qo` | $0.002 | `url` | Highwire Press `name=citation_isbn_qo` user-assigned-QO-edition ISBNs |
| `/pay/citation-author-icloudcellmsisdn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellmsisdn` author iCloud cellular MSISDN identifiers |
| `/pay/citation-author-icloudcelleid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelleid` author iCloud cellular EID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.163.0` (`whois` … `citation-author-icloudcelliccid`). `/pay/citation-isbn-qm` remains Highwire citation_isbn_qm; `/pay/citation-eisbn-aa` remains Highwire citation_eisbn_aa; `/pay/citation-author-icloudmsisdn` remains Highwire citation_author_icloudmsisdn; `/pay/citation-author-icloudeid` remains Highwire citation_author_icloudeid. Do not use `/pay/eisbn-qm` (`/pay/citation-eisbn-qm`; `/pay/citation-isbn-qm` is print QM; `/pay/citation-eisbn-aa` is eisbn AA; `/pay/citation-eisbn-dg` is eisbn DG), `/pay/isbn-qn` (`/pay/citation-isbn-qn`; `/pay/citation-isbn-qm` is QM; `/pay/citation-isbn-aa` is AA; `/pay/citation-isbn-dg` is DG), `/pay/eisbn-qn` (`/pay/citation-eisbn-qn`; `/pay/citation-isbn-qn` is print QN; `/pay/citation-eisbn-qm` is eisbn QM; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qo` (`/pay/citation-isbn-qo`; `/pay/citation-isbn-qn` is QN; `/pay/citation-isbn-qm` is QM; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellmsisdn` (`/pay/citation-author-icloudcellmsisdn`; `/pay/citation-author-icloudmsisdn` is icloudmsisdn; `/pay/citation-author-icloudcelliccid` is icloudcelliccid; `/pay/citation-author-icloudcellimsi` is icloudcellimsi), or `/pay/author-icloudcelleid` (`/pay/citation-author-icloudcelleid`; `/pay/citation-author-icloudeid` is icloudeid; `/pay/citation-author-icloudcellmsisdn` is icloudcellmsisdn; `/pay/citation-author-icloudcelliccid` is icloudcelliccid). Remaining Highwire tags include citation_eisbn_qo, citation_isbn_qp, citation_eisbn_qp, citation_isbn_qq, citation_author_icloudcelluuid, and citation_author_icloudcellsn. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 08:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1005 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-qm` and `/pay/citation-isbn-qn` are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banner answers (OpenSSH_9.6p1), but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.164.0 paths will index after rsync/restart and another register.
