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
[Describe requireRole middleware and where it was applied]

## After - Protection Confirmed

No token -> HTTP status:
Response:

Customer token -> HTTP status:
Response:

Admin token -> HTTP status:
Response:
