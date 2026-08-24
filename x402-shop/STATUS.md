# CashSprint x402 shop status

- Origin: `https://volkov.evgeny.m2.fvds.ru`
- Network: Base mainnet USDC (`eip155:8453`, `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`)
- Receive wallet: `0xdD1729943bf7C408456cef52886ad12B05B57dC2`
- Shop version: `1.154.0`
- Batch date: `2026-08-24`

## New paid GET routes this batch

| Path | Price | Query | Description |
| --- | --- | --- | --- |
| `/pay/citation-eisbn-ac` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ac` Ascension-Island-edition electronic ISBNs |
| `/pay/citation-isbn-ta` | $0.002 | `url` | Highwire Press `name=citation_isbn_ta` Tristan-da-Cunha-edition ISBNs |
| `/pay/citation-eisbn-ta` | $0.002 | `url` | Highwire Press `name=citation_eisbn_ta` Tristan-da-Cunha-edition electronic ISBNs |
| `/pay/citation-isbn-gs` | $0.002 | `url` | Highwire Press `name=citation_isbn_gs` South-Georgia-and-the-South-Sandwich-Islands-edition ISBNs |
| `/pay/citation-author-icloudmsisdn` | $0.002 | `url` | Highwire Press `name=citation_author_icloudmsisdn` author iCloud MSISDN identifiers |
| `/pay/citation-author-icloudeid` | $0.002 | `url` | Highwire Press `name=citation_author_icloudeid` author iCloud EID identifiers |

These paths were not in the live catalog (`ping` … `ns`, plus live extras `offer-proof`, `commerce-page-audit`, `commerce-schema-fix`, `feed-page-match`, `feed-batch-match`, `merchant-feed-audit`), or undeployed batches `1.5.0`–`1.153.0` (`whois` … `citation-author-icloudiccid`). `/pay/citation-isbn-ac` remains Highwire citation_isbn_ac; `/pay/citation-author-icloudiccid` remains Highwire citation_author_icloudiccid; `/pay/citation-author-icloudimsi` remains Highwire citation_author_icloudimsi. Do not use `/pay/eisbn-ac` (`/pay/citation-eisbn-ac`; `/pay/citation-isbn-ac` is print AC; `/pay/citation-eisbn-sh` is eisbn SH; `/pay/citation-eisbn-io` is eisbn IO), `/pay/isbn-ta` (`/pay/citation-isbn-ta`; `/pay/citation-isbn-ac` is AC; `/pay/citation-isbn-sh` is SH; `/pay/citation-isbn-io` is IO), `/pay/eisbn-ta` (`/pay/citation-eisbn-ta`; `/pay/citation-isbn-ta` is print TA; `/pay/citation-eisbn-ac` is eisbn AC; `/pay/citation-eisbn-sh` is eisbn SH), `/pay/isbn-gs` (`/pay/citation-isbn-gs`; `/pay/citation-isbn-ta` is TA; `/pay/citation-isbn-ac` is AC; `/pay/citation-isbn-sh` is SH), `/pay/author-icloudmsisdn` (`/pay/citation-author-icloudmsisdn`; `/pay/citation-author-icloudiccid` is icloudiccid; `/pay/citation-author-icloudimsi` is icloudimsi; `/pay/citation-author-icloudmeid` is icloudmeid), or `/pay/author-icloudeid` (`/pay/citation-author-icloudeid`; `/pay/citation-author-icloudmsisdn` is icloudmsisdn; `/pay/citation-author-icloudiccid` is icloudiccid; `/pay/citation-author-icloudimsi` is icloudimsi). Remaining Highwire tags include citation_eisbn_gs, citation_isbn_pn, citation_eisbn_pn, citation_isbn_bv, citation_author_iclouduuid, and citation_author_icloudesn. Client landing files were not changed.

## Deploy / register

- Target: VPS `/opt/x402-shop` via rsync, then `systemctl restart x402-shop`
- Re-register: `public.resources.registerFromOrigin` for the origin above
- 2026-08-24 20:06 UTC run: `bun test` in `x402-shop/` is 6/6 pass (`bun` 1.4.0, 945 expects). No local shop process was started. Client landing files were not changed. Live origin `https://volkov.evgeny.m2.fvds.ru` (45.88.175.165) accepts TCP on 22/80/443 but TLS ClientHello, HTTP/80, and SSH banners hang until timeout. OpenAPI / `.well-known/x402` / unpaid `/pay/ping` were not fetched this hour. New 1.154.0 paths are therefore not live. This environment has no `VPS_SSH_PRIVATE_KEY` and no usable `~/.ssh` identity; SSH as `root@`, `ubuntu@`, and `evgeny@volkov.evgeny.m2.fvds.ru` timed out during banner exchange. Requested `VPS_SSH_PRIVATE_KEY` (optional `VPS_SSH_USER`, `VPS_SSH_HOST`) plus a restore of origin HTTPS via environment setup actions. rsync/`systemctl restart x402-shop` did not run.
- x402scan `registerFromOrigin`: failed (`success: false`, `error.type: noDiscovery`, `TimeoutError: The operation was aborted due to timeout`). `checkDiscovery` `found: false` with the same timeout. Last successful index remains originId `b2e86a98-1ff4-449d-a288-4cf445a20a4c` from 2026-08-24 19:05 UTC (live 1.13.2, 43 resources) until origin HTTPS recovers and another register runs. New 1.154.0 paths will index after VPS deploy and another register.
