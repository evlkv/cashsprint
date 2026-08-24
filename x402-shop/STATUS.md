# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.145.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-gf` | $0.002 | `url` | Highwire Press `name=citation_eisbn_gf` French-Guiana-edition electronic ISBNs |
| `/pay/citation-isbn-re` | $0.002 | `url` | Highwire Press `name=citation_isbn_re` Reunion-edition ISBNs |
| `/pay/citation-eisbn-re` | $0.002 | `url` | Highwire Press `name=citation_eisbn_re` Reunion-edition electronic ISBNs |
| `/pay/citation-isbn-yt` | $0.002 | `url` | Highwire Press `name=citation_isbn_yt` Mayotte-edition ISBNs |
| `/pay/citation-author-icloudkey` | $0.002 | `url` | Highwire Press `name=citation_author_icloudkey` author iCloud key identifiers |
| `/pay/citation-author-icloudaccount` | $0.002 | `url` | Highwire Press `name=citation_author_icloudaccount` author iCloud account identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.144.0` (`whois` … `citation-author-icloudplus`). `/pay/citation-isbn-gf` remains Highwire citation_isbn_gf; `/pay/citation-author-icloudplus` remains Highwire citation_author_icloudplus; `/pay/citation-author-icloudid` remains Highwire citation_author_icloudid. Do not use `/pay/eisbn-gf` (`/pay/citation-eisbn-gf`; `/pay/citation-isbn-gf` is print GF; `/pay/citation-eisbn-gp` is eisbn GP; `/pay/citation-eisbn-mq` is eisbn MQ), `/pay/isbn-re` (`/pay/citation-isbn-re`; `/pay/citation-isbn-gf` is GF; `/pay/citation-isbn-gp` is GP; `/pay/citation-isbn-mq` is MQ), `/pay/eisbn-re` (`/pay/citation-eisbn-re`; `/pay/citation-isbn-re` is print RE; `/pay/citation-eisbn-gf` is eisbn GF; `/pay/citation-eisbn-gp` is eisbn GP), `/pay/isbn-yt` (`/pay/citation-isbn-yt`; `/pay/citation-isbn-re` is RE; `/pay/citation-isbn-gf` is GF; `/pay/citation-isbn-gp` is GP), `/pay/author-icloudkey` (`/pay/citation-author-icloudkey`; `/pay/citation-author-icloudplus` is icloudplus; `/pay/citation-author-icloudid` is icloudid; `/pay/citation-author-icloudmail` is icloudmail; `/pay/citation-author-icloud` is icloud), or `/pay/author-icloudaccount` (`/pay/citation-author-icloudaccount`; `/pay/citation-author-icloudkey` is icloudkey; `/pay/citation-author-icloudplus` is icloudplus; `/pay/citation-author-icloudid` is icloudid). Remaining Highwire tags include citation_eisbn_yt, citation_isbn_nc, citation_eisbn_nc, citation_isbn_pf, citation_author_iclouduser, and citation_author_icloudalias. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 08:02 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 891 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.145.0 paths `/pay/citation-eisbn-gf`, `/pay/citation-isbn-re`, `/pay/citation-eisbn-re`, `/pay/citation-isbn-yt`, `/pay/citation-author-icloudkey`, and `/pay/citation-author-icloudaccount` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 41 resources. Live catalog remains Devryno 1.12.2 (undeployed 1.145.0 not indexed yet). New 1.145.0 paths will index after VPS deploy and another register.
