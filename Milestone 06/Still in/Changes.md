# Still In? - Bug Fix Log

## Pre-Fix Investigation

- I ran the backend and frontend locally from `Milestone 06/Still in`.
- To reproduce login cleanly, I started the backend with temporary local environment variables for `JWT_SECRET` and `TOKEN_EXPIRY=1m`. No repository files were added for that setup.
- I created a disposable account, logged in, confirmed the dashboard flow, and then exercised the vote and expiry paths with live requests plus a source audit of the React polling code.

### Suspicious Behavior Observed Before Fixing

1. Expired token returned the wrong server response.
- After waiting just over 60 seconds and posting to `POST /api/vote` with the old token, the API returned `500` instead of `401`.
- The auth middleware catches every verification error and labels it as an invalid token, which prevents the frontend from treating expiry as a normal session end.

2. Duplicate voting was allowed.
- I signed in, voted once, and immediately voted again with the same account.
- The second vote also returned `200` with `{"message":"Vote cast successfully"}`.
- The route stores numeric `userId` values in `votedUserIds`, but it checks them against `req.user.email`, so the membership test never matches.

3. Frontend had no global auth failure handling.
- `client/src/api/client.js` only had a request interceptor.
- There was no response interceptor to clear local auth state or redirect on `401`, so expired access left the UI stuck on the dashboard.

4. Dashboard polling would continue after session end.
- `client/src/pages/Dashboard.jsx` starts a `setInterval` that fetches poll data every 10 seconds.
- When voting fails after token expiry, the user is not logged out, so the dashboard stays mounted and the interval keeps running.
- That means stale sessions continue consuming network and UI resources instead of shutting down cleanly.

---

## Fixes Applied

### 1. Expired token now returns `401 Unauthorized`
- **Problem**: `server/middleware/auth.js` returned `500` for every JWT verification failure, including `TokenExpiredError`.
- **Discovery**: After waiting 65 seconds and submitting a vote with the old token, the API returned `500` instead of a session-ended response.
- **Fix**: I updated the middleware to catch `TokenExpiredError` explicitly and return `401` with `Session expired. Please log in again.`. Invalid JWTs now return `401`, and only unexpected auth failures return `500`.

### 2. Duplicate vote check now compares the correct type
- **Problem**: The app stored numeric user IDs in `votedUserIds`, but checked for duplicates using `req.user.email`, which is a string.
- **Discovery**: A second vote from the same account still returned `200`, and the code audit showed a mismatched ID-vs-email comparison.
- **Fix**: I changed the duplicate-vote guard to `votedUserIds.includes(userId)`, keeping both storage and comparison on the same numeric ID type.

### 3. Frontend now handles auth failures globally
- **Problem**: `client/src/api/client.js` had no response interceptor, so expired sessions were left to per-page error handlers.
- **Discovery**: Source review showed only a request interceptor, and expired sessions were not clearing stored auth or leaving the dashboard.
- **Fix**: I added a shared logout event and a response interceptor that handles non-login `401` responses by clearing auth storage and broadcasting a logout event to the React app.

### 4. Polling now stops cleanly on logout and expiry
- **Problem**: `Dashboard.jsx` created a polling interval but only cleaned it up on component unmount. Since auth expiry did not previously log the user out, the interval kept running in a stale session.
- **Discovery**: The dashboard polling loop was tied to component lifetime only, while expired-vote failures left the dashboard mounted.
- **Fix**: I added a `stopPolling()` helper, wired the dashboard to listen for the shared auth-logout event, and used the same cleanup path for manual logout. Once the session ends, the auth state is cleared, the route guard sends the user to `/login`, and the interval is cancelled.

## Validation

- Duplicate vote test after fix: first vote `200`, second vote `400`, message `You have already voted!`
- Expired token test after fix: vote after 65 seconds returns `401`, message `Session expired. Please log in again.`
- Frontend build: `npm run build` completed successfully in `client/`
