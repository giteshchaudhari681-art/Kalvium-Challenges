# Baseline Measurements

Date: 2026-05-21

## Environment

- Backend: `http://localhost:3001`
- Frontend: `http://localhost:5173`
- Seeded dataset: 500 orders, 10 users, 20 products, ~1,495 order items

## Measured Baseline

- `GET /api/orders` response time: ~`1738.57 ms` on the first measured request
- `GET /api/orders` transferred size: ~`832,378 bytes` (`~812.87 KB`)
- `GET /api/orders` JSON payload size in memory: ~`1867.14 KB` (`~1.82 MB`)
- Database queries per request: `1001` inferred from the handler logic
  - `1` query for `prisma.order.findMany()`
  - `500` queries for `prisma.user.findUnique()`
  - `500` queries for `prisma.orderItem.findMany()`
- Event-loop blocking evidence:
  - While a single `/api/orders` request was running, repeated `/api/health` calls spiked as high as `380.81 ms`
  - This indicates the busy-wait loop in the request path is delaying unrelated requests

## Suspicious Findings Before Fixes

### 1. Sequential N+1 Fetching

The handler first loads all orders, then loops each order and issues:

- one `user.findUnique`
- one `orderItem.findMany(... include: { product: true })`

For 500 orders that becomes `1001` database queries. At 10,000 orders it would become `20,001` queries.

### 2. No Pagination

`/api/orders` accepts no `page` or `limit` parameters and returns every order in the database.

Observed impact:

- 500 orders already produce an `~812.87 KB` transfer
- the browser would need to parse about `~1.82 MB` of JSON
- 50,000 orders would scale linearly into a multi-megabyte response and a very slow render path

### 3. Over-fetching / Data Bloat

The response contains many fields the UI never renders.

Unused order-level fields:

- `updatedAt`
- `userId`
- `_metadata.processedAt`

Unused user fields:

- `address`
- `bio`
- `role`

Unused item-level fields:

- `id`
- `orderId`
- `productId`
- `price`

Unused product fields:

- `id`
- `description`
- `stock`
- `image`
- `categoryId`

The frontend only needs:

- order: `id`, `createdAt`, `status`, `total`
- user: `id`, `name`, `email`, `avatarUrl`
- item/product: enough to render product names and item count

### 4. Blocked Event Loop

The request handler performs a synchronous busy-wait:

```ts
while (Date.now() - start < 1) {}
```

That loop runs once for every order during `map`, so the server blocks the Node.js event loop in proportion to dataset size. Other requests stall even though they are unrelated.

### 5. No Compression

The `/api/orders` response has no `Content-Encoding` header.

Observed impact:

- `Content-Encoding`: missing
- full JSON payload is sent raw over the network
- on slower links this increases transfer time even before React starts rendering

## Frontend Notes

- The UI fetches all orders on mount with no pagination controls.
- The footer itself advertises the large payload by calling `JSON.stringify(orders).length`.
- React Profiler was not available in this CLI-only environment, but the page design and current fetch path clearly force a heavy parse + render cost on every load.