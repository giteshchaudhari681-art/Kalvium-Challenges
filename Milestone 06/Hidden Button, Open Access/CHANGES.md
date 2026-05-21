# ShopAdmin - Authorization Audit

## The Gap
The missing backend authorization check was in `backend/routes/products.js:58`, `backend/routes/products.js:88`, `backend/routes/products.js:123`, and `backend/routes/products.js:149`, where the create, update, delete, and publish routes used `verifyToken` but never checked `req.user.role` before executing the handler. Because `backend/middleware/auth.js` only verified that the JWT was valid, any logged-in customer with a legitimate token could call those write endpoints directly and the handler still ran.

## Before - Bypass Proof
The app uses Prisma `cuid()` IDs, so the exploit proof below uses real seeded product IDs instead of the numeric examples from the prompt.

Customer login response used to obtain the token:

```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@shopadmin.com","password":"password123"}'
```

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtcGZrenA5NTAwMDFlaDhkN2tzazN0cGUiLCJlbWFpbCI6ImN1c3RvbWVyQHNob3BhZG1pbi5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJuYW1lIjoiQ3VzdG9tZXIgVXNlciIsImlhdCI6MTc3OTM3MzQ3NywiZXhwIjoxNzc5OTc4Mjc3fQ.3YzJolxXfw6lfIPi_NoMHvY7h59U_rbMiqjixKTfriQ",
  "user": {
    "id": "cmpfkzp950001eh8d7ksk3tpe",
    "email": "customer@shopadmin.com",
    "role": "customer",
    "name": "Customer User"
  }
}
```

Delete as customer:

```bash
curl -i -X DELETE "http://localhost:3001/api/products/cmpfkzp9c0002eh8d807e7ym2" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtcGZrenA5NTAwMDFlaDhkN2tzazN0cGUiLCJlbWFpbCI6ImN1c3RvbWVyQHNob3BhZG1pbi5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJuYW1lIjoiQ3VzdG9tZXIgVXNlciIsImlhdCI6MTc3OTM3MzQ3NywiZXhwIjoxNzc5OTc4Mjc3fQ.3YzJolxXfw6lfIPi_NoMHvY7h59U_rbMiqjixKTfriQ"
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"success":true,"message":"Product deleted","deleted":{"id":"cmpfkzp9c0002eh8d807e7ym2","name":"Noise-Cancelling Headphones"}}
```

Publish as customer:

```bash
curl -i -X PATCH "http://localhost:3001/api/products/cmpfkzp9k0005eh8dznbjbj86/publish" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtcGZrenA5NTAwMDFlaDhkN2tzazN0cGUiLCJlbWFpbCI6ImN1c3RvbWVyQHNob3BhZG1pbi5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJuYW1lIjoiQ3VzdG9tZXIgVXNlciIsImlhdCI6MTc3OTM3MzQ3NywiZXhwIjoxNzc5OTc4Mjc3fQ.3YzJolxXfw6lfIPi_NoMHvY7h59U_rbMiqjixKTfriQ"
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"id":"cmpfkzp9k0005eh8dznbjbj86","name":"Mechanical Keyboard — Compact 75%","description":"Hot-swappable switches, RGB backlight, and aluminium frame. Not yet released.","price":139,"category":"Electronics","published":true,"createdAt":"2026-05-21T14:23:39.177Z","updatedAt":"2026-05-21T14:25:24.569Z"}
```

Customer UI check:

- Logged into `http://localhost:5173/login` as `customer@shopadmin.com`.
- Headless browser result after redirect to `/products`: `deleteButtons = 0`, `publishButtons = 0`.
- The JSX guard is in `frontend/src/components/ProductActions.jsx:19`.

```jsx
if (user?.role !== 'admin') {
  return null;
}
```

## The Fix
I added `backend/middleware/requireRole.js` and applied it after `verifyToken` on all four write routes in `backend/routes/products.js`.

