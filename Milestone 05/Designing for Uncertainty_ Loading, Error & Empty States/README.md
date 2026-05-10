# ShopDash

ShopDash is a React e-commerce dashboard with intentional loading, error, and empty states across all data-fetching screens.

## Covered Screens

- Dashboard Overview
- Orders
- Products
- Customers

## State Audit

- See [STATES-AUDIT.md](./STATES-AUDIT.md)

## Screenshot Proof

- Orders loading: [screenshots/orders-loading.png](./screenshots/orders-loading.png)
- Orders error: [screenshots/orders-error.png](./screenshots/orders-error.png)
- Orders empty: [screenshots/orders-empty.png](./screenshots/orders-empty.png)
- Products loading: [screenshots/products-loading.png](./screenshots/products-loading.png)
- Products error: [screenshots/products-error.png](./screenshots/products-error.png)
- Products empty: [screenshots/products-empty.png](./screenshots/products-empty.png)
- Orders state sketch: [screenshots/orders-states-sketch.svg](./screenshots/orders-states-sketch.svg)

## Test State Scenarios

Use the normal routes for loading states because the mock API already waits before resolving.

Use query params to force non-happy-path states:

- `/orders?ordersState=error`
- `/orders?ordersState=empty`
- `/products?productsState=error`
- `/products?productsState=empty`
- `/customers?customersState=error`
- `/customers?customersState=empty`
- `/dashboard?dashboardState=error`
- `/dashboard?dashboardState=empty`

## Live Deployment

- https://giteshchaudhari681-art.github.io/Project-Engineering/
