# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.79.0`
- Batch date: `2026-08-21`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/temporal` | $0.002 | `url` | HTML `name=temporal` plus `DCTERMS.temporal` / `DC.coverage.temporal` |
| `/pay/bibliographic-citation` | $0.002 | `url` | HTML `name=bibliographic-citation` plus `DCTERMS.bibliographicCitation` |
| `/pay/is-part-of` | $0.002 | `url` | HTML `name=is-part-of` plus `DCTERMS.isPartOf` / `DC.relation.isPartOf` |
| `/pay/has-part` | $0.002 | `url` | HTML `name=has-part` plus `DCTERMS.hasPart` / `DC.relation.hasPart` |
| `/pay/is-version-of` | $0.002 | `url` | HTML `name=is-version-of` plus `DCTERMS.isVersionOf` / `DC.relation.isVersionOf` |
| `/pay/has-version` | $0.002 | `url` | HTML `name=has-version` plus `DCTERMS.hasVersion` / `DC.relation.hasVersion` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.78.0` (`whois` … `medium`). `/pay/coverage` remains spatial DC.coverage; `/pay/time` remains DNS TIME; `/pay/cite-as` remains IANA `rel=cite-as`; `/pay/collection` / `/pay/item` remain IANA collection relations; `/pay/version-history`, `/pay/latest-version`, `/pay/predecessor-version`, and `/pay/successor-version` remain RFC 5829. Remaining DCTERMS refinements include isFormatOf/hasFormat, references/isReferencedBy, requires/isRequiredBy, replaces/isReplacedBy, and conformsTo. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-21 14:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 495 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.79.0 paths `/pay/temporal`, `/pay/bibliographic-citation`, `/pay/is-part-of`, `/pay/has-part`, `/pay/is-version-of`, and `/pay/has-version` currently 404 on the live origin (undeployed). SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true` with 41 resources. New 1.79.0 paths will index after VPS deploy and another register.
