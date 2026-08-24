# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.153.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-io` | $0.002 | `url` | Highwire Press `name=citation_eisbn_io` British-Indian-Ocean-Territory-edition electronic ISBNs |
| `/pay/citation-isbn-sh` | $0.002 | `url` | Highwire Press `name=citation_isbn_sh` Saint-Helena-edition ISBNs |
| `/pay/citation-eisbn-sh` | $0.002 | `url` | Highwire Press `name=citation_eisbn_sh` Saint-Helena-edition electronic ISBNs |
| `/pay/citation-isbn-ac` | $0.002 | `url` | Highwire Press `name=citation_isbn_ac` Ascension-Island-edition ISBNs |
| `/pay/citation-author-icloudimsi` | $0.002 | `url` | Highwire Press `name=citation_author_icloudimsi` author iCloud IMSI identifiers |
| `/pay/citation-author-icloudiccid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudiccid` author iCloud ICCID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.152.0` (`whois` … `citation-author-icloudmeid`). `/pay/citation-isbn-io` remains Highwire citation_isbn_io; `/pay/citation-author-icloudmeid` remains Highwire citation_author_icloudmeid; `/pay/citation-author-icloudimei` remains Highwire citation_author_icloudimei. Do not use `/pay/eisbn-io` (`/pay/citation-eisbn-io`; `/pay/citation-isbn-io` is print IO; `/pay/citation-eisbn-gi` is eisbn GI; `/pay/citation-eisbn-fk` is eisbn FK), `/pay/isbn-sh` (`/pay/citation-isbn-sh`; `/pay/citation-isbn-io` is IO; `/pay/citation-isbn-fk` is FK; `/pay/citation-isbn-gi` is GI), `/pay/eisbn-sh` (`/pay/citation-eisbn-sh`; `/pay/citation-isbn-sh` is print SH; `/pay/citation-eisbn-io` is eisbn IO; `/pay/citation-eisbn-gi` is eisbn GI), `/pay/isbn-ac` (`/pay/citation-isbn-ac`; `/pay/citation-isbn-sh` is SH; `/pay/citation-isbn-io` is IO; `/pay/citation-isbn-fk` is FK), `/pay/author-icloudimsi` (`/pay/citation-author-icloudimsi`; `/pay/citation-author-icloudmeid` is icloudmeid; `/pay/citation-author-icloudimei` is icloudimei; `/pay/citation-author-icloudserial` is icloudserial), or `/pay/author-icloudiccid` (`/pay/citation-author-icloudiccid`; `/pay/citation-author-icloudimsi` is icloudimsi; `/pay/citation-author-icloudmeid` is icloudmeid; `/pay/citation-author-icloudimei` is icloudimei). Remaining Highwire tags include citation_eisbn_ac, citation_isbn_ta, citation_eisbn_ta, citation_isbn_gs, citation_author_icloudmsisdn, and citation_author_icloudeid. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 19:05 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 939 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.13.2`, 43 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402 (`x402Version` 2, `eip155:8453`, payTo `0xdD1729943bf7C408456cef52886ad12B05B57dC2`). New 1.153.0 paths `/pay/citation-eisbn-io`, `/pay/citation-isbn-sh`, `/pay/citation-eisbn-sh`, `/pay/citation-isbn-ac`, `/pay/citation-author-icloudimsi`, and `/pay/citation-author-icloudiccid` are not on the live origin (unpaid probe 404, undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`, `ubuntu@volkov.evgeny.m2.fvds.ru`, and `evgeny@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.13.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 9`, `total: 43`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped free/claim/quote paths (`/free/merchant-feed-preview`, `/free/base-usdc-receipt-preview`, `/free/base-usdc-wallet-statement-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true`, 43 resources. Live catalog remains Devryno 1.13.2 (undeployed 1.153.0 not indexed yet). New 1.153.0 paths will index after VPS deploy and another register.
