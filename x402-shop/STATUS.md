# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.150.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-ax` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ax` Aland-Islands-edition electronic ISBNs |
| `/pay/citation-isbn-gg` | $0.002 | `url` | Highwire Press `name=citation_isbn_gg` Guernsey-edition ISBNs |
| `/pay/citation-eisbn-gg` | $0.002 | `url` | Highwire Press `name=citation_eisbn_gg` Guernsey-edition electronic ISBNs |
| `/pay/citation-isbn-je` | $0.002 | `url` | Highwire Press `name=citation_isbn_je` Jersey-edition ISBNs |
| `/pay/citation-author-icloudcsrf` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcsrf` author iCloud CSRF identifiers |
| `/pay/citation-author-iclouddevice` | $0.002 | `url` | Highwire Press `name=citation_author_iclouddevice` author iCloud device identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.149.0` (`whois` … `citation-author-icloudcookie`). `/pay/citation-isbn-ax` remains Highwire citation_isbn_ax; `/pay/citation-author-icloudcookie` remains Highwire citation_author_icloudcookie; `/pay/citation-author-icloudnonce` remains Highwire citation_author_icloudnonce. Do not use `/pay/eisbn-ax` (`/pay/citation-eisbn-ax`; `/pay/citation-isbn-ax` is print AX; `/pay/citation-eisbn-sj` is eisbn SJ; `/pay/citation-eisbn-gl` is eisbn GL), `/pay/isbn-gg` (`/pay/citation-isbn-gg`; `/pay/citation-isbn-ax` is AX; `/pay/citation-isbn-sj` is SJ; `/pay/citation-isbn-gl` is GL), `/pay/eisbn-gg` (`/pay/citation-eisbn-gg`; `/pay/citation-isbn-gg` is print GG; `/pay/citation-eisbn-ax` is eisbn AX; `/pay/citation-eisbn-sj` is eisbn SJ), `/pay/isbn-je` (`/pay/citation-isbn-je`; `/pay/citation-isbn-gg` is GG; `/pay/citation-isbn-ax` is AX; `/pay/citation-isbn-sj` is SJ), `/pay/author-icloudcsrf` (`/pay/citation-author-icloudcsrf`; `/pay/citation-author-icloudcookie` is icloudcookie; `/pay/citation-author-icloudnonce` is icloudnonce; `/pay/citation-author-icloudsession` is icloudsession; `/pay/citation-author-icloudtoken` is icloudtoken), or `/pay/author-iclouddevice` (`/pay/citation-author-iclouddevice`; `/pay/citation-author-icloudcsrf` is icloudcsrf; `/pay/citation-author-icloudcookie` is icloudcookie; `/pay/citation-author-icloudnonce` is icloudnonce; `/pay/citation-author-icloudsession` is icloudsession). Remaining Highwire tags include citation_eisbn_je, citation_isbn_im, citation_eisbn_im, citation_isbn_gi, citation_author_icloududid, and citation_author_icloudserial. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 15:01 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 921 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.13.1`, 43 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.150.0 paths `/pay/citation-eisbn-ax`, `/pay/citation-isbn-gg`, `/pay/citation-eisbn-gg`, `/pay/citation-isbn-je`, `/pay/citation-author-icloudcsrf`, and `/pay/citation-author-iclouddevice` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.13.1.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 9`, `total: 43`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped free/claim/quote paths (`/free/merchant-feed-preview`, `/free/base-usdc-receipt-preview`, `/free/base-usdc-wallet-statement-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 43 resources. Live catalog remains Devryno 1.13.1 (undeployed 1.150.0 not indexed yet). New 1.150.0 paths will index after VPS deploy and another register.
