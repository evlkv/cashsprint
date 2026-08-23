# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.135.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-lc` | $0.002 | `url` | Highwire Press `name=citation_eisbn_lc` Saint Lucia-edition electronic ISBNs |
| `/pay/citation-isbn-gd` | $0.002 | `url` | Highwire Press `name=citation_isbn_gd` Grenada-edition ISBNs |
| `/pay/citation-eisbn-gd` | $0.002 | `url` | Highwire Press `name=citation_eisbn_gd` Grenada-edition electronic ISBNs |
| `/pay/citation-isbn-vc` | $0.002 | `url` | Highwire Press `name=citation_isbn_vc` Saint Vincent-edition ISBNs |
| `/pay/citation-author-aol` | $0.002 | `url` | Highwire Press `name=citation_author_aol` author AOL identifiers |
| `/pay/citation-author-hotmail` | $0.002 | `url` | Highwire Press `name=citation_author_hotmail` author Hotmail identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.134.0` (`whois` … `citation-author-msn`). `/pay/citation-isbn-lc` remains Highwire citation_isbn_lc; `/pay/citation-eisbn-bs` remains Highwire citation_eisbn_bs; `/pay/citation-author-msn` remains Highwire citation_author_msn; `/pay/citation-author-yahoo` remains Highwire citation_author_yahoo. Do not use `/pay/eisbn-lc` (`/pay/citation-eisbn-lc`; `/pay/citation-isbn-lc` is print LC; `/pay/citation-eisbn-bs` is eisbn BS; `/pay/citation-eisbn-bb` is eisbn BB; `/pay/citation-eisbn-tt` is eisbn TT), `/pay/isbn-gd` (`/pay/citation-isbn-gd`; `/pay/citation-isbn-lc` is LC; `/pay/citation-isbn-bs` is BS; `/pay/citation-isbn-bb` is BB; `/pay/citation-isbn-vc` is VC), `/pay/eisbn-gd` (`/pay/citation-eisbn-gd`; `/pay/citation-isbn-gd` is print GD; `/pay/citation-eisbn-lc` is eisbn LC; `/pay/citation-eisbn-bs` is eisbn BS), `/pay/isbn-vc` (`/pay/citation-isbn-vc`; `/pay/citation-isbn-gd` is GD; `/pay/citation-isbn-lc` is LC; `/pay/citation-isbn-bs` is BS), `/pay/author-aol` (`/pay/citation-author-aol`; `/pay/citation-author-msn` is msn; `/pay/citation-author-yahoo` is yahoo; `/pay/citation-author-aim` is aim; `/pay/citation-author-icq` is icq), or `/pay/author-hotmail` (`/pay/citation-author-hotmail`; `/pay/citation-author-aol` is aol; `/pay/citation-author-msn` is msn; `/pay/citation-author-yahoo` is yahoo). Remaining Highwire tags include citation_eisbn_vc, citation_isbn_ag, citation_eisbn_ag, citation_isbn_kn, citation_author_gmail, and citation_author_live. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 22:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 831 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.135.0 paths `/pay/citation-eisbn-lc`, `/pay/citation-isbn-gd`, `/pay/citation-eisbn-gd`, `/pay/citation-isbn-vc`, `/pay/citation-author-aol`, and `/pay/citation-author-hotmail` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.135.0 not indexed yet). New 1.135.0 paths will index after VPS deploy and another register.
