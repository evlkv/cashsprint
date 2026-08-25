# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.156.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-bv` | $0.002 | `url` | Highwire Press `name=citation_eisbn_bv` Bouvet-Island-edition electronic ISBNs |
| `/pay/citation-isbn-hm` | $0.002 | `url` | Highwire Press `name=citation_isbn_hm` Heard-Island-and-McDonald-Islands-edition ISBNs |
| `/pay/citation-eisbn-hm` | $0.002 | `url` | Highwire Press `name=citation_eisbn_hm` Heard-Island-and-McDonald-Islands-edition electronic ISBNs |
| `/pay/citation-isbn-um` | $0.002 | `url` | Highwire Press `name=citation_isbn_um` United-States-Minor-Outlying-Islands-edition ISBNs |
| `/pay/citation-author-icloudwifimac` | $0.002 | `url` | Highwire Press `name=citation_author_icloudwifimac` author iCloud Wi-Fi MAC identifiers |
| `/pay/citation-author-icloudbtaddr` | $0.002 | `url` | Highwire Press `name=citation_author_icloudbtaddr` author iCloud Bluetooth address identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.155.0` (`whois` … `citation-author-icloudesn`). `/pay/citation-isbn-bv` remains Highwire citation_isbn_bv; `/pay/citation-author-icloudesn` remains Highwire citation_author_icloudesn; `/pay/citation-author-iclouduuid` remains Highwire citation_author_iclouduuid. Do not use `/pay/eisbn-bv` (`/pay/citation-eisbn-bv`; `/pay/citation-isbn-bv` is print BV; `/pay/citation-eisbn-pn` is eisbn PN; `/pay/citation-eisbn-gs` is eisbn GS), `/pay/isbn-hm` (`/pay/citation-isbn-hm`; `/pay/citation-isbn-bv` is BV; `/pay/citation-isbn-pn` is PN; `/pay/citation-isbn-gs` is GS), `/pay/eisbn-hm` (`/pay/citation-eisbn-hm`; `/pay/citation-isbn-hm` is print HM; `/pay/citation-eisbn-bv` is eisbn BV; `/pay/citation-eisbn-pn` is eisbn PN), `/pay/isbn-um` (`/pay/citation-isbn-um`; `/pay/citation-isbn-hm` is HM; `/pay/citation-isbn-bv` is BV; `/pay/citation-isbn-pn` is PN), `/pay/author-icloudwifimac` (`/pay/citation-author-icloudwifimac`; `/pay/citation-author-icloudesn` is icloudesn; `/pay/citation-author-iclouduuid` is iclouduuid; `/pay/citation-author-icloudeid` is icloudeid), or `/pay/author-icloudbtaddr` (`/pay/citation-author-icloudbtaddr`; `/pay/citation-author-icloudwifimac` is icloudwifimac; `/pay/citation-author-icloudesn` is icloudesn; `/pay/citation-author-iclouduuid` is iclouduuid). Remaining Highwire tags include citation_eisbn_um, citation_isbn_aq, citation_eisbn_aq, citation_isbn_eh, citation_author_icloudwifiip, and citation_author_icloudblemac. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 00:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 957 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` (45.88.175.165) answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-bv` is 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banners work, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.156.0 paths will index after rsync/restart and another register.
