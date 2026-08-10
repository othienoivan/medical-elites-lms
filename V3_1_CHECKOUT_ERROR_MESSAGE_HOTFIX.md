# v3.1 Checkout Error Message Hotfix

Updates `createCommerceCheckout` to return the regression-safe error format:

```ts
throw new HttpsError(
  "internal",
  `Unable to create payment checkout: ${gatewayMessage}`,
);
```

## Apply

Extract into the project root, replacing `functions/src/index.ts`.

## Validate

```powershell
cd functions
npm run build
cd ..
npm test
npm run release:check
```

## Deploy

```powershell
firebase deploy --only functions:createCommerceCheckout
```
