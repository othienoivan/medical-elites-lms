# RC4 Batch 2 Wallet and Ledger Specification

## Source of truth
Posted journals and their ledger entries are immutable. Wallet balance fields are server-maintained projections for fast reads; they are never authoritative and cannot be written by browser clients.

## Idempotency
Every financial command requires an idempotency key. A completed key cannot create a second journal, wallet, commission rule, or withdrawal.

## Money
Amounts are positive safe integers and always carry an ISO 4217 currency code. Cross-currency journals are forbidden.

## Accounting periods
Every journal and ledger entry is tagged `YYYY-MM`. Closing and locking periods is reserved for a later finance administration release.

## Commission precedence
Course > Tutor > Institution > Global. Percentages must total exactly 100.

## Withdrawal lifecycle
requested -> approved -> processing -> paid. Requests may instead be rejected or cancelled. Payment-provider transfer is introduced in RC4 Batch 3.
