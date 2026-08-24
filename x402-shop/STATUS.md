# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.151.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-je` | $0.002 | `url` | Highwire Press `name=citation_eisbn_je` Jersey-edition electronic ISBNs |
| `/pay/citation-isbn-im` | $0.002 | `url` | Highwire Press `name=citation_isbn_im` Isle-of-Man-edition ISBNs |
| `/pay/citation-eisbn-im` | $0.002 | `url` | Highwire Press `name=citation_eisbn_im` Isle-of-Man-edition electronic ISBNs |
| `/pay/citation-isbn-gi` | $0.002 | `url` | Highwire Press `name=citation_isbn_gi` Gibraltar-edition ISBNs |
| `/pay/citation-author-icloududid` | $0.002 | `url` | Highwire Press `name=citation_author_icloududid` author iCloud UDID identifiers |
| `/pay/citation-author-icloudserial` | $0.002 | `url` | Highwire Press `name=citation_author_icloudserial` author iCloud serial identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.150.0` (`whois` … `citation-author-iclouddevice`). `/pay/citation-isbn-je` remains Highwire citation_isbn_je; `/pay/citation-author-iclouddevice` remains Highwire citation_author_iclouddevice; `/pay/citation-author-icloudcsrf` remains Highwire citation_author_icloudcsrf. Do not use `/pay/eisbn-je` (`/pay/citation-eisbn-je`; `/pay/citation-isbn-je` is print JE; `/pay/citation-eisbn-gg` is eisbn GG; `/pay/citation-eisbn-ax` is eisbn AX), `/pay/isbn-im` (`/pay/citation-isbn-im`; `/pay/citation-isbn-je` is JE; `/pay/citation-isbn-gg` is GG; `/pay/citation-isbn-ax` is AX), `/pay/eisbn-im` (`/pay/citation-eisbn-im`; `/pay/citation-isbn-im` is print IM; `/pay/citation-eisbn-je` is eisbn JE; `/pay/citation-eisbn-gg` is eisbn GG), `/pay/isbn-gi` (`/pay/citation-isbn-gi`; `/pay/citation-isbn-im` is IM; `/pay/citation-isbn-je` is JE; `/pay/citation-isbn-gg` is GG), `/pay/author-icloududid` (`/pay/citation-author-icloududid`; `/pay/citation-author-iclouddevice` is iclouddevice; `/pay/citation-author-icloudcsrf` is icloudcsrf; `/pay/citation-author-icloudcookie` is icloudcookie; `/pay/citation-author-icloudnonce` is icloudnonce), or `/pay/author-icloudserial` (`/pay/citation-author-icloudserial`; `/pay/citation-author-icloududid` is icloududid; `/pay/citation-author-iclouddevice` is iclouddevice; `/pay/citation-author-icloudcsrf` is icloudcsrf; `/pay/citation-author-icloudcookie` is icloudcookie). Remaining Highwire tags include citation_eisbn_gi, citation_isbn_fk, citation_eisbn_fk, citation_isbn_io, citation_author_icloudimei, and citation_author_icloudmeid. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 16:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 927 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.13.1`, 43 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.151.0 paths `/pay/citation-eisbn-je`, `/pay/citation-isbn-im`, `/pay/citation-eisbn-im`, `/pay/citation-isbn-gi`, `/pay/citation-author-icloududid`, and `/pay/citation-author-icloudserial` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.13.1.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 9`, `total: 43`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped free/claim/quote paths (`/free/merchant-feed-preview`, `/free/base-usdc-receipt-preview`, `/free/base-usdc-wallet-statement-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 43 resources. Live catalog remains Devryno 1.13.1 (undeployed 1.151.0 not indexed yet). New 1.151.0 paths will index after VPS deploy and another register.
