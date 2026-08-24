# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.146.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-yt` | $0.002 | `url` | Highwire Press `name=citation_eisbn_yt` Mayotte-edition electronic ISBNs |
| `/pay/citation-isbn-nc` | $0.002 | `url` | Highwire Press `name=citation_isbn_nc` New-Caledonia-edition ISBNs |
| `/pay/citation-eisbn-nc` | $0.002 | `url` | Highwire Press `name=citation_eisbn_nc` New-Caledonia-edition electronic ISBNs |
| `/pay/citation-isbn-pf` | $0.002 | `url` | Highwire Press `name=citation_isbn_pf` French-Polynesia-edition ISBNs |
| `/pay/citation-author-iclouduser` | $0.002 | `url` | Highwire Press `name=citation_author_iclouduser` author iCloud user identifiers |
| `/pay/citation-author-icloudalias` | $0.002 | `url` | Highwire Press `name=citation_author_icloudalias` author iCloud alias identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.145.0` (`whois` … `citation-author-icloudaccount`). `/pay/citation-isbn-yt` remains Highwire citation_isbn_yt; `/pay/citation-author-icloudaccount` remains Highwire citation_author_icloudaccount; `/pay/citation-author-icloudkey` remains Highwire citation_author_icloudkey. Do not use `/pay/eisbn-yt` (`/pay/citation-eisbn-yt`; `/pay/citation-isbn-yt` is print YT; `/pay/citation-eisbn-re` is eisbn RE; `/pay/citation-eisbn-gf` is eisbn GF), `/pay/isbn-nc` (`/pay/citation-isbn-nc`; `/pay/citation-isbn-yt` is YT; `/pay/citation-isbn-re` is RE; `/pay/citation-isbn-gf` is GF), `/pay/eisbn-nc` (`/pay/citation-eisbn-nc`; `/pay/citation-isbn-nc` is print NC; `/pay/citation-eisbn-yt` is eisbn YT; `/pay/citation-eisbn-re` is eisbn RE), `/pay/isbn-pf` (`/pay/citation-isbn-pf`; `/pay/citation-isbn-nc` is NC; `/pay/citation-isbn-yt` is YT; `/pay/citation-isbn-re` is RE), `/pay/author-iclouduser` (`/pay/citation-author-iclouduser`; `/pay/citation-author-icloudaccount` is icloudaccount; `/pay/citation-author-icloudkey` is icloudkey; `/pay/citation-author-icloudplus` is icloudplus; `/pay/citation-author-icloudid` is icloudid), or `/pay/author-icloudalias` (`/pay/citation-author-icloudalias`; `/pay/citation-author-iclouduser` is iclouduser; `/pay/citation-author-icloudaccount` is icloudaccount; `/pay/citation-author-icloudkey` is icloudkey). Remaining Highwire tags include citation_eisbn_pf, citation_isbn_wf, citation_eisbn_wf, citation_isbn_tf, citation_author_icloudlogin, and citation_author_icloudhandle. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 09:03 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 897 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.146.0 paths `/pay/citation-eisbn-yt`, `/pay/citation-isbn-nc`, `/pay/citation-eisbn-nc`, `/pay/citation-isbn-pf`, `/pay/citation-author-iclouduser`, and `/pay/citation-author-icloudalias` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.146.0 not indexed yet). New 1.146.0 paths will index after VPS deploy and another register.
