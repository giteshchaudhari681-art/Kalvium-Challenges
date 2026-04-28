# CorpFlow Security Decisions

## Sensitive Fields

| Field | Table | Why It Is Sensitive | Allowed API Access |
| --- | --- | --- | --- |
| `password_hash` | `users` | Authentication material; disclosing it increases credential compromise risk. | Never returned by the API. |
| `salary` | `users` | Confidential payroll data. | `admin` within the same tenant only. |
| `budget` | `projects` | Internal financial planning and spend data. | `admin` within the same tenant only. |
| `card_holder_name` | `billing_details` | Payment identity information. | Stored only; not returned by current API routes. |
| `card_last4` | `billing_details` | Payment card metadata. | Stored only; not returned by current API routes. |
| `expiry_date` | `billing_details` | Payment card metadata. | Stored only; not returned by current API routes. |
| `billing_address` | `billing_details` | Billing PII. | Stored only; not returned by current API routes. |

## Tenant Boundary Design

### Canonical tenant owner

- `tenants` is the root ownership table for every customer organisation.
- `users`, `projects`, `project_assignments`, and `billing_details` all carry `tenant_id NOT NULL`.

### Same-tenant foreign keys

- `users (tenant_id, manager_id) -> users (tenant_id, id)`
- `projects (tenant_id, owner_user_id) -> users (tenant_id, id)`
- `project_assignments (tenant_id, project_id) -> projects (tenant_id, id)`
- `project_assignments (tenant_id, user_id) -> users (tenant_id, id)`
- `billing_details (tenant_id, user_id) -> users (tenant_id, id)`

These composite foreign keys prevent a record from referencing an entity that exists under another tenant, even if the numeric `id` happens to match.

## Tenant-Scoped Queries

### Request context

- `middleware/requestContext.js` requires `x-tenant-id` and `x-user-id` headers, or `tenant_id` and `requester_id` query parameters.
- The middleware resolves the requesting user with `WHERE tenant_id = $1 AND id = $2`.
- If the actor is not valid for that tenant, the request is rejected before any route query runs.

### User routes

- `GET /users` always starts from `FROM users WHERE tenant_id = $1`.
- `GET /users/:id` always starts from `FROM users WHERE tenant_id = $1 AND id = $2`.
- Role scoping then narrows the result set:
  - `admin`: all tenant users
  - `manager`: self plus direct reports (`manager_id = actor.id`)
  - `user`: self only

### Project routes

- `GET /projects` always starts from `FROM projects p WHERE p.tenant_id = $1`.
- `GET /projects/:id` always starts from `FROM projects p WHERE p.tenant_id = $1 AND p.id = $2`.
- Role scoping then narrows the result set:
  - `admin`: all tenant projects
  - `manager`: projects they own, are assigned to, or that are assigned to their direct reports
  - `user`: projects assigned to them

## Response Filtering

- Routes no longer use `SELECT *`.
- User responses are mapped through `serializeUser()` before leaving the API.
- Project responses are mapped through `serializeProject()` before leaving the API.
- `password_hash` is never selected or returned.
- `salary` and `budget` are only included for `admin`.

## Cross-Tenant Risks And Mitigations

1. Risk: broad reads return data for every customer.
Mitigation: every route query begins with a `tenant_id` predicate established by request context.

2. Risk: direct object reference by numeric id leaks another tenant's records.
Mitigation: detail routes require both `tenant_id` and object id in the same predicate.

3. Risk: relational drift allows one tenant's child record to point at another tenant's parent row.
Mitigation: composite same-tenant foreign keys enforce tenant ownership at the database layer.

4. Risk: future column additions are leaked automatically by raw row serialization.
Mitigation: API responses are explicitly mapped to safe objects instead of returning database rows directly.

5. Risk: tenant isolation depends only on application discipline and degrades under load.
Mitigation: tenant-scoped indexes were added to every tenant-specific table so secure queries remain the fast path.

## Index Strategy

- `users (tenant_id, id)`
- `users (tenant_id, role)`
- `users (tenant_id, manager_id)`
- `projects (tenant_id, id)`
- `projects (tenant_id, owner_user_id)`
- `project_assignments (tenant_id, project_id)`
- `project_assignments (tenant_id, user_id)`
- `billing_details (tenant_id, user_id)`

These indexes match the tenant-boundary predicates and relationship lookups used by the API.