- `verifyToken` handles authentication: it checks the JWT and populates `req.user`.
- `requireRole('admin')` handles authorization: it trusts `req.user` from `verifyToken` and blocks the request with `403` before the handler runs if the role is not allowed.
- The protected routes are now `POST /api/products`, `PUT /api/products/:id`, `DELETE /api/products/:id`, and `PATCH /api/products/:id/publish`, each with the middleware chain `verifyToken, requireRole('admin')`.
- The read routes `GET /api/products` and `GET /api/products/:id` still use `verifyToken` only.

Middleware code:

```js
function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(403).json({
        error: 'Forbidden: insufficient permissions',
        required: roles,
        yourRole: null,
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'Forbidden: insufficient permissions',
        required: roles,
        yourRole: req.user.role,
      });
    }

    next();
  };
}

module.exports = { requireRole };
```

## After - Protection Confirmed

Customer token, same delete command as before:

```bash
curl -i -X DELETE "http://localhost:3001/api/products/cmpfkzp9c0002eh8d807e7ym2" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtcGZrenA5NTAwMDFlaDhkN2tzazN0cGUiLCJlbWFpbCI6ImN1c3RvbWVyQHNob3BhZG1pbi5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJuYW1lIjoiQ3VzdG9tZXIgVXNlciIsImlhdCI6MTc3OTM3MzQ3NywiZXhwIjoxNzc5OTc4Mjc3fQ.3YzJolxXfw6lfIPi_NoMHvY7h59U_rbMiqjixKTfriQ"
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"error":"Forbidden: insufficient permissions","required":["admin"],"yourRole":"customer"}
```

Customer token, same publish command as before:

```bash
curl -i -X PATCH "http://localhost:3001/api/products/cmpfkzp9k0005eh8dznbjbj86/publish" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtcGZrenA5NTAwMDFlaDhkN2tzazN0cGUiLCJlbWFpbCI6ImN1c3RvbWVyQHNob3BhZG1pbi5jb20iLCJyb2xlIjoiY3VzdG9tZXIiLCJuYW1lIjoiQ3VzdG9tZXIgVXNlciIsImlhdCI6MTc3OTM3MzQ3NywiZXhwIjoxNzc5OTc4Mjc3fQ.3YzJolxXfw6lfIPi_NoMHvY7h59U_rbMiqjixKTfriQ"
```

```http
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{"error":"Forbidden: insufficient permissions","required":["admin"],"yourRole":"customer"}
```

Admin token:

```bash
curl -i -X DELETE "http://localhost:3001/api/products/cmpfkzp9f0003eh8d0ntf2hkd" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6ImNtcGZrenA3NjAwMDBlaDhkejV0djczbjciLCJlbWFpbCI6ImFkbWluQHNob3BhZG1pbi5jb20iLCJyb2xlIjoiYWRtaW4iLCJuYW1lIjoiQWRtaW4gVXNlciIsImlhdCI6MTc3OTM3MzQ3NywiZXhwIjoxNzc5OTc4Mjc3fQ.mAKLGLe_NSm7YrncmjLTY8wCtoTIGm8v2Pb-yb1x4tU"
```

```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{"success":true,"message":"Product deleted","deleted":{"id":"cmpfkzp9f0003eh8d0ntf2hkd","name":"Ergonomic Office Chair"}}
```

No token:

```bash
curl -i -X DELETE "http://localhost:3001/api/products/cmpfkzp9h0004eh8d9l9hr279"
```

```http
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{"error":"No token provided"}
```

Protection matrix:

| Request | Token | Expected | Actual |
| --- | --- | --- | --- |
| `DELETE /api/products/cmpfkzp9c0002eh8d807e7ym2` | None | `401` | `401` |
| `DELETE /api/products/cmpfkzp9c0002eh8d807e7ym2` | Customer | `403` | `403` |
| `DELETE /api/products/cmpfkzp9f0003eh8d0ntf2hkd` | Admin | `200` | `200` |
| `GET /api/products` | None | `401` | `401` |
| `GET /api/products` | Customer | `200` | `200` |
| `GET /api/products` | Admin | `200` | `200` |
