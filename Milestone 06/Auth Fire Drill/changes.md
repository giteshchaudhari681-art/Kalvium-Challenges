# Project Changes & Fixes Log

## Security Challenge Summary
This file was first updated during investigation, before code changes, and then expanded while fixes were implemented and verified.

## Investigation Notes Before Fixing
- `server/auth/jwt.js` used a hardcoded secret string and signed tokens without an `exp` claim. A decoded login token only contained `{"userId":"4","iat":1779383517}`.
- `server/routes/auth.js` only signed `{ userId }`, so the backend had no role information in authenticated requests.
- `client/src/context/AuthContext.jsx` stored `role` in `localStorage` and the UI trusted that mutable value for edit, approve, delete, and create buttons.
- `server/routes/fragments.js` allowed any authenticated user to create, edit, approve, and delete fragments. Verified directly with API calls using a reader token.
- `server/index.js` enabled `cors({ origin: '*' })`. An `OPTIONS /api/fragments` request from `Origin: http://evil.example` returned `Access-Control-Allow-Origin: *`.
- Logout was client-only. Copying a token, clearing browser state, and then reusing the token still allowed authenticated writes because the server had no invalidation logic.

---

### Vulnerability 1: Hardcoded JWT Secret and Missing Expiry
- **Found in**: `server/auth/jwt.js`
- **Description of the Problem**:
  The JWT signing secret was committed directly in source as `fragments-secret-key`, and tokens were signed without `expiresIn`. Anyone with source access could forge valid tokens, and any stolen token remained valid until the server secret changed.
- **Description of the Fix**:
  Moved the secret to an environment variable, added startup validation so the server fails fast if it is missing, and signed tokens with a 1 hour expiry.

---

### Vulnerability 2: Role Missing from JWT Payload
- **Found in**: `server/routes/auth.js`, `server/middleware/auth.js`, `server/middleware/roleCheck.js`
- **Description of the Problem**:
  The login and signup flows only signed `userId`. The backend middleware therefore attached a user object without `role`, which made server-side authorization unreliable and broke reusable role checks.
- **Description of the Fix**:
  Added `role` to the JWT payload on signup and login, then normalized `req.user` in auth middleware so downstream authorization code always receives `id`, `role`, and token metadata.

---

### Vulnerability 3: Frontend Trusted Role from `localStorage`
- **Found in**: `client/src/context/AuthContext.jsx`, `client/src/components/AddFragmentForm.jsx`, `client/src/components/FragmentCard.jsx`
- **Description of the Problem**:
  The client persisted role in `localStorage` and used it to decide which controls to render. A user could change `localStorage.role` in DevTools and expose curator or admin UI actions without earning those privileges.
- **Description of the Fix**:
  Removed role persistence from `localStorage` and derived the authenticated user from the signed token plus the trusted login response. The UI now reads role from authenticated state rather than a separately editable storage key.

---

### Vulnerability 4: Missing Role Checks and Ownership Validation on Fragment Endpoints
- **Found in**: `server/routes/fragments.js`, `server/middleware/roleCheck.js`
- **Description of the Problem**:
  Protected endpoints only required authentication. In live testing, a reader token successfully created a fragment, edited another user's fragment, called the approve endpoint, and deleted content. Contributor ownership was also unenforced.
- **Description of the Fix**:
  Added reusable authorization middleware and applied it per route. Fragment creation now requires contributor or higher, approval requires curator or admin, deletion requires admin, and updates enforce contributor ownership while still allowing curator/admin moderation.

---

### Vulnerability 5: CSRF Exposure Through Permissive Cross-Origin Policy
- **Found in**: `server/index.js`
- **Description of the Problem**:
  The API accepted any origin and had no CSRF defense for state-changing requests. That left the application exposed to cross-site request attacks from a malicious origin once a browser held an authenticated session context.
- **Description of the Fix**:
  Restricted CORS to trusted frontend origins and added CSRF validation for write operations using a server-issued token that must be echoed in a custom header.

---

### Vulnerability 6: Logout Did Not Invalidate Tokens
- **Found in**: `client/src/components/LogoutButton.jsx`, `client/src/context/AuthContext.jsx`, `server/middleware/auth.js`, `server/data/store.js`
- **Description of the Problem**:
  Logout only cleared browser storage. A copied bearer token still worked after logout because the server never tracked revoked tokens.
- **Description of the Fix**:
  Added a logout endpoint that blacklists the current token in memory and updated auth middleware to reject blacklisted tokens before accepting a request.

---
> [!NOTE]
> Verification after the fixes was done with direct HTTP requests so authorization could be confirmed independently of the frontend UI.
