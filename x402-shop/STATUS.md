# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.183.0`
- Batch date: `2026-08-26`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-rz` | $0.002 | `url` | Highwire Press `name=citation_eisbn_rz` user-assigned-RZ-edition electronic ISBNs |
| `/pay/citation-isbn-sa` | $0.002 | `url` | Highwire Press `name=citation_isbn_sa` user-assigned-SA-edition ISBNs |
| `/pay/citation-eisbn-sa` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sa` user-assigned-SA-edition electronic ISBNs |
| `/pay/citation-isbn-sb` | $0.002 | `url` | Highwire Press `name=citation_isbn_sb` user-assigned-SB-edition ISBNs |
| `/pay/citation-author-icloudcelluwbimsi` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbimsi` author iCloud cellular ultra-wideband IMSI identifiers |
| `/pay/citation-author-icloudcelluwbiccid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcelluwbiccid` author iCloud cellular ultra-wideband ICCID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.182.0` (`whois` … `citation-author-icloudcelluwbimei`). `/pay/citation-isbn-rz` remains Highwire citation_isbn_rz; `/pay/citation-eisbn-ry` remains Highwire citation_eisbn_ry; `/pay/citation-isbn-re` remains Highwire citation_isbn_re Reunion-edition; `/pay/citation-author-icloudcelluwbimei` remains Highwire citation_author_icloudcelluwbimei; `/pay/citation-author-icloudcellimsi` remains Highwire citation_author_icloudcellimsi. Do not use `/pay/eisbn-rz` (`/pay/citation-eisbn-rz`; `/pay/citation-isbn-rz` is print RZ; `/pay/citation-eisbn-ry` is eisbn RY; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sa` (`/pay/citation-isbn-sa`; `/pay/citation-isbn-rz` is RZ; `/pay/citation-isbn-ry` is RY; `/pay/citation-isbn-aa` is AA), `/pay/eisbn-sa` (`/pay/citation-eisbn-sa`; `/pay/citation-isbn-sa` is print SA; `/pay/citation-eisbn-rz` is eisbn RZ; `/pay/citation-eisbn-aa` is eisbn AA), `/pay/isbn-sb` (`/pay/citation-isbn-sb`; `/pay/citation-isbn-sa` is SA; `/pay/citation-isbn-rz` is RZ; `/pay/citation-isbn-aa` is AA), `/pay/author-icloudcelluwbimsi` (`/pay/citation-author-icloudcelluwbimsi`; `/pay/citation-author-icloudcelluwbimei` is celluwbimei; `/pay/citation-author-icloudcellimsi` is cellimsi; `/pay/citation-author-icloudcellnfcimsi` is nfcimsi; `/pay/citation-author-icloudimsi` is icloudimsi), or `/pay/author-icloudcelluwbiccid` (`/pay/citation-author-icloudcelluwbiccid`; `/pay/citation-author-icloudcelluwbimsi` is celluwbimsi; `/pay/citation-author-icloudcelliccid` is celliccid; `/pay/citation-author-icloudcellnfciccid` is nfciccid; `/pay/citation-author-icloudiccid` is icloudiccid). Remaining Highwire tags include citation_eisbn_sb, citation_isbn_sc, citation_eisbn_sc, citation_isbn_sd, citation_author_icloudcelluwbmsisdn, and citation_author_icloudcelluwbeid. Skip `/pay/citation-isbn-re` / `/pay/citation-eisbn-re` (already Reunion-edition in 1.145.0). Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-26 03:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 1119 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` answers HTTPS (nginx/1.24.0, OpenAPI Devryno 1.13.2, 43 paths). Unpaid `/pay/ping` is 402 (`x402Version` 2, `eip155:8453`). Unpaid `/pay/citation-eisbn-rz` and `/pay/citation-isbn-sa` (and the other four 1.183.0 paths) are 404. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH answers, but `root@` / `ubuntu@` / `evgeny@volkov.evgeny.m2.fvds.ru` return Permission denied (publickey,password). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: succeeded (`success: true`, registered 34, failed 0, skipped 9 free/claim/quote paths, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). `checkDiscovery` `found: true`, `resourceCount: 43`, source `openapi`. Live catalog remains 1.13.2 until VPS deploy; new 1.183.0 paths will index after rsync/restart and another register.
