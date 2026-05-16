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
