# NovaCart Firebase setup

NovaCart connects email/password accounts, products, carts and wishlists to Firebase. Checkout and order history remain a browser-local demo.

## Web configuration

In Firebase Console, open Project settings → General → Your apps → your web app → Config. Use those values in the root .env file:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Enter values after the equals signs. Save and restart npm run dev. The Firebase web configuration is included in the built browser application; never use frontend environment variables for admin private keys or payment-provider secrets. .env is excluded from Git; .env.example contains empty fields.

## Authentication

Enable Email/Password in Authentication → Sign-in method. NovaCart supports registration, sign-in, sign-out and password reset. For your deployed domain, check Authentication → Settings → Authorized domains. Account credentials are managed by Firebase Authentication.

## Firestore

Create a Standard Firestore database in production mode. Open firestore.rules in VS Code, copy its complete contents into Cloud Firestore → Rules, then Publish. Confirm the owner UID in the rules matches src/lib/admin-config.ts and the full UID in Authentication → Users. Saving a local rules file alone does not change the deployed rules.

Public visitors can read products and the catalogue initialization record. Only the configured owner can change products. Each signed-in account can access only its own cart and wishlist. Other paths remain denied.

See ADMIN-SETUP.md to import and manage the demo catalogue. Photos remain in public/images; Firestore contains their file paths. Firebase Storage is not required for the current local-image approach.

## Hosting

From the NovaCart project folder:

```bash
npm run build
npx firebase-tools login
npx firebase-tools deploy --only hosting --project YOUR_PROJECT_ID
```

Replace YOUR_PROJECT_ID with the Firebase project ID, not the display name. firebase.json serves dist and includes a single-page-app rewrite. The deploy command prints the hosted URL. Add that domain to Authentication’s Authorized domains if needed, and check login there.

To publish the saved rules through the CLI instead of the console:

```bash
npx firebase-tools deploy --only firestore:rules --project YOUR_PROJECT_ID
```

Before deployment, verify the local rules contain the current owner UID. Build again whenever source files or .env values change. Redeploy Hosting after adding images or changing the frontend.

## Verification

- Sign in; save a cart item and a wishlist heart; refresh and check persistence.
- Use the owner dashboard to change a price; refresh and verify the storefront update.
- A customer opening #admin must see Owner access only.
- Test Firestore rules to deny customer product writes and access to another account’s cart/wishlist.
- Check the public URL, page navigation, narrow layouts and product-image loading.
- Replace the watermarked hero with a permitted image before publishing publicly.

Orders, real payments and message sending are not connected to Firebase in this version. They need separate implementation and validation.

Official documentation: https://firebase.google.com/docs/hosting/quickstart and https://firebase.google.com/docs/firestore/security/rules-conditions
