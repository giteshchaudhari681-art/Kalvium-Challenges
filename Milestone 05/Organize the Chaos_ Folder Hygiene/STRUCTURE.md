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
