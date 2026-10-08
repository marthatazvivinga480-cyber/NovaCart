# NovaCart application behaviour

## Pages and navigation

The storefront displays product categories, trending cards and a searchable collection. #about, #contact and #admin render dedicated pages. Header and footer links navigate between them. Shopping and account dialogs can be opened from these pages.

## Catalogue

Products are read from Firestore products/{id}. The store/catalogue record indicates that the cloud collection has been initialized. Before import, the application displays the local demo collection; after initialization, an empty cloud catalogue stays empty rather than restoring demo products automatically.

The configured owner can create, edit and delete products. Client checks control dashboard visibility; Firestore rules enforce owner-only writes and validate product fields. Customers cannot assign themselves an admin role.

Product fields include stable ID, name, category, description, rand price, image path, label, added date and optional demo rating. Editing preserves ID, date and existing rating. Prices are rounded to two decimals. New products do not receive invented ratings.

Images live in public/images/products. Saving a product checks that its selected photo loads. Image bytes are not uploaded to Firestore or Firebase Storage. Adding new local images requires a new Hosting deployment.

Import reads each demo product inside a transaction and creates only missing documents. Existing edits are preserved; previously deleted demo products can be restored by re-importing.

## Search and sort

Search trims whitespace and matches names and categories without case sensitivity. Relevance prioritizes exact names, then name prefixes, then other name matches, then categories. Other choices sort by numeric price, added date or rating. Category selection clears search. Sorting does not mutate the catalogue.

## Accounts and ownership

Firebase Authentication manages email/password registration, sign-in, sign-out and password reset. The app observes session changes and clears account-scoped shopping state when accounts change. The owner UID is a public identifier, not a password or private key.

Signed-in carts use users/{uid}/cart/{productId} with quantity. Wishlists use users/{uid}/wishlist/{productId} with saved: true. Each user can read and write only their own records. Guest cart and wishlist data remain browser-local and separate; automatic guest-to-account merging is not implemented.

The app waits for account data before accepting edits, serializes writes, and reports failures. It stops accepting further changes after a failed write until refreshed. Signing out returns to the separate guest collection.

## Shopping and demo checkout

Cart records hold product ID and quantity; names, images and prices come from the catalogue. Zero quantity removes an item. Wishlist and cart are independent. Delivery is an illustrative R75, waived at a subtotal of R1,000.

Checkout creates a browser-local demo order containing a reference, date, item snapshots and total. The order is stored before the app requests cart clearing. Demo orders are browser-scoped rather than account-scoped, and may be visible to different accounts using the same browser. They are not payment records and do not arrange delivery. Do not enter real card information.

If local order storage fails, checkout reports a failure. A later Firestore cart-clear failure is reported separately by cart synchronization and may require reconciliation; checkout is not an atomic server order operation.

Real payments require server-side price, stock and delivery validation plus verified payment-provider confirmation. A browser redirect alone must never mark an order paid. A future account-specific order feature should distinguish demonstration records from authoritative paid orders.

## Contact and content

The contact form validates required fields and previews confirmation; it does not send or store messages. About presents NovaCart’s story, mission, vision and values without fabricated customer counts or business history. Product images and ratings are illustrative.

## Accessibility and maintenance

Use Lucide icons consistently, with labels for icon-only controls. Sorting supports keyboard navigation. Account/shopping dialogs have focus handling; the admin editor uses a native modal dialog, keeps the background inert and restores focus without scrolling the product list. Reduced-motion preferences are respected by animations.

Run npm run typecheck, npm test and npm run build when relevant changes are made. Review actual desktop/mobile appearance and test deployed customer/owner access. These checks do not make the portfolio a production commerce system: real inventory, payment processing, order fulfilment and operational policies are separate work.
