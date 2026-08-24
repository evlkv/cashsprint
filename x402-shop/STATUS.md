# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.149.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-gl` | $0.002 | `url` | Highwire Press `name=citation_eisbn_gl` Greenland-edition electronic ISBNs |
| `/pay/citation-isbn-sj` | $0.002 | `url` | Highwire Press `name=citation_isbn_sj` Svalbard-and-Jan-Mayen-edition ISBNs |
| `/pay/citation-eisbn-sj` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sj` Svalbard-and-Jan-Mayen-edition electronic ISBNs |
| `/pay/citation-isbn-ax` | $0.002 | `url` | Highwire Press `name=citation_isbn_ax` Aland-Islands-edition ISBNs |
| `/pay/citation-author-icloudnonce` | $0.002 | `url` | Highwire Press `name=citation_author_icloudnonce` author iCloud nonce identifiers |
| `/pay/citation-author-icloudcookie` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcookie` author iCloud cookie identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.148.0` (`whois` … `citation-author-icloudsession`). `/pay/citation-isbn-gl` remains Highwire citation_isbn_gl; `/pay/citation-author-icloudsession` remains Highwire citation_author_icloudsession; `/pay/citation-author-icloudtoken` remains Highwire citation_author_icloudtoken. Do not use `/pay/eisbn-gl` (`/pay/citation-eisbn-gl`; `/pay/citation-isbn-gl` is print GL; `/pay/citation-eisbn-fo` is eisbn FO; `/pay/citation-eisbn-tf` is eisbn TF), `/pay/isbn-sj` (`/pay/citation-isbn-sj`; `/pay/citation-isbn-gl` is GL; `/pay/citation-isbn-fo` is FO; `/pay/citation-isbn-tf` is TF), `/pay/eisbn-sj` (`/pay/citation-eisbn-sj`; `/pay/citation-isbn-sj` is print SJ; `/pay/citation-eisbn-gl` is eisbn GL; `/pay/citation-eisbn-fo` is eisbn FO), `/pay/isbn-ax` (`/pay/citation-isbn-ax`; `/pay/citation-isbn-sj` is SJ; `/pay/citation-isbn-gl` is GL; `/pay/citation-isbn-fo` is FO), `/pay/author-icloudnonce` (`/pay/citation-author-icloudnonce`; `/pay/citation-author-icloudsession` is icloudsession; `/pay/citation-author-icloudtoken` is icloudtoken; `/pay/citation-author-icloudhandle` is icloudhandle; `/pay/citation-author-icloudlogin` is icloudlogin), or `/pay/author-icloudcookie` (`/pay/citation-author-icloudcookie`; `/pay/citation-author-icloudnonce` is icloudnonce; `/pay/citation-author-icloudsession` is icloudsession; `/pay/citation-author-icloudtoken` is icloudtoken). Remaining Highwire tags include citation_eisbn_ax, citation_isbn_gg, citation_eisbn_gg, citation_isbn_je, citation_author_icloudcsrf, and citation_author_iclouddevice. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 14:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 915 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.13.1`, 43 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.149.0 paths `/pay/citation-eisbn-gl`, `/pay/citation-isbn-sj`, `/pay/citation-eisbn-sj`, `/pay/citation-isbn-ax`, `/pay/citation-author-icloudnonce`, and `/pay/citation-author-icloudcookie` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.13.1.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 9`, `total: 43`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped free/claim/quote paths (`/free/merchant-feed-preview`, `/free/base-usdc-receipt-preview`, `/free/base-usdc-wallet-statement-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 43 resources. Live catalog remains Devryno 1.13.1 (undeployed 1.149.0 not indexed yet). New 1.149.0 paths will index after VPS deploy and another register.
