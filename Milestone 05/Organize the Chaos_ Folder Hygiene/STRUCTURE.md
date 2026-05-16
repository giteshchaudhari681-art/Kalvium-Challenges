# ShopFlat Structure Plan

## Current State

- `src/App.jsx`
- `src/Button.jsx`
- `src/CartItem.jsx`
- `src/cartService.js`
- `src/CartSummary.jsx`
- `src/CheckoutModal.jsx`
- `src/Dashboard.jsx`
- `src/EmptyState.jsx`
- `src/ErrorMessage.jsx`
- `src/formatCurrency.js`
- `src/index.css`
- `src/LoginForm.jsx`
- `src/loginService.js`
- `src/LogoutButton.jsx`
- `src/main.jsx`
- `src/Modal.jsx`
- `src/Navbar.jsx`
- `src/OrderCard.jsx`
- `src/OrdersList.jsx`
- `src/ordersService.js`
- `src/ProductCard.jsx`
- `src/ProductList.jsx`
- `src/productsService.js`
- `src/Spinner.jsx`
- `src/truncateText.js`
- `src/useCart.js`
- `src/useDebounce.js`
- `src/useLogin.js`
- `src/useProducts.js`

## Time-to-find Estimate

A new engineer would probably need 20 to 30 minutes to confidently find the cart checkout logic. The checkout flow is split across `CartSummary.jsx`, `CheckoutModal.jsx`, `useCart.js`, and `cartService.js`, but the flat `src/` folder gives no signal about which cart files are page-level UI, which ones are state logic, and which one actually submits the order.

## Move Plan Mapping

- `src/App.jsx` -> `src/App.jsx`
- `src/Button.jsx` -> `src/components/Button.jsx` shared UI used by auth, cart, and products
- `src/CartItem.jsx` -> `src/features/cart/CartItem.jsx`
- `src/cartService.js` -> `src/features/cart/cartService.js`
- `src/CartSummary.jsx` -> `src/features/cart/CartSummary.jsx`
- `src/CheckoutModal.jsx` -> `src/features/cart/CheckoutModal.jsx`
- `src/Dashboard.jsx` -> `src/features/orders/Dashboard.jsx`
- `src/EmptyState.jsx` -> `src/components/EmptyState.jsx` shared UI used by cart and orders
- `src/ErrorMessage.jsx` -> `src/components/ErrorMessage.jsx` shared UI used by products and orders
- `src/formatCurrency.js` -> `src/utils/formatCurrency.js` shared utility used by cart, products, and orders
- `src/index.css` -> `src/index.css`
- `src/LoginForm.jsx` -> `src/features/auth/LoginForm.jsx`
- `src/loginService.js` -> `src/features/auth/loginService.js`
- `src/LogoutButton.jsx` -> `src/components/LogoutButton.jsx` shared navigation UI
- `src/main.jsx` -> `src/main.jsx`
- `src/Modal.jsx` -> `src/components/Modal.jsx` shared UI shell
- `src/Navbar.jsx` -> `src/components/Navbar.jsx` shared app-shell navigation
- `src/OrderCard.jsx` -> `src/features/orders/OrderCard.jsx`
- `src/OrdersList.jsx` -> `src/features/orders/OrdersList.jsx`
- `src/ordersService.js` -> `src/features/orders/ordersService.js`
- `src/ProductCard.jsx` -> `src/features/products/ProductCard.jsx`
- `src/ProductList.jsx` -> `src/features/products/ProductList.jsx`
- `src/productsService.js` -> `src/features/products/productsService.js`
- `src/Spinner.jsx` -> `src/components/Spinner.jsx` shared loading UI used by auth, products, and orders
- `src/truncateText.js` -> `src/utils/truncateText.js` shared utility
- `src/useCart.js` -> `src/features/cart/useCart.js`
- `src/useDebounce.js` -> `src/hooks/useDebounce.js` shared hook used by product search
- `src/useLogin.js` -> `src/features/auth/useLogin.js`
- `src/useProducts.js` -> `src/features/products/useProducts.js`

## Target Folder Tree

```text
src/
├── features/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── loginService.js
│   │   └── useLogin.js
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── cartService.js
│   │   ├── CartSummary.jsx
│   │   ├── CheckoutModal.jsx
│   │   └── useCart.js
│   ├── orders/
│   │   ├── Dashboard.jsx
│   │   ├── OrderCard.jsx
│   │   ├── OrdersList.jsx
│   │   └── ordersService.js
│   └── products/
│       ├── ProductCard.jsx
│       ├── ProductList.jsx
│       ├── productsService.js
│       └── useProducts.js
├── components/
│   ├── Button.jsx
│   ├── EmptyState.jsx
│   ├── ErrorMessage.jsx
│   ├── LogoutButton.jsx
│   ├── Modal.jsx
│   ├── Navbar.jsx
│   └── Spinner.jsx
├── hooks/
│   └── useDebounce.js
├── services/
│   └── apiClient.js
├── utils/
│   ├── formatCurrency.js
│   └── truncateText.js
├── App.jsx
├── index.css
└── main.jsx
```

## Final Folder Tree

