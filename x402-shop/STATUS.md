# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.140.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-tc` | $0.002 | `url` | Highwire Press `name=citation_eisbn_tc` Turks-and-Caicos-edition electronic ISBNs |
| `/pay/citation-isbn-aw` | $0.002 | `url` | Highwire Press `name=citation_isbn_aw` Aruba-edition ISBNs |
| `/pay/citation-eisbn-aw` | $0.002 | `url` | Highwire Press `name=citation_eisbn_aw` Aruba-edition electronic ISBNs |
| `/pay/citation-isbn-cw` | $0.002 | `url` | Highwire Press `name=citation_isbn_cw` Curacao-edition ISBNs |
| `/pay/citation-author-macmail` | $0.002 | `url` | Highwire Press `name=citation_author_macmail` author Mac Mail identifiers |
| `/pay/citation-author-dotmac` | $0.002 | `url` | Highwire Press `name=citation_author_dotmac` author .Mac identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.139.0` (`whois` … `citation-author-mecom`). `/pay/citation-isbn-tc` remains Highwire citation_isbn_tc; `/pay/citation-eisbn-vg` remains Highwire citation_eisbn_vg; `/pay/citation-author-mac` remains Highwire citation_author_mac; `/pay/citation-author-mecom` remains Highwire citation_author_mecom. Do not use `/pay/eisbn-tc` (`/pay/citation-eisbn-tc`; `/pay/citation-isbn-tc` is print TC; `/pay/citation-eisbn-vg` is eisbn VG; `/pay/citation-eisbn-ai` is eisbn AI; `/pay/citation-eisbn-ms` is eisbn MS), `/pay/isbn-aw` (`/pay/citation-isbn-aw`; `/pay/citation-isbn-tc` is TC; `/pay/citation-isbn-vg` is VG; `/pay/citation-isbn-ai` is AI; `/pay/citation-isbn-ms` is MS), `/pay/eisbn-aw` (`/pay/citation-eisbn-aw`; `/pay/citation-isbn-aw` is print AW; `/pay/citation-eisbn-tc` is eisbn TC; `/pay/citation-eisbn-vg` is eisbn VG; `/pay/citation-eisbn-ai` is eisbn AI), `/pay/isbn-cw` (`/pay/citation-isbn-cw`; `/pay/citation-isbn-aw` is AW; `/pay/citation-isbn-tc` is TC; `/pay/citation-isbn-vg` is VG; `/pay/citation-isbn-ai` is AI), `/pay/author-macmail` (`/pay/citation-author-macmail`; `/pay/citation-author-mac` is mac; `/pay/citation-author-mecom` is mecom; `/pay/citation-author-mobileme` is mobileme; `/pay/citation-author-me` is me), or `/pay/author-dotmac` (`/pay/citation-author-dotmac`; `/pay/citation-author-macmail` is macmail; `/pay/citation-author-mac` is mac; `/pay/citation-author-mecom` is mecom; `/pay/citation-author-mobileme` is mobileme). Remaining Highwire tags include citation_eisbn_cw, citation_isbn_sx, citation_eisbn_sx, citation_isbn_bq, citation_author_maccom, and citation_author_icloudcom. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 03:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 861 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.140.0 paths `/pay/citation-eisbn-tc`, `/pay/citation-isbn-aw`, `/pay/citation-eisbn-aw`, `/pay/citation-isbn-cw`, `/pay/citation-author-macmail`, and `/pay/citation-author-dotmac` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.140.0 not indexed yet). New 1.140.0 paths will index after VPS deploy and another register.
