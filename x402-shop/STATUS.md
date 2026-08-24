# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.155.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-gs` | $0.002 | `url` | Highwire Press `name=citation_eisbn_gs` South-Georgia-and-the-South-Sandwich-Islands-edition electronic ISBNs |
| `/pay/citation-isbn-pn` | $0.002 | `url` | Highwire Press `name=citation_isbn_pn` Pitcairn-Islands-edition ISBNs |
| `/pay/citation-eisbn-pn` | $0.002 | `url` | Highwire Press `name=citation_eisbn_pn` Pitcairn-Islands-edition electronic ISBNs |
| `/pay/citation-isbn-bv` | $0.002 | `url` | Highwire Press `name=citation_isbn_bv` Bouvet-Island-edition ISBNs |
| `/pay/citation-author-iclouduuid` | $0.002 | `url` | Highwire Press `name=citation_author_iclouduuid` author iCloud UUID identifiers |
| `/pay/citation-author-icloudesn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudesn` author iCloud ESN identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.154.0` (`whois` … `citation-author-icloudeid`). `/pay/citation-isbn-gs` remains Highwire citation_isbn_gs; `/pay/citation-author-icloudeid` remains Highwire citation_author_icloudeid; `/pay/citation-author-icloudmsisdn` remains Highwire citation_author_icloudmsisdn. Do not use `/pay/eisbn-gs` (`/pay/citation-eisbn-gs`; `/pay/citation-isbn-gs` is print GS; `/pay/citation-eisbn-ta` is eisbn TA; `/pay/citation-eisbn-ac` is eisbn AC), `/pay/isbn-pn` (`/pay/citation-isbn-pn`; `/pay/citation-isbn-gs` is GS; `/pay/citation-isbn-ta` is TA; `/pay/citation-isbn-ac` is AC), `/pay/eisbn-pn` (`/pay/citation-eisbn-pn`; `/pay/citation-isbn-pn` is print PN; `/pay/citation-eisbn-gs` is eisbn GS; `/pay/citation-eisbn-ta` is eisbn TA), `/pay/isbn-bv` (`/pay/citation-isbn-bv`; `/pay/citation-isbn-pn` is PN; `/pay/citation-isbn-gs` is GS; `/pay/citation-isbn-ta` is TA), `/pay/author-iclouduuid` (`/pay/citation-author-iclouduuid`; `/pay/citation-author-icloudeid` is icloudeid; `/pay/citation-author-icloudmsisdn` is icloudmsisdn; `/pay/citation-author-icloudiccid` is icloudiccid), or `/pay/author-icloudesn` (`/pay/citation-author-icloudesn`; `/pay/citation-author-iclouduuid` is iclouduuid; `/pay/citation-author-icloudeid` is icloudeid; `/pay/citation-author-icloudmsisdn` is icloudmsisdn). Remaining Highwire tags include citation_eisbn_bv, citation_isbn_hm, citation_eisbn_hm, citation_isbn_um, citation_author_icloudwifimac, and citation_author_icloudbtaddr. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 21:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 951 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` (45.88.175.165) answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-gs` is 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH banners work, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.155.0 paths will index after rsync/restart and another register.
