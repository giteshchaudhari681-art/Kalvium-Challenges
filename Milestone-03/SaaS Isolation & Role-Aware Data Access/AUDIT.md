# Pre-Refactor Audit

## Scope Reviewed

- `schema.sql`
- `routes/users.js`
- `routes/projects.js`
- `app.js`
- `db.js`
- `README.md`

## Structural Problems To Fix

1. `schema.sql:8-15` creates `users` without a `tenant_id` column.
Consequence: any query that misses an application-side filter can return users from every organisation because the table has no first-class tenant boundary.

2. `schema.sql:17-23` creates `projects` without a `tenant_id` column.
Consequence: project reads and writes are global, so one tenant can see or mutate another tenant's project records if the API query is too broad.

3. `schema.sql:25-32` creates `billing_details` without a `tenant_id` column.
Consequence: the most sensitive financial table has no tenant isolation and cannot enforce tenant-scoped joins.

4. `schema.sql:4-32` defines no `tenants` table at all.
Consequence: the schema has no canonical record for organisational ownership, no place to anchor tenant-scoped foreign keys, and no durable identifier that can be propagated through the API.

5. `schema.sql:27` defines `billing_details.user_id REFERENCES users(id)` as a single-column foreign key.
Consequence: the relationship only proves that the referenced user exists somewhere in the system; it does not prove that billing details and the user belong to the same tenant.

6. `schema.sql:17-23` stores projects with no owner or assignment boundary.
Consequence: the API cannot express "manager sees team projects" or "user sees assigned projects only" without adding tenant-scoped ownership or assignment relationships.

7. `schema.sql:8-32` defines no composite uniqueness such as `(tenant_id, id)` on tenant-specific tables.
Consequence: Postgres cannot enforce composite foreign keys that guarantee same-tenant references across related tables.

8. `schema.sql:8-32` defines no indexes on `tenant_id` or tenant-scoped lookup patterns.
Consequence: once isolation is added, every secure query will filter on `tenant_id`; without indexes, access control will depend on full table scans and degrade quickly as data grows.

9. `routes/users.js:9` runs `SELECT * FROM users`.
Consequence: one missing WHERE clause currently returns the entire workforce across all tenants and exposes sensitive columns in the same response.

10. `routes/users.js:21` runs `SELECT * FROM users WHERE id = $1` with no tenant predicate.
Consequence: a caller who knows another tenant's user id can fetch that record directly.

11. `routes/projects.js:9` runs `SELECT * FROM projects`.
Consequence: every tenant can see all projects because the route has no tenant filter and no role-based restriction.

12. `routes/projects.js:21` runs `SELECT * FROM projects WHERE id = $1` with no tenant predicate.
Consequence: direct object reference by id can leak project data across tenants.

13. `routes/users.js:9,21` and `routes/projects.js:9,21` return raw database rows.
Consequence: API responses are coupled to storage and automatically expose new columns, including sensitive ones, unless every future field is manually stripped elsewhere.

14. `routes/users.js:5-32` implements no role-based access control.
Consequence: admins, managers, and regular users are all treated the same, so nothing stops low-privilege callers from receiving high-privilege data.

15. `routes/projects.js:5-32` implements no role-based access control.
Consequence: the project endpoints cannot limit visibility to team projects or assigned projects as required.

16. `app.js:14-15` mounts routes without any request context for tenant or actor identity.
Consequence: the API layer has no reliable way to determine which tenant boundary to enforce or which role-based filter to apply.

17. `schema.sql:11` leaves `users.email` nullable and non-unique across the system.
Consequence: the schema cannot rely on email as a stable identity signal, and duplicate or missing emails make tenant-aware actor resolution less trustworthy.

18. `schema.sql:13` defaults `users.role` to `'employee'`, while the required access model is `admin`, `manager`, and `user`.
Consequence: the stored role vocabulary does not match the access-control vocabulary the API must enforce.

19. `routes/projects.js:29` calls `console.err(err)` instead of `console.error(err)`.
Consequence: project detail failures can suppress useful server logs during debugging and verification.

## Sensitive Fields And Required Access

1. `users.password_hash` in `schema.sql:12`
Why sensitive: credential material should never be returned in API responses.
Allowed roles: no API role should ever receive it.

2. `users.salary` in `schema.sql:14`
Why sensitive: payroll data is confidential employee compensation information.
Allowed roles: `admin` only.

3. `projects.budget` in `schema.sql:22`
Why sensitive: budget data is financial information and should not be visible to all users.
Allowed roles: `admin` only.

4. `billing_details.card_holder_name` in `schema.sql:28`
Why sensitive: payment identity data tied to a billing instrument.
Allowed roles: `admin` only.

5. `billing_details.card_last4` in `schema.sql:29`
Why sensitive: partial card data is still payment information and must be restricted.
Allowed roles: `admin` only.

6. `billing_details.expiry_date` in `schema.sql:30`
Why sensitive: payment card metadata should not be exposed outside finance-level access.
Allowed roles: `admin` only.

7. `billing_details.billing_address` in `schema.sql:31`
Why sensitive: personally identifiable billing information.
Allowed roles: `admin` only.

## Required Access Rules To Implement

1. `admin`
Can see all users, all projects, and all sensitive fields within the same tenant.

2. `manager`
Can see team members and team projects within the same tenant.
Cannot see `password_hash`, `salary`, project budgets, or billing fields.

3. `user`
Can see only their own user profile and only projects assigned to them within the same tenant.
Cannot see other user records, `password_hash`, `salary`, project budgets, or billing fields.
