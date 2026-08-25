# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.165.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-qo` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qo` user-assigned-QO-edition electronic ISBNs |
| `/pay/citation-isbn-qp` | $0.002 | `url` | Highwire Press `name=citation_isbn_qp` user-assigned-QP-edition ISBNs |
| `/pay/citation-eisbn-qp` | $0.002 | `url` | Highwire Press `name=citation_eisbn_qp` user-assigned-QP-edition electronic ISBNs |
| `/pay/citation-isbn-qq` | $0.002 | `url` | Highwire Press `name=citation_isbn_qq` user-assigned-QQ-edition ISBNs |
| `/pay/citation-author-icloudcelluuid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluuid` author iCloud cellular UUID identifiers |
| `/pay/citation-author-icloudcellsn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellsn` author iCloud cellular serial-number identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.164.0` (`whois` … `citation-author-icloudcelleid`). `/pay/citation-isbn-qo` remains Highwire citation_isbn_qo; `/pay/citation-eisbn-qn` remains Highwire citation_eisbn_qn; `/pay/citation-author-iclouduuid` remains Highwire citation_author_iclouduuid; `/pay/citation-author-icloudesn` remains Highwire citation_author_icloudesn. Do not use `/pay/eisbn-qo` (`/pay/citation-eisbn-qo`; `/pay/citation-isbn-qo` is print QO; `/pay/citation-eisbn-qn` is eisbn QN; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qp` (`/pay/citation-isbn-qp`; `/pay/citation-isbn-qo` is QO; `/pay/citation-isbn-qn` is QN; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-qp` (`/pay/citation-eisbn-qp`; `/pay/citation-isbn-qp` is print QP; `/pay/citation-eisbn-qo` is eisbn QO; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-qq` (`/pay/citation-isbn-qq`; `/pay/citation-isbn-qp` is QP; `/pay/citation-isbn-qo` is QO; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluuid` (`/pay/citation-author-icloudcelluuid`; `/pay/citation-author-iclouduuid` is iclouduuid; `/pay/citation-author-icloudcelleid` is icloudcelleid; `/pay/citation-author-icloudcelliccid` is icloudcelliccid), or `/pay/author-icloudcellsn` (`/pay/citation-author-icloudcellsn`; `/pay/citation-author-icloudesn` is icloudesn; `/pay/citation-author-icloudcelluuid` is icloudcelluuid; `/pay/citation-author-icloudcelleid` is icloudcelleid). Remaining Highwire tags include citation_eisbn_qq, citation_isbn_qr, citation_eisbn_qr, citation_isbn_qs, citation_author_icloudcellwifimac, and citation_author_icloudcellbtaddr. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 09:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1011 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-qo` and `/pay/citation-isbn-qp` are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banner answers (OpenSSH_9.6p1 Ubuntu-3ubuntu13.18), but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.165.0 paths will index after rsync/restart and another register.
