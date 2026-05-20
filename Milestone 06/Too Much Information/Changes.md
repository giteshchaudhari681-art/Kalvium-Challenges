# CorpAuth Response Audit

## Scope Reviewed
- `POST /auth/signup`
- `POST /auth/login`
- `GET /auth/me`
- JWT payload created by `POST /auth/login`
- User table fields from `db/schema.sql`

## Pre-Refactor Audit

### `POST /auth/signup`
Current implementation inserts into `users` with `RETURNING *` and responds with the raw row as `user`.

Fields currently exposed that should be removed:
- `password_hash`: never needed by the client and leaks credential material that should remain server-only.
- `is_admin`: internal authorization mirror that should not be exposed to the browser when `role` is already sufficient.
- `stripe_customer_id`: billing system identifier with no role in completing registration.
- `verification_token`: account-verification secret that could be abused if exposed to the client.
- `reset_password_token`: password reset secret; even when null it should never be part of the public contract.
- `last_login_ip`: internal security/audit metadata, not registration data.
- `subscription_plan`: not required to complete signup; exposing it here expands the response without need.
- `feature_flags`: internal rollout/configuration metadata that does not belong in the auth bootstrap response.
- `salary`: highly sensitive internal business data with no legitimate client use.
- `created_at`: not required to complete the registration flow.
- `updated_at`: internal bookkeeping field, not needed by the client.

Fields kept for signup response:
- `id`: stable identifier for the newly created user.
- `name`: user-facing profile label.
- `email`: primary identifier the frontend will display/use.
- `role`: safe, low-sensitivity authorization context.

### `POST /auth/login`
Current implementation fetches `SELECT *` and responds with both a JWT and the full raw user row.

Fields currently exposed in the response body that should be removed:
- `password_hash`: never needed by the client and should never leave the server.
- `is_admin`: redundant internal flag; role is the safer public authz field.
- `stripe_customer_id`: billing identifier not required for login or session bootstrapping.
- `verification_token`: secret token unrelated to login flow.
- `reset_password_token`: secret token unrelated to login flow.
- `last_login_ip`: private audit/security metadata.
- `subscription_plan`: not required to authenticate or initialize the basic session.
- `feature_flags`: internal release/configuration data that should not be trusted from client-visible auth responses.
- `salary`: sensitive internal employee data with no legitimate client use.
- `created_at`: not required for login.
- `updated_at`: internal bookkeeping field, not required for login.

Fields kept for login response:
- `id`: stable user identifier.
- `name`: user-facing display value.
- `email`: identifier the frontend may show or cache.
- `role`: safe authorization context for the session.

### `GET /auth/me`
Current implementation performs `SELECT *` and returns the raw row as `user`.

Fields currently exposed that should be removed:
- `password_hash`: credential material must remain server-only.
- `is_admin`: redundant internal flag; use `role` as the single exposed authorization field.
- `stripe_customer_id`: internal billing identifier.
- `verification_token`: secret token that should never be returned in profile APIs.
- `reset_password_token`: secret token that should never be returned in profile APIs.
- `last_login_ip`: internal security/audit metadata.
- `subscription_plan`: not needed for the current profile contract and should not be exposed by default.
- `feature_flags`: internal rollout/configuration metadata.
- `salary`: highly sensitive internal business data.
- `created_at`: not needed by the current frontend contract.
- `updated_at`: internal bookkeeping field.

Fields kept for profile response:
- `id`: stable user identifier.
- `name`: user-facing profile value.
- `email`: primary identifying field.
- `role`: safe authorization context.

## JWT Claims Audit
Current login token signs the following claims:

- `userId`: keep. Required by downstream auth flow because `/auth/me` reads `req.user.userId` to load the current user.
- `email`: remove. Convenient for the client, but not required by middleware or route authorization.
- `role`: keep. Safe authorization context and the only non-identifier claim that belongs in the token.
- `isAdmin`: remove. Duplicates `role` and creates two sources of truth for authorization.
- `stripeCustomerId`: remove. Billing identifier has no place in an auth token.
- `subscriptionPlan`: remove. Product/billing state is not required for authentication.
- `featureFlags`: remove. Internal rollout/configuration data should not be embedded in bearer tokens.

Target JWT payload:
- `userId`
- `role`

## Mapper Plan
Create `response-mappers.js` with:

- `toAuthUser(user)`: return only `id`, `name`, `email`, `role`.
- `toProfileUser(user)`: return only `id`, `name`, `email`, `role`.

Reasoning:
- These four fields are enough to identify the signed-in user and initialize a basic frontend session.
- Every removed field is either sensitive, internal, redundant, or unnecessary for the auth/profile flows in this codebase.
