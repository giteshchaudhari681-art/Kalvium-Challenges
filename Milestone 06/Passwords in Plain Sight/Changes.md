# What I Found

## Checkpoint 1 - Signup

`POST /api/auth/signup` is handled in `backend/controllers/authController.js`. Before the fix, the controller took `req.body.password` and passed it straight into `User.create()` with no hashing step:

```js
const user = await User.create({
  email,
  password, // plain text stored here
})
```

`bcrypt.hash()` was not called anywhere in the signup flow. The password was not transformed at all, so it was stored as plain text.

## Checkpoint 2 - Database Record

Before the fix, after signing up with `test@example.com / password123`, the MongoDB user document stored the password exactly like this:

```json
{
  "_id": {
    "$oid": "6a08169c9649ededa5ad6d44"
  },
  "email": "test@example.com",
  "password": "password123",
  "createdAt": {
    "$date": "2026-05-16T07:02:52.804Z"
  },
  "updatedAt": {
    "$date": "2026-05-16T07:02:52.804Z"
  },
  "__v": 0
}
```

The exact password field value was `"password123"`. This falls into the `plain text` category.

## Checkpoint 3 - Login Comparison

`POST /api/auth/login` was also handled in `backend/controllers/authController.js`. Before the fix, the verification logic was:

```js
if (user.password !== password) {
  return res.status(401).json({ message: 'Invalid credentials' })
}
```

The code used direct string comparison. It did not use `bcrypt.compare()`, and it did not transform the submitted password before comparing it to the stored value.

## Checkpoint 4 - User Model

`backend/models/User.js` had the `email` and `password` schema fields, but it was missing all three important protections:

- No `pre('save')` hook to hash passwords before writing to MongoDB
- No `select: false` on the password field
- No password validation such as a minimum length

## Exact Observation

What I saw in the database before the fix was exactly: `"password": "password123"`.

# Root Cause

The root cause was in `backend/controllers/authController.js`. The signup controller received `req.body.password` and passed it directly into `User.create()` without hashing it first, so MongoDB persisted the raw password string exactly as entered by the user. The login controller mirrored the same unsafe assumption by comparing `user.password` and `req.body.password` directly, which only works if the database stores the original plain-text password instead of a one-way hash.

# Why This Is Dangerous

If an attacker got read access to the database through a leak, backup exposure, misconfigured admin panel, or server compromise, they would immediately have every user's real password with no cracking effort required. That turns a single database breach into direct account takeover on this app and likely credential stuffing on other sites, because many users reuse passwords. In this case, seeing `"password123"` in the record means an attacker could log in as that user right away, not just attempt an offline cracking attack.

# What I Fixed

## Fix 1 - Hash the Password Before Storing

Before:

```js
const user = await User.create({
  email,
  password, // plain text stored here
})
```

After:

```js
const hashedPassword = await bcrypt.hash(password, 10)

const user = await User.create({
  email,
  password: hashedPassword,
})
```

## Fix 2 - Compare Safely During Login

Before:

```js
if (user.password !== password) {
  return res.status(401).json({ message: 'Invalid credentials' })
}
```

After:

```js
const isMatch = await bcrypt.compare(password, user.password)
if (!isMatch) {
  return res.status(401).json({ message: 'Invalid credentials' })
}
```

## Package Change

Installed `bcryptjs` and added it to `package.json` so the controller can hash and compare passwords safely.

# Verification

I verified the fix locally with the running app and local MongoDB on May 16, 2026.

1. Signed up `test@example.com / password123` after the fix.
2. Queried MongoDB and confirmed the password field was stored as a bcrypt hash:

```json
{
  "_id": {
    "$oid": "6a081707d49eb795255e2629"
  },
  "email": "test@example.com",
  "password": "$2b$10$z.6hJRwQ1CU0WAeagJ6PKucWb8uYZ1V25BbzZ266JKWGSRIlhjuaG",
  "createdAt": {
    "$date": "2026-05-16T07:04:39.991Z"
  },
  "updatedAt": {
    "$date": "2026-05-16T07:04:39.991Z"
  },
  "__v": 0
}
```

3. Logged in with the correct credentials and received `200 OK` plus a JWT.
4. Logged in with the wrong password and received `401 Unauthorized`.
5. Confirmed the database no longer showed a plain-text password for the recreated test user.

Screenshot files saved in this challenge folder:

- `screenshots/before-db.png`
- `screenshots/after-db.png`
