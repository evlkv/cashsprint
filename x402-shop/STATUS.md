# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.81.0`
- Batch date: `2026-08-21`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/replaces` | $0.002 | `url` | HTML `name=replaces` plus `DCTERMS.replaces` / `DC.relation.replaces` |
| `/pay/is-replaced-by` | $0.002 | `url` | HTML `name=is-replaced-by` plus `DCTERMS.isReplacedBy` / `DC.relation.isReplacedBy` |
| `/pay/conforms-to` | $0.002 | `url` | HTML `name=conforms-to` plus `DCTERMS.conformsTo` / `DC.relation.conformsTo` |
| `/pay/access-rights` | $0.002 | `url` | HTML `name=access-rights` plus `DCTERMS.accessRights` / `DC.rights.accessRights` |
| `/pay/provenance` | $0.002 | `url` | HTML `name=provenance` plus `DCTERMS.provenance` / `DC.description.provenance` |
| `/pay/rights-holder` | $0.002 | `url` | HTML `name=rights-holder` plus `DCTERMS.rightsHolder` / `DC.rights.holder` |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.80.0` (`whois` … `is-required-by`). `/pay/rights` remains DC.rights; `/pay/owner` remains HTML `name=owner`; `/pay/copyright` remains `rel=copyright`; `/pay/license` remains `rel=license`; `/pay/source` remains IANA `rel=source`; `/pay/successor-version` remains RFC 5829; `/pay/relation` remains generic DC.relation; `/pay/format` remains media type; `/pay/accesslist` remains `eth_createAccessList`. Remaining DCTERMS refinements include accrualMethod/accrualPeriodicity/accrualPolicy, educationLevel, instructionalMethod, and mediator. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-21 16:00 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 507 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` is reachable: OpenAPI 200 (`Devryno x402 Services` `1.12.2`, 41 paths), `/.well-known/x402` 200, unpaid `/pay/ping` 402. New 1.81.0 paths `/pay/replaces`, `/pay/is-replaced-by`, `/pay/conforms-to`, `/pay/access-rights`, `/pay/provenance`, and `/pay/rights-holder` currently 404 on the live origin (undeployed), as do undeployed 1.80.0 paths such as `/pay/is-format-of`. SSH could not authenticate: this environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity (`Permission denied (publickey,password)` as `root@volkov.evgeny.m2.fvds.ru`). Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) via environment setup actions. rsync/`systemctl restart x402-shop` did not run. Live catalog therefore remains 1.12.2.
- x402scan `registerFromOrigin`: succeeded (`success: true`, `registered: 34`, `failed: 0`, `skipped: 7`, `total: 41`, `source: openapi`, originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c`). Skipped the same free/claim/quote paths (`/free/merchant-feed-preview`, `/claim/merchant-feed-audit`, `/quote/merchant-feed-audit`, `/claim/base-usdc-receipt`, `/quote/base-usdc-receipt`, `/claim/base-usdc-wallet-statement`, `/quote/base-usdc-wallet-statement`). `checkDiscovery` `found: true` with 41 resources. New 1.81.0 paths will index after VPS deploy and another register.
