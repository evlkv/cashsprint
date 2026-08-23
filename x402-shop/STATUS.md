# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.136.0`
- Batch date: `2026-08-23`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-vc` | $0.002 | `url` | Highwire Press `name=citation_eisbn_vc` Saint Vincent-edition electronic ISBNs |
| `/pay/citation-isbn-ag` | $0.002 | `url` | Highwire Press `name=citation_isbn_ag` Antigua-edition ISBNs |
| `/pay/citation-eisbn-ag` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ag` Antigua-edition electronic ISBNs |
| `/pay/citation-isbn-kn` | $0.002 | `url` | Highwire Press `name=citation_isbn_kn` Saint Kitts-edition ISBNs |
| `/pay/citation-author-gmail` | $0.002 | `url` | Highwire Press `name=citation_author_gmail` author Gmail identifiers |
| `/pay/citation-author-live` | $0.002 | `url` | Highwire Press `name=citation_author_live` author Microsoft Live identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.135.0` (`whois` … `citation-author-hotmail`). `/pay/citation-isbn-vc` remains Highwire citation_isbn_vc; `/pay/citation-eisbn-gd` remains Highwire citation_eisbn_gd; `/pay/citation-author-hotmail` remains Highwire citation_author_hotmail; `/pay/citation-author-aol` remains Highwire citation_author_aol. Do not use `/pay/eisbn-vc` (`/pay/citation-eisbn-vc`; `/pay/citation-isbn-vc` is print VC; `/pay/citation-eisbn-gd` is eisbn GD; `/pay/citation-eisbn-lc` is eisbn LC; `/pay/citation-eisbn-bs` is eisbn BS), `/pay/isbn-ag` (`/pay/citation-isbn-ag`; `/pay/citation-isbn-vc` is VC; `/pay/citation-isbn-gd` is GD; `/pay/citation-isbn-lc` is LC; `/pay/citation-isbn-bs` is BS), `/pay/eisbn-ag` (`/pay/citation-eisbn-ag`; `/pay/citation-isbn-ag` is print AG; `/pay/citation-eisbn-vc` is eisbn VC; `/pay/citation-eisbn-gd` is eisbn GD), `/pay/isbn-kn` (`/pay/citation-isbn-kn`; `/pay/citation-isbn-ag` is AG; `/pay/citation-isbn-vc` is VC; `/pay/citation-isbn-gd` is GD), `/pay/author-gmail` (`/pay/citation-author-gmail`; `/pay/citation-author-hotmail` is hotmail; `/pay/citation-author-aol` is aol; `/pay/citation-author-msn` is msn; `/pay/citation-author-yahoo` is yahoo), or `/pay/author-live` (`/pay/citation-author-live`; `/pay/citation-author-gmail` is gmail; `/pay/citation-author-hotmail` is hotmail; `/pay/citation-author-aol` is aol). Remaining Highwire tags include citation_eisbn_kn, citation_isbn_dm, citation_eisbn_dm, citation_isbn_ky, citation_author_outlook, and citation_author_icloud. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-23 23:03 UTC run: pending tests, deploy, and register.
