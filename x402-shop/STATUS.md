# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.78.0`
- Batch date: `2026-08-21`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/alternative` | $0.002 | `url` | HTML `name=alternative` plus `DCTERMS.alternative` / `DC.title.alternative` |
| `/pay/issued` | $0.002 | `url` | HTML `name=issued` plus `DCTERMS.issued` / `DC.date.issued` |
| `/pay/available` | $0.002 | `url` | HTML `name=available` plus `DCTERMS.available` / `DC.date.available` |
| `/pay/valid` | $0.002 | `url` | HTML `name=valid` plus `DCTERMS.valid` / `DC.date.valid` |
| `/pay/extent` | $0.002 | `url` | HTML `name=extent` plus `DCTERMS.extent` / `DC.format.extent` |
| `/pay/medium` | $0.002 | `url` | HTML `name=medium` plus `DCTERMS.medium` / `DC.format.medium` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.77.0` (`whois` … `relation`). RFC 5829 Allen interval relations were completed in `1.64.0`. `/pay/alternate` remains IANA `rel=alternate`; `/pay/alternative` is DCTERMS.alternative (distinct from `/pay/title`). `/pay/date` remains generic DC.date; `/pay/created` remains DCTERMS.created; `/pay/revised` remains DCTERMS.modified; `/pay/expires` remains HTML `http-equiv=expires`. `/pay/format` remains media type (DC.format), not size (`/pay/extent`) or carrier (`/pay/medium`). Remaining DCTERMS refinements include temporal, bibliographicCitation, isPartOf/hasPart, isVersionOf/hasVersion, isFormatOf/hasFormat, references/isReferencedBy, requires/isRequiredBy, replaces/isReplacedBy, and conformsTo. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-21 13:04 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 489 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.78.0 path `/pay/alternative` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true` with 41 resources. New 1.78.0 paths will index after VPS deploy and another register.
