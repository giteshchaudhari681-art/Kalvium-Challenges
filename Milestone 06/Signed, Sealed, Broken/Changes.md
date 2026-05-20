# Vulnerability Audit

Pre-fix route audit against every sensitive route.

## No Token

| Route | Status | Data returned? | Was a valid token required? |
| --- | --- | --- | --- |
| `GET /api/tasks` | `500` | JSON error: `{"message":"Cannot read properties of undefined (reading 'id')"}` | No. Request reached the controller and failed only because `req.user` was missing. |
| `POST /api/tasks` | `500` | JSON error: `{"message":"Cannot read properties of undefined (reading 'id')"}` | No. Request reached the controller without auth. |
| `GET /api/tasks/:id` | `200` | Full task document returned | No. Endpoint was fully public. |
| `PUT /api/tasks/:id` | `200` | Updated task document returned | No. Endpoint accepted unauthenticated writes. |
| `DELETE /api/tasks/:id` | `200` | `{"message":"Task deleted"}` | No. Endpoint accepted unauthenticated deletes. |
| `GET /api/admin/users` | `200` | Full user list returned | No. Endpoint was fully public. |
| `DELETE /api/admin/users/:id` | `200` | `{"message":"User deleted"}` | No. Endpoint accepted unauthenticated deletes. |

## Fake Token In `Authorization: Bearer thisisnotavalidtoken`

| Route | Status | Data returned? | Was a valid token required? |
| --- | --- | --- | --- |
| `GET /api/tasks` | `500` | JSON error: `{"message":"Cannot read properties of undefined (reading 'id')"}` | No. Fake bearer token was ignored by middleware. |
| `POST /api/tasks` | `500` | JSON error: `{"message":"Cannot read properties of undefined (reading 'id')"}` | No. Fake bearer token was ignored by middleware. |
| `GET /api/tasks/:id` | `200` | Full task document returned | No. Endpoint was fully public. |
| `PUT /api/tasks/:id` | `200` | Updated task document returned | No. Endpoint accepted unauthenticated writes. |
| `DELETE /api/tasks/:id` | `200` | `{"message":"Task deleted"}` | No. Endpoint accepted unauthenticated deletes. |
| `GET /api/admin/users` | `200` | Full user list returned | No. Endpoint was fully public. |
| `DELETE /api/admin/users/:id` | `200` | `{"message":"User deleted"}` | No. Endpoint accepted unauthenticated deletes. |

## Expired Token In `Authorization: Bearer <expired-jwt>`

| Route | Status | Data returned? | Was a valid token required? |
| --- | --- | --- | --- |
| `GET /api/tasks` | `500` | JSON error: `{"message":"Cannot read properties of undefined (reading 'id')"}` | No. Expired bearer token was ignored by middleware. |
| `POST /api/tasks` | `500` | JSON error: `{"message":"Cannot read properties of undefined (reading 'id')"}` | No. Expired bearer token was ignored by middleware. |
| `GET /api/tasks/:id` | `200` | Full task document returned | No. Endpoint was fully public. |
| `PUT /api/tasks/:id` | `200` | Updated task document returned | No. Endpoint accepted unauthenticated writes. |
| `DELETE /api/tasks/:id` | `200` | `{"message":"Task deleted"}` | No. Endpoint accepted unauthenticated deletes. |
| `GET /api/admin/users` | `200` | Full user list returned | No. Endpoint was fully public. |
| `DELETE /api/admin/users/:id` | `200` | `{"message":"User deleted"}` | No. Endpoint accepted unauthenticated deletes. |

# Root Cause Analysis

## Bug 1: Broken Token Generation

File: [controllers/authController.js](/d:/Challenges/challenge%207.3/Milestone%2006/Signed,%20Sealed,%20Broken/controllers/authController.js:30)

Broken code before the fix:

```js
const token = jwt.sign(
    { id: user._id },
    'mysecretkey',
);
```

What was wrong:

- The payload only contained `id`, not `userId`, `email`, and `role`.
- The secret was hardcoded as `'mysecretkey'` instead of `process.env.JWT_SECRET`.
- No `expiresIn` option was set, so tokens never expired.

Why it caused the symptom:

- Tokens created by login could not support reliable downstream authorization checks because the role and email claims were missing.
- The hardcoded secret made verification depend on a different value than the configured environment secret.
- Tokens remained valid indefinitely unless manually revoked.

## Bug 2: Middleware Read The Wrong Header

File: [middleware/authMiddleware.js](/d:/Challenges/challenge%207.3/Milestone%2006/Signed,%20Sealed,%20Broken/middleware/authMiddleware.js:4)

Broken code before the fix:

```js
const token = req.headers.token;
```

What was wrong:

- The middleware ignored `req.headers.authorization`.
- It never stripped the `Bearer ` prefix.

Why it caused the symptom:

- Requests that sent `Authorization: Bearer ...` looked unauthenticated to the middleware.
- Even a valid token sent in the standard header was effectively invisible.

## Bug 3: Verification Failures Fell Through To `next()`

File: [middleware/authMiddleware.js](/d:/Challenges/challenge%207.3/Milestone%2006/Signed,%20Sealed,%20Broken/middleware/authMiddleware.js:10)

Broken code before the fix:

```js
try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
} catch (err) {
    next();
}
```

What was wrong:

