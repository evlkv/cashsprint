# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.174.0`
- Batch date: `2026-08-25`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rh` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rh` user-assigned-RH-edition electronic ISBNs |
| `/pay/citation-isbn-ri` | $0.002 | `url` | Highwire Press `name=citation_isbn_ri` user-assigned-RI-edition ISBNs |
| `/pay/citation-eisbn-ri` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ri` user-assigned-RI-edition electronic ISBNs |
| `/pay/citation-isbn-rj` | $0.002 | `url` | Highwire Press `name=citation_isbn_rj` user-assigned-RJ-edition ISBNs |
| `/pay/citation-author-icloudcellnfcmsisdn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfcmsisdn` author iCloud cellular NFC MSISDN identifiers |
| `/pay/citation-author-icloudcellnfceid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcellnfceid` author iCloud cellular NFC EID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.173.0` (`whois` … `citation-author-icloudcellnfciccid`). `/pay/citation-isbn-rh` remains Highwire citation_isbn_rh; `/pay/citation-eisbn-rg` remains Highwire citation_eisbn_rg; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcellmsisdn` remains Highwire citation_author_icloudcellmsisdn; `/pay/citation-author-icloudcelleid` remains Highwire citation_author_icloudcelleid. Do not use `/pay/eisbn-rh` (`/pay/citation-eisbn-rh`; `/pay/citation-isbn-rh` is print RH; `/pay/citation-eisbn-rg` is eisbn RG; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-ri` (`/pay/citation-isbn-ri`; `/pay/citation-isbn-rh` is RH; `/pay/citation-isbn-rg` is RG; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-ri` (`/pay/citation-eisbn-ri`; `/pay/citation-isbn-ri` is print RI; `/pay/citation-eisbn-rh` is eisbn RH; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-rj` (`/pay/citation-isbn-rj`; `/pay/citation-isbn-ri` is RI; `/pay/citation-isbn-rh` is RH; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcellnfcmsisdn` (`/pay/citation-author-icloudcellnfcmsisdn`; `/pay/citation-author-icloudcellmsisdn` is cellmsisdn; `/pay/citation-author-icloudmsisdn` is icloudmsisdn; `/pay/citation-author-icloudcellnfcip` is nfcip), or `/pay/author-icloudcellnfceid` (`/pay/citation-author-icloudcellnfceid`; `/pay/citation-author-icloudcelleid` is celleid; `/pay/citation-author-icloudeid` is icloudeid; `/pay/citation-author-icloudcellnfcip` is nfcip). Remaining Highwire tags include citation_eisbn_rj, citation_isbn_rk, citation_eisbn_rk, citation_isbn_rl, citation_author_icloudcellnfcuuid, and citation_author_icloudcellnfcsn. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-25 18:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1065 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rh` and `/pay/citation-isbn-ri` (and the other four 1.174.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.174.0 paths will index after rsync/restart and another register.
