# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.184.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-sb` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sb` user-assigned-SB-edition electronic ISBNs |
| `/pay/citation-isbn-sc` | $0.002 | `url` | Highwire Press `name=citation_isbn_sc` user-assigned-SC-edition ISBNs |
| `/pay/citation-eisbn-sc` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sc` user-assigned-SC-edition electronic ISBNs |
| `/pay/citation-isbn-sd` | $0.002 | `url` | Highwire Press `name=citation_isbn_sd` user-assigned-SD-edition ISBNs |
| `/pay/citation-author-icloudcelluwbmsisdn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbmsisdn` author iCloud cellular ultra-wideband MSISDN identifiers |
| `/pay/citation-author-icloudcelluwbeid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbeid` author iCloud cellular ultra-wideband EID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.183.0` (`whois` … `citation-author-icloudcelluwbiccid`). `/pay/citation-isbn-sb` remains Highwire citation_isbn_sb; `/pay/citation-eisbn-sa` remains Highwire citation_eisbn_sa; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbiccid` remains Highwire citation_author_icloudcelluwbiccid; `/pay/citation-author-icloudcellmsisdn` remains Highwire citation_author_icloudcellmsisdn. Do not use `/pay/eisbn-sb` (`/pay/citation-eisbn-sb`; `/pay/citation-isbn-sb` is print SB; `/pay/citation-eisbn-sa` is eisbn SA; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sc` (`/pay/citation-isbn-sc`; `/pay/citation-isbn-sb` is SB; `/pay/citation-isbn-sa` is SA; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-sc` (`/pay/citation-eisbn-sc`; `/pay/citation-isbn-sc` is print SC; `/pay/citation-eisbn-sb` is eisbn SB; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sd` (`/pay/citation-isbn-sd`; `/pay/citation-isbn-sc` is SC; `/pay/citation-isbn-sb` is SB; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbmsisdn` (`/pay/citation-author-icloudcelluwbmsisdn`; `/pay/citation-author-icloudcelluwbiccid` is celluwbiccid; `/pay/citation-author-icloudcellmsisdn` is cellmsisdn; `/pay/citation-author-icloudcellnfcmsisdn` is nfcmsisdn; `/pay/citation-author-icloudmsisdn` is icloudmsisdn), or `/pay/author-icloudcelluwbeid` (`/pay/citation-author-icloudcelluwbeid`; `/pay/citation-author-icloudcelluwbmsisdn` is celluwbmsisdn; `/pay/citation-author-icloudcelleid` is celleid; `/pay/citation-author-icloudcellnfceid` is nfceid; `/pay/citation-author-icloudeid` is icloudeid). Remaining Highwire tags include citation_eisbn_sd, citation_isbn_se, citation_eisbn_se, citation_isbn_sf, citation_author_icloudcelluwbuuid, and citation_author_icloudcelluwbsn. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 04:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1125 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-sb` and `/pay/citation-isbn-sc` (and the other four 1.184.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.184.0 paths will index after rsync/restart and another register.
