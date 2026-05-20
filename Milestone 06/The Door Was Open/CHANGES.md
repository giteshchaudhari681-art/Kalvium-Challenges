# Security Audit: The Door Was Open

## Investigation
Audit performed locally against `http://127.0.0.1:3000` before any route changes were made and with no `Authorization` header present.

| Route | Method | Response Before Fix | Should Have Been Blocked? |
| --- | --- | --- | --- |
| `/api/auth/register` | `POST` | `201` with `{"message":"User registered successfully!","user":{"id":101,"username":"audit_user","email":"audit@example.com"}}` | No |
| `/api/auth/login` | `POST` | `200` with `{"message":"Login successful!","token":"<jwt>"}` | No |
| `/api/health` | `GET` | `200` with `{"status":"healthy","timestamp":"..."}` | No |
| `/api/users/profile` | `GET` | `200` with `{"user":{"id":101,"username":"student_tester","email":"test@example.com"},"message":"Profile data retrieved."}` | Yes |
| `/api/users/profile` | `PUT` | `200` with `{"message":"User profile updated successfully!","updatedUser":{"id":101,"username":"student_tester","email":"new@example.com"}}` | Yes |
| `/api/posts/my-posts` | `GET` | `200` with `{"posts":[{"id":1,"title":"My first post","content":"This is a test post that should be private."},{"id":2,"title":"Secret Post","content":"This is another secret post."}],"message":"Posts retrieved."}` | Yes |
| `/api/posts/create` | `POST` | `201` with `{"message":"Post created successfully!","post":{"id":<timestamp>,"title":"Audit Title","content":"Audit content"}}` | Yes |
| `/api/admin/users` | `GET` | `200` with `{"users":[{"id":1,"username":"admin","email":"admin@example.com"},{"id":101,"username":"student_tester","email":"test@example.com"},{"id":102,"username":"another_user","email":"user@example.com"}],"message":"All user data retrieved."}` | Yes |
| `/api/admin/users/3` | `DELETE` | `200` with `{"message":"User with id 3 deleted successfully!","deletedUserId":"3"}` | Yes |

### Private route review
Each route below requires `authenticate` because an unauthenticated user should not reach it, and each successful response returns private or mutating data.

| File | Route | Method | Uses `req.user`? | Returns private or user-specific data? | Protect? |
| --- | --- | --- | --- | --- | --- |
| `routes/userRoutes.js` | `/api/users/profile` | `GET` | No | Yes | Yes |
| `routes/userRoutes.js` | `/api/users/profile` | `PUT` | No | Yes | Yes |
| `routes/postRoutes.js` | `/api/posts/my-posts` | `GET` | No | Yes | Yes |
| `routes/postRoutes.js` | `/api/posts/create` | `POST` | No | Yes | Yes |
| `routes/adminRoutes.js` | `/api/admin/users` | `GET` | No | Yes | Yes |
| `routes/adminRoutes.js` | `/api/admin/users/:id` | `DELETE` | No | Yes | Yes |

## Fix
Modified files:

- `routes/userRoutes.js`
- `routes/postRoutes.js`
- `routes/adminRoutes.js`

Routes updated with explicit route-level authentication:

- `router.get('/profile', authenticate, ...)`
- `router.put('/profile', authenticate, ...)`
- `router.get('/my-posts', authenticate, ...)`
- `router.post('/create', authenticate, ...)`
- `router.get('/users', authenticate, ...)`
- `router.delete('/users/:id', authenticate, ...)`

Route-level middleware placement matters because the route is only private when authentication runs on that exact request path before the controller executes; a filename or comment does nothing by itself.

## Verification
Post-fix verification was re-run locally against `http://127.0.0.1:3000`.

### No-token checks
Every previously exposed private route now returns:

- `401 Unauthorized`
- `{"error":"unauthorized","message":"Authentication required. No token provided."}`

Verified routes:

- `GET /api/users/profile`
- `PUT /api/users/profile`
- `GET /api/posts/my-posts`
- `POST /api/posts/create`
- `GET /api/admin/users`
- `DELETE /api/admin/users/3`

### Public route checks
These routes still work without a token:

- `POST /api/auth/register` -> `201`
- `POST /api/auth/login` -> `200`
- `GET /api/health` -> `200`

### Valid JWT checks
Using a JWT from `POST /api/auth/login`, all protected routes still succeed:

- `GET /api/users/profile` -> `200`
- `PUT /api/users/profile` -> `200`
- `GET /api/posts/my-posts` -> `200`
- `POST /api/posts/create` -> `201`
- `GET /api/admin/users` -> `200`
- `DELETE /api/admin/users/3` -> `200`

### Route scan
Route coverage was checked with a route grep after the fix. The only route definitions without `authenticate` are the intentionally public ones:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/health`

### Screenshots
Postman screenshots were not generated in the CLI environment. Capture them from your local Postman run and attach them to match the submission rubric.
