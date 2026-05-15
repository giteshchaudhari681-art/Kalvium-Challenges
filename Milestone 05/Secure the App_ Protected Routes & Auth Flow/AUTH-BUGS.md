# AUTH Bugs

## Observed Behaviours

### Pre-fix browser baseline

- Navigating directly to `/dashboard` without logging in renders the full dashboard page. The user is not redirected to `/login`.
- Navigating directly to `/settings` without logging in renders the full settings page. The user is not redirected to `/login`.
- Navigating directly to `/profile` without logging in renders the full profile page, including the hardcoded `Demo User` content. The user is not redirected to `/login`.
- Visiting `/login` shows the login form, but submitting the valid demo credentials does not authenticate the user. The page stays on `/login` and shows `Auth system failure. Please check the implementation.`
- After the failed login attempt, `localStorage` remains empty. No `authToken` or `authUser` entries are created.
- Refreshing the page after the failed login returns to the same unauthenticated login screen. There is no persisted session.
- The navbar always shows `Login`. There is no authenticated navbar state and no visible `Logout` action during the baseline because the app never reaches a logged-in state.

## Root Cause Analysis

### Bug 1: Auth provider is not mounted

- `src/main.jsx` imports `BrowserRouter` and renders `<App />`, but `AuthProvider` is commented out and never used.
- Because the provider never wraps the app, `useAuth()` reads the default context value instead of live auth state.
- `src/pages/Login.jsx` guards against a missing auth object and falls into the error branch, which is why valid credentials still fail with `Auth system failure. Please check the implementation.`

### Bug 2: Auth state is not persisted

- `src/context/AuthContext.jsx` stores `user` and `token` only in component state.
- `login(userData, fakeToken)` updates React state but does not write `authToken` or `authUser` into `localStorage`.
- `logout()` clears React state but does not remove any stored auth keys.
- The provider also has no mount-time `useEffect` to hydrate auth state from `localStorage`, so even a successful in-memory login would be lost on refresh.

### Bug 3: Private routes are public

- `src/App.jsx` renders `/dashboard`, `/settings`, and `/profile` directly with no route guard.
- There is no `ProtectedRoute` component anywhere in the app.
- Because nothing checks `isAuthenticated` before rendering those routes, unauthenticated users can open private URLs directly.

### Bug 4: Navbar ignores auth state

- `src/components/Navbar.jsx` does not call `useAuth()`.
- The navbar always renders the `Login` link and always renders navigation links to private pages, regardless of authentication state.
- There is no logout button, no current-user display, and no handler that calls `logout()` and redirects the user back to `/login`.

## Fixes Applied

- Bug 1: Wrapped the entire app with `AuthProvider` in `src/main.jsx`, with `AuthProvider` outside `BrowserRouter` so every route and navbar render can read the same auth context.
- Bug 2: Rebuilt `AuthContext.jsx` to expose `user`, `token`, `isAuthenticated`, `login()`, and `logout()` in the provider value. `login()` now stores `authToken` and `authUser`, `logout()` removes both keys, and the provider restores persisted auth data on mount.
- Bug 2 follow-up: Initialized auth state from `localStorage` immediately in the provider so a hard refresh on a protected route does not redirect to `/login` before hydration completes.
- Bug 3: Added `src/components/ProtectedRoute.jsx` and wrapped `/dashboard`, `/settings`, and `/profile` in `App.jsx`. Unauthenticated access now redirects to `/login` with `replace`.
- Bug 4: Rebuilt `Navbar.jsx` to consume `useAuth()`, show only `Login` when unauthenticated, and show the authenticated nav, current user name, and a working `Logout` button when authenticated.

## Verification Results

- Unauthenticated visit to `/dashboard` redirects to `/login`.
- Valid login navigates to `/dashboard`, shows the authenticated navbar, and writes both `authToken` and `authUser` to `localStorage`.
- Refresh while logged in keeps the user on `/dashboard` and preserves the authenticated navbar state.
- Logout removes both `localStorage` keys, updates the navbar back to `Login`, and returns the user to `/login`.
- Visiting `/dashboard` after logout redirects back to `/login` again.
- Screenshot evidence is stored in `screenshots/01-unauth-redirect.png` through `screenshots/05-post-logout-redirect.png`.
