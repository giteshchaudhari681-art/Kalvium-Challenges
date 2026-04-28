# CorpFlow Workforce Management API (v2.0-secure)

CorpFlow is a SaaS workforce management API for managing users, projects, and billing data across multiple organisational customers.

This version adds tenant isolation, role-aware response filtering, same-tenant foreign keys, and tenant-scoped indexes.

## Getting Started

### 1. Prerequisites

- Node.js v18 or higher
- PostgreSQL v14 or higher

### 2. Database Setup

Create a PostgreSQL database named `corpflow`.

```bash
createdb corpflow
```

Run the schema and seed data from the project root.

```bash
npm run seed
```

### 3. Application Setup

Install dependencies and configure your environment.

```bash
npm install
cp .env.example .env
```

Update `.env` with your database credentials if they differ from the local defaults.

### 4. Run the API

```bash
npm start
```

## Request Context

Every `/users` and `/projects` request requires tenant and actor context.

Supported inputs:

- Headers: `x-tenant-id` and `x-user-id`
- Query params: `tenant_id` and `requester_id`

Example:

```bash
curl "http://localhost:3000/users" ^
  -H "x-tenant-id: 1" ^
  -H "x-user-id: 1"
```

## API Endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/` | API status and greeting |
| GET | `/users` | List tenant-scoped users visible to the requesting role |
| GET | `/users/:id` | Get a tenant-scoped user profile if the role is allowed |
| GET | `/projects` | List tenant-scoped projects visible to the requesting role |
| GET | `/projects/:id` | View a tenant-scoped project if the role is allowed |

## Role Rules

- `admin`: all users, all projects, and allowed sensitive fields within the tenant
- `manager`: self and direct reports, plus owned or team-assigned projects, without salary or project budget
- `user`: own profile and assigned projects only, without salary or project budget

## Documentation

- Pre-refactor audit: [AUDIT.md](./AUDIT.md)
- Security decisions: [SECURITY.md](./SECURITY.md)

## Live Deployment

- Pending deployment

**Status:** Alpha
**License:** Private Internal Use Only
