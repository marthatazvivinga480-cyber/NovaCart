# NovaCart

A React and TypeScript shopping portfolio with Firebase Authentication, a Firestore product catalogue, and a store-owner dashboard.

## Features

- Jewellery, ladies’ wear, kids’ wear, sneakers, denim and phones.
- Product search, category filters, relevance/price/newest/rating sorting, and product details.
- Dedicated About and Contact pages.
- Email/password registration, login, logout and password reset.
- Account-specific carts and wishlists synced through Firestore; guest shopping stays in the browser.
- Owner-only product management with add, edit, delete and demo-catalogue import.
- Compact cart, quantity controls and removal.
- Demo checkout and browser-local order history. No real payments or fulfilment.
- Lucide icons, NovaCart SVG logo, reduced-motion support and responsive layouts.

## Local setup

Use Node.js 24. From the folder containing package.json:

```bash
npm install
npm run dev
```

Open the URL printed by Vite. If its preferred port is occupied, Vite chooses another port.

Copy .env.example to .env and enter the Firebase web configuration for your project. Restart the dev server after environment changes. See FIREBASE-SETUP.md and ADMIN-SETUP.md for service and security-rule setup.

## Checks

```bash
npm run typecheck
npm test
npm run build
```

Review the running website on desktop and mobile before deployment. Local tests cover shopping helpers, product input validation and the admin UI identity check; they do not replace testing deployed Firestore rules.

## Project structure

- src/App.tsx: application state, page navigation and shopping dialogs.
- src/components/: storefront, account forms, About, Contact and admin dashboard.
- src/data/catalogue.ts: demo collection and category imagery.
- src/lib/: shopping persistence, Firestore catalogue, product validation and admin identity.
- src/firebase.ts: Firebase client initialization.
- src/*.css: page layouts, colours and responsive styling.
- public/images/: local product and hero photographs.
- public/novacart-logo.svg: NovaCart logo.
- firestore.rules: database access controls.
- firebase.json: Hosting and rules configuration.

## Product management

After signing in with the configured owner account, open Admin dashboard. Import the demo collection once, then add, edit or delete products. Product IDs stay stable when editing so saved carts and wishlists retain their references.

Photos are local files. Firestore stores image paths such as /images/products/my-photo.jpg. Add a new image to public/images/products before saving that path in the dashboard; deploy again to include new files on the hosted website. Firebase Storage uploads are not implemented.

The import adds missing demo documents without overwriting existing ones. Re-importing can restore deleted demo products.

## Demo scope and assets

Prices and ratings are examples. New products have no rating by default. Contact messages are previews and are not sent or stored. Demo orders remain in the browser and are not paid orders.

Photographs are third-party assets selected for demonstration; their licenses still apply. The current hero-boutique-warm.jpg is a watermarked stock preview and must be replaced by a licensed or freely permitted image before public deployment. Inter typography is loaded from Google Fonts.

Keep .env, node_modules and build output out of source control. Never place service-account keys, passwords or payment-provider secret keys in frontend files. Owner identity in the UI is not the security boundary: the deployed Firestore rules must enforce it.