- The catch block called `next()` instead of sending an auth failure response.
- Missing, fake, malformed, and expired tokens all continued into route handlers.

Why it caused the symptom:

- Protected routes either ran normally with no token or crashed inside controllers when they expected `req.user`.
- Invalid tokens did not stop request execution, which is the core auth bypass.

## Bug 4: Sensitive Routes Were Missing Protection

Files:

- [routes/taskRoutes.js](/d:/Challenges/challenge%207.3/Milestone%2006/Signed,%20Sealed,%20Broken/routes/taskRoutes.js:12)
- [routes/adminRoutes.js](/d:/Challenges/challenge%207.3/Milestone%2006/Signed,%20Sealed,%20Broken/routes/adminRoutes.js:7)

Broken code before the fix:

```js
router.get('/tasks/:id', getTaskById);
router.delete('/tasks/:id', deleteTask);

router.get('/admin/users', getAllUsers);
router.delete('/admin/users/:id', deleteUser);
```

What was wrong:

- `GET /api/tasks/:id` and `DELETE /api/tasks/:id` had no auth middleware.
- Both admin routes had no auth middleware at all.

Why it caused the symptom:

- Sensitive reads, writes, and deletes were directly exposed to the public internet.
- `/api/admin/users` leaked all users and `/api/admin/users/:id` allowed account deletion without logging in.

# What I Fixed

## Fix 1: Correct Token Generation

Before:

```js
const token = jwt.sign(
    { id: user._id },
    'mysecretkey',
);
```

After:

```js
const token = jwt.sign(
    {
        userId: user._id.toString(),
        email: user.email,
        role: user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
);
```

This prevents permanently valid tokens and makes the token payload usable for authentication and authorization.

## Fix 2: Rewrote The Auth Middleware

Before:

```js
const token = req.headers.token;

try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
} catch (err) {
    next();
}
```

After:

```js
const authHeader = req.headers.authorization;

if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided.' });
}

try {
    const token = authHeader.slice(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
} catch (err) {
    return res.status(401).json({ message: 'Invalid or expired token.' });
}
```

This prevents bad tokens from ever reaching controllers and makes every auth failure return the same `401` JSON shape.

## Fix 3: Applied Protection To Every Sensitive Route

Before:

```js
router.get('/tasks/:id', getTaskById);
router.delete('/tasks/:id', deleteTask);
router.get('/admin/users', getAllUsers);
router.delete('/admin/users/:id', deleteUser);
```

After:

```js
router.get('/tasks/:id', authMiddleware, getTaskById);
router.delete('/tasks/:id', authMiddleware, deleteTask);
router.get('/admin/users', authMiddleware, adminMiddleware, getAllUsers);
router.delete('/admin/users/:id', authMiddleware, adminMiddleware, deleteUser);
```

This prevents direct unauthenticated access to task and user data, and it restores the intended admin-only behavior for `/api/admin/*`.

## Compatibility Fix: Aligned Task Controllers With The New Payload

Before:

```js
const tasks = await Task.find({ userId: req.user.id });
const task = new Task({ title, userId: req.user.id });
```

After:

```js
const tasks = await Task.find({ userId: req.user.userId });
const task = new Task({ title, userId: req.user.userId });
```

This prevents valid post-fix tokens from failing inside the task controller after the payload was corrected from `id` to `userId`.

# Verification Results

| Scenario | Expected | Actual | Screenshot |
| --- | --- | --- | --- |
| No token on `GET /api/tasks` | `401` with `{"message":"No token provided."}` | `401` with `{"message":"No token provided."}` | `screenshots/01-no-token.png` |
| Fake token on `GET /api/tasks` | `401` with `{"message":"Invalid or expired token."}` | `401` with `{"message":"Invalid or expired token."}` | `screenshots/02-fake-token.png` |
| Expired token on `GET /api/tasks` | `401` with `{"message":"Invalid or expired token."}` | `401` with `{"message":"Invalid or expired token."}` | `screenshots/03-expired-token.png` |
| Valid user token on `GET /api/tasks` | `200` with that user's task list | `200` with the seeded user's two tasks | `screenshots/04-valid-token.png` |
| Valid non-admin token on `GET /api/admin/users` | `403` with forbidden response | `403` with `{"message":"Forbidden."}` | `screenshots/05-wrong-role.png` |

# What Happens if This Is Not Fixed

## Bug 1

An attacker who steals a token can keep using it indefinitely because the token never expires. If the secret is hardcoded and leaked through code sharing, logs, or screenshots, the attacker can also mint their own tokens outside the application and impersonate users or admins.

## Bug 2

Real clients that correctly send `Authorization: Bearer <jwt>` do not get authenticated at all, which pushes teams toward unsafe workarounds like custom headers or bypasses. In practice, this breaks standard client behavior and hides the fact that the token layer is not actually enforcing the standard auth path.

## Bug 3

A malicious client can send garbage, an expired token, or no token at all and still reach route handlers. Best case, the controller crashes with a `500`; worst case, the request succeeds and exposes or mutates data. That means auth failure turns into route execution instead of access denial.

## Bug 4

Anyone who can reach the API can read tasks by ID, delete tasks, list every user, and delete user accounts without logging in. In a real deployment, that means bulk data scraping, destructive account deletion, and unauthorized writes with nothing more than guessed or observed object IDs.
