# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.141.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-cw` | $0.002 | `url` | Highwire Press `name=citation_eisbn_cw` Curacao-edition electronic ISBNs |
| `/pay/citation-isbn-sx` | $0.002 | `url` | Highwire Press `name=citation_isbn_sx` Sint-Maarten-edition ISBNs |
| `/pay/citation-eisbn-sx` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sx` Sint-Maarten-edition electronic ISBNs |
| `/pay/citation-isbn-bq` | $0.002 | `url` | Highwire Press `name=citation_isbn_bq` Bonaire-edition ISBNs |
| `/pay/citation-author-maccom` | $0.002 | `url` | Highwire Press `name=citation_author_maccom` author Mac.com identifiers |
| `/pay/citation-author-icloudcom` | $0.002 | `url` | Highwire Press `name=citation_author_icloudcom` author iCloud.com identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.140.0` (`whois` … `citation-author-dotmac`). `/pay/citation-isbn-cw` remains Highwire citation_isbn_cw; `/pay/citation-eisbn-aw` remains Highwire citation_eisbn_aw; `/pay/citation-author-dotmac` remains Highwire citation_author_dotmac; `/pay/citation-author-icloud` remains Highwire citation_author_icloud. Do not use `/pay/eisbn-cw` (`/pay/citation-eisbn-cw`; `/pay/citation-isbn-cw` is print CW; `/pay/citation-eisbn-aw` is eisbn AW; `/pay/citation-eisbn-tc` is eisbn TC; `/pay/citation-eisbn-vg` is eisbn VG), `/pay/isbn-sx` (`/pay/citation-isbn-sx`; `/pay/citation-isbn-cw` is CW; `/pay/citation-isbn-aw` is AW; `/pay/citation-isbn-tc` is TC; `/pay/citation-isbn-vg` is VG), `/pay/eisbn-sx` (`/pay/citation-eisbn-sx`; `/pay/citation-isbn-sx` is print SX; `/pay/citation-eisbn-cw` is eisbn CW; `/pay/citation-eisbn-aw` is eisbn AW), `/pay/isbn-bq` (`/pay/citation-isbn-bq`; `/pay/citation-isbn-sx` is SX; `/pay/citation-isbn-cw` is CW; `/pay/citation-isbn-aw` is AW), `/pay/author-maccom` (`/pay/citation-author-maccom`; `/pay/citation-author-dotmac` is dotmac; `/pay/citation-author-macmail` is macmail; `/pay/citation-author-mac` is mac; `/pay/citation-author-mecom` is mecom), or `/pay/author-icloudcom` (`/pay/citation-author-icloudcom`; `/pay/citation-author-icloud` is icloud; `/pay/citation-author-maccom` is maccom; `/pay/citation-author-dotmac` is dotmac; `/pay/citation-author-macmail` is macmail). Remaining Highwire tags include citation_eisbn_bq, citation_isbn_mf, citation_eisbn_mf, citation_isbn_bl, citation_author_appleid, and citation_author_apple. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 04:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 867 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.141.0 paths `/pay/citation-eisbn-cw`, `/pay/citation-isbn-sx`, `/pay/citation-eisbn-sx`, `/pay/citation-isbn-bq`, `/pay/citation-author-maccom`, and `/pay/citation-author-icloudcom` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.141.0 not indexed yet). New 1.141.0 paths will index after VPS deploy and another register.