```text
src/
├── App.jsx
├── index.css
├── main.jsx
├── components/
│   ├── Button.jsx
│   ├── EmptyState.jsx
│   ├── ErrorMessage.jsx
│   ├── LogoutButton.jsx
│   ├── Modal.jsx
│   ├── Navbar.jsx
│   └── Spinner.jsx
├── features/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── loginService.js
│   │   └── useLogin.js
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── cartService.js
│   │   ├── CartSummary.jsx
│   │   ├── CheckoutModal.jsx
│   │   └── useCart.js
│   ├── orders/
│   │   ├── Dashboard.jsx
│   │   ├── OrderCard.jsx
│   │   ├── OrdersList.jsx
│   │   └── ordersService.js
│   └── products/
│       ├── ProductCard.jsx
│       ├── ProductList.jsx
│       ├── productsService.js
│       └── useProducts.js
├── hooks/
│   └── useDebounce.js
├── services/
│   └── apiClient.js
└── utils/
    ├── formatCurrency.js
    └── truncateText.js
```

## Folder Rules

`src/features/auth/` contains files that only exist to authenticate a user. A file belongs here if removing the login flow would make that file irrelevant. In ShopFlat that means `LoginForm.jsx`, `useLogin.js`, and `loginService.js`.

`src/features/cart/` contains files that only exist to build, persist, display, or submit the shopping cart. A file belongs here if it is part of cart state, line items, cart totals, or checkout submission. In ShopFlat that means `CartItem.jsx`, `CartSummary.jsx`, `CheckoutModal.jsx`, `useCart.js`, and `cartService.js`.

`src/features/products/` contains files that only exist to fetch, filter, or render products. A file belongs here if it is part of the catalog browsing experience and would not be reused by orders or auth. In ShopFlat that means `ProductList.jsx`, `ProductCard.jsx`, `useProducts.js`, and `productsService.js`.

`src/features/orders/` contains files that only exist to show order history and the orders dashboard. A file belongs here if it reads or presents past-order data for the signed-in user. In ShopFlat that means `Dashboard.jsx`, `OrdersList.jsx`, `OrderCard.jsx`, and `ordersService.js`.

`src/components/` contains reusable presentational or shell components that support multiple features or the whole app. A file belongs here if two or more features can use it without bringing feature-specific state with it. In ShopFlat that includes `Button.jsx`, `Spinner.jsx`, `Modal.jsx`, `EmptyState.jsx`, `ErrorMessage.jsx`, `Navbar.jsx`, and `LogoutButton.jsx`.

`src/hooks/` contains shared React hooks that are not owned by one feature. A file belongs here if it encapsulates reusable React behavior that another feature could import directly. In ShopFlat that is `useDebounce.js`.

`src/utils/` contains pure helper functions with no React and no app-side effects. A file belongs here if it transforms values and can be safely reused anywhere. In ShopFlat those are `formatCurrency.js` and `truncateText.js`.

`src/services/` contains shared infrastructure used by multiple features to talk to external systems or central APIs. A file belongs here if it is lower-level plumbing rather than feature behavior. In ShopFlat that is `apiClient.js`.

The root `src/` files are the app entrypoints and global styling. A file belongs at the root only if it bootstraps the app or must remain globally loaded. In ShopFlat those files are `App.jsx`, `main.jsx`, and `index.css`.

## Decision Tree

1. Does this file exist for exactly one business feature such as auth, cart, products, or orders? If yes, put it in that feature folder.
2. If not, is it a reusable UI building block or app-shell component that multiple features can import without owning business logic? If yes, put it in `src/components/`.
3. If not, is it a shared React hook, a pure utility, or a low-level service? Put shared hooks in `src/hooks/`, pure helpers in `src/utils/`, and API infrastructure in `src/services/`.
4. If none of the above applies, ask whether the file bootstraps the entire app. Only app entrypoints and global CSS stay at the root of `src/`.

## Adding a New Feature

1. Create a new folder inside `src/features/` using the feature name, for example `src/features/wishlist/`.
2. Add the feature’s route-level UI, internal components, local hooks, and feature service files to that folder, for example `WishlistPage.jsx`, `WishlistItem.jsx`, `useWishlist.js`, and `wishlistService.js`.
3. Import shared UI only from `src/components/`, shared hooks only from `src/hooks/`, shared helpers only from `src/utils/`, and shared API plumbing only from `src/services/`.
4. Update `src/App.jsx` to import the new feature’s route entry from `src/features/<feature-name>/`.
5. If a file starts getting reused outside the new feature, move it out of the feature folder into the correct shared folder and update imports immediately.
6. Add the new files to the tree and mapping in `STRUCTURE.md` so the architecture stays documented.

## Before vs After

Before this refactor, ShopFlat stored every component, hook, service, and helper in one flat `src/` directory. A new engineer could see all filenames, but not the relationships between them, so finding the cart checkout flow meant guessing between multiple similarly named files and opening several of them one by one.

After this refactor, each business capability has a clear home under `src/features/`, while shared code is separated into `components`, `hooks`, `utils`, and `services`. The checkout logic is now much easier to find because the entire cart flow lives in `src/features/cart/`, and the order history page is equally obvious inside `src/features/orders/`.
