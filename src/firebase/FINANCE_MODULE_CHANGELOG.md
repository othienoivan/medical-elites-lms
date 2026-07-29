# Medical Elites LMS — Finance Module

## Added
- Tutor Finance Management workspace at `/tutor/finance`
- Student fees statement at `/finance`
- Programme-specific fee structures and fee items
- Student invoice generation
- Discounts, scholarships/bursaries and penalties
- Payment recording and automatic receipt numbers
- Outstanding balance and financial-clearance tracking
- Printable student statements and payment history
- Student notifications for invoices and payments
- Firestore rules for finance records

## Collections
- `feeStructures`
- `studentInvoices`
- `financePayments`

## Installation
1. Copy files into their matching project folders.
2. Run `firebase deploy --only firestore:rules`.
3. Restart with `npm run dev`.
