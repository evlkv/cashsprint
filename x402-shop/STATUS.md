# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.148.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-tf` | $0.002 | `url` | Highwire Press `name=citation_eisbn_tf` French-Southern-Territories-edition electronic ISBNs |
| `/pay/citation-isbn-fo` | $0.002 | `url` | Highwire Press `name=citation_isbn_fo` Faroe-Islands-edition ISBNs |
| `/pay/citation-eisbn-fo` | $0.002 | `url` | Highwire Press `name=citation_eisbn_fo` Faroe-Islands-edition electronic ISBNs |
| `/pay/citation-isbn-gl` | $0.002 | `url` | Highwire Press `name=citation_isbn_gl` Greenland-edition ISBNs |
| `/pay/citation-author-icloudtoken` | $0.002 | `url` | Highwire Press `name=citation_author_icloudtoken` author iCloud token identifiers |
| `/pay/citation-author-icloudsession` | $0.002 | `url` | Highwire Press `name=citation_author_icloudsession` author iCloud session identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.147.0` (`whois` … `citation-author-icloudhandle`). `/pay/citation-isbn-tf` remains Highwire citation_isbn_tf; `/pay/citation-author-icloudhandle` remains Highwire citation_author_icloudhandle; `/pay/citation-author-icloudlogin` remains Highwire citation_author_icloudlogin. Do not use `/pay/eisbn-tf` (`/pay/citation-eisbn-tf`; `/pay/citation-isbn-tf` is print TF; `/pay/citation-eisbn-wf` is eisbn WF; `/pay/citation-eisbn-pf` is eisbn PF), `/pay/isbn-fo` (`/pay/citation-isbn-fo`; `/pay/citation-isbn-tf` is TF; `/pay/citation-isbn-wf` is WF; `/pay/citation-isbn-pf` is PF), `/pay/eisbn-fo` (`/pay/citation-eisbn-fo`; `/pay/citation-isbn-fo` is print FO; `/pay/citation-eisbn-tf` is eisbn TF; `/pay/citation-eisbn-wf` is eisbn WF), `/pay/isbn-gl` (`/pay/citation-isbn-gl`; `/pay/citation-isbn-fo` is FO; `/pay/citation-isbn-tf` is TF; `/pay/citation-isbn-wf` is WF), `/pay/author-icloudtoken` (`/pay/citation-author-icloudtoken`; `/pay/citation-author-icloudhandle` is icloudhandle; `/pay/citation-author-icloudlogin` is icloudlogin; `/pay/citation-author-icloudalias` is icloudalias; `/pay/citation-author-iclouduser` is iclouduser), or `/pay/author-icloudsession` (`/pay/citation-author-icloudsession`; `/pay/citation-author-icloudtoken` is icloudtoken; `/pay/citation-author-icloudhandle` is icloudhandle; `/pay/citation-author-icloudlogin` is icloudlogin). Remaining Highwire tags include citation_eisbn_gl, citation_isbn_sj, citation_eisbn_sj, citation_isbn_ax, citation_author_icloudnonce, and citation_author_icloudcookie. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 11:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 909 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.148.0 paths `/pay/citation-eisbn-tf`, `/pay/citation-isbn-fo`, `/pay/citation-eisbn-fo`, `/pay/citation-isbn-gl`, `/pay/citation-author-icloudtoken`, and `/pay/citation-author-icloudsession` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.148.0 not indexed yet). New 1.148.0 paths will index after VPS deploy and another register.
