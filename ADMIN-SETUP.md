# NovaCart admin setup

The admin dashboard and Firestore product connection are in your Desktop Nova Cart project. Your configured admin UID is `Qp14hMAgWZhaupXlBDoHh9HF3oe2`, matching the complete account identifier. This public identifier is not a password or secret. The UI check controls which dashboard appears; Firestore Security Rules enforce who can change data.

## Activate in Firebase Console

1. In VS Code open `firestore.rules` at the project root. In the Git Bash terminal, use `code firestore.rules`.
2. Copy the full file.
3. In Firebase Console open Cloud Firestore → Rules, replace the existing rules with the full file, and click Publish. These rules include your existing cart and wishlist access.
4. Refresh NovaCart and sign in using the account with the configured UID.
5. Click Admin dashboard in the header, or open `#admin` on your current local website URL.
6. Click Import demo collection, then Import missing products. This creates the 17 product documents and the store/catalogue initialization record. It preserves existing edited documents. Re-importing can restore deleted demo products.
7. Edit one price and save; check the storefront, refresh, and confirm the price remains.

If the account says Customer or Owner access only, compare the full UID in Authentication → Users with the configured UID. Do not shorten or guess it. If they differ, update both `src/lib/admin-config.ts` and `firestore.rules`, and publish the corrected rules.

If the catalogue reports an error, publish the whole rules file and refresh. The old rules denied reads to the new store/catalogue record. Publishing is required; saving the local file alone does not update Firebase.

## Product images

Images remain in `public/images/products`. Firestore stores their paths, not their image bytes. New photos must first be added to that folder, then selected or entered in the dashboard using a path such as `/images/products/my-necklace.jpg`. Deploy again to make newly added files available on the hosted website. A product save checks that the image can load locally.

The first import preserves the existing p1–p17 product IDs so carts and wishlists continue to refer to the same products. Your earlier browser-only uploaded products are not automatically imported or removed from browser storage.

## Access checks before publishing the website

- Signed-out visitor: can browse products, cannot change products or load private carts.
- Customer: can use their own cart and wishlist; opening #admin shows Owner access only.
- Owner UID: can add, edit and delete products.
- In Firestore Rules playground, simulate a products write as an ordinary customer: denied. Simulate a valid product write with the configured owner UID: allowed.
- In Rules playground, simulate reading another user's cart: denied.

TypeScript/build checks and local product validation tests do not prove deployed Security Rules are active. Confirm the rules in the console and test real customer/owner access after publication.

## Current limits

Orders remain browser-local demo orders; there are no real payments or message sending. The hero still uses a watermarked stock preview and must be replaced with a licensed image before public deployment. This work does not deploy the website or change your remote rules automatically.

Firebase rule reference: https://firebase.google.com/docs/firestore/security/rules-fields
