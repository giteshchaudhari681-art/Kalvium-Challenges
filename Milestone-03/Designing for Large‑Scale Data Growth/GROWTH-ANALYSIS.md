# Growth Analysis

## Scope and Assumptions

The README gives exact growth numbers for `events` only:

- Current active users: `50,000`
- Average events per user per day: `200`
- Daily event growth: `10,000,000`
- Current `events` table size: `45,000,000` rows

That means the current `events` table contains `45,000,000 / 10,000,000 = 4.5` days of data.

The codebase does not provide an explicit growth rate for `sessions` or `feature_usage`, so the projections below use the lowest defensible application-level assumption from the routes:

- `sessions`: one `POST /sessions/start` call per active user per day
- `feature_usage`: one `POST /metrics/feature-usage` call per active user per day

That gives a baseline growth rate of `50,000` rows/day for each of those tables, and a current size of `50,000 x 4.5 = 225,000` rows each.

## Growth Projections

### 1. `events`

Working:

- 12 months: `45,000,000 + (10,000,000 x 365) = 3,695,000,000`
- 24 months: `45,000,000 + (10,000,000 x 730) = 7,345,000,000`
- 36 months: `45,000,000 + (10,000,000 x 1,095) = 10,995,000,000`

Projected row counts:

| Table | Current | 12 months | 24 months | 36 months |
| --- | ---: | ---: | ---: | ---: |
| `events` | 45,000,000 | 3,695,000,000 | 7,345,000,000 | 10,995,000,000 |

First query that breaks:

- File: `routes/metrics.js`
- Route: `GET /metrics/monthly`
- Query:
  ```sql
  SELECT COUNT(*), event_type
  FROM events
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY event_type
  ```

What it does:

- Builds the 30-day event-type distribution for the analytics dashboard.

Why it breaks first:

- There is no index on `created_at`.
- The table is not partitioned by time.
- For the first 30 days of production growth, almost the entire table matches the predicate, so PostgreSQL has to scan nearly all rows and aggregate them.
- After 30 days, the query still reads roughly `300,000,000` hot rows every time because there is no partition pruning or pre-aggregation.

### 2. `sessions`

Working:

- Current size: `50,000 x 4.5 = 225,000`
- 12 months: `225,000 + (50,000 x 365) = 18,475,000`
- 24 months: `225,000 + (50,000 x 730) = 36,725,000`
- 36 months: `225,000 + (50,000 x 1,095) = 54,975,000`

Projected row counts:

| Table | Current | 12 months | 24 months | 36 months |
| --- | ---: | ---: | ---: | ---: |
| `sessions` | 225,000 | 18,475,000 | 36,725,000 | 54,975,000 |

First query that breaks:

- File: `routes/sessions.js`
- Route: `GET /sessions/active`
- Query:
  ```sql
  SELECT *
  FROM sessions
  WHERE ended_at IS NULL
  ```

What it does:

- Lists every currently active session for operational monitoring.

Why it breaks first:

- There is no index on `ended_at`.
- The query asks for all active rows, so PostgreSQL must scan the full table to find null `ended_at` values.
- As the historical session table grows, old closed sessions dominate the heap, but every request still walks past them.

### 3. `feature_usage`

Working:

- Current size: `50,000 x 4.5 = 225,000`
- 12 months: `225,000 + (50,000 x 365) = 18,475,000`
- 24 months: `225,000 + (50,000 x 730) = 36,725,000`
- 36 months: `225,000 + (50,000 x 1,095) = 54,975,000`

Projected row counts:

| Table | Current | 12 months | 24 months | 36 months |
| --- | ---: | ---: | ---: | ---: |
| `feature_usage` | 225,000 | 18,475,000 | 36,725,000 | 54,975,000 |

First query that breaks:

- File: `routes/metrics.js`
- Route: `POST /metrics/feature-usage`
- Query:
  ```sql
  INSERT INTO feature_usage (user_id, feature_name, used_at)
  VALUES ($1, $2, NOW())
  RETURNING *
  ```

What it does:

- Records a feature-interaction row for downstream analytics.

Why it breaks first:

- This table is append-only and has no retention policy.
- The query runs on the same primary as all heavy reads from `events`.
- At scale, the issue is not lookup cost but sustained write latency from heap growth, WAL pressure, autovacuum churn, and contention with large analytical scans on the same database node.

## Scalability Risks

### Risk 1: `events` monthly analytics scan

- Table: `events`
- File / route: `routes/metrics.js` -> `GET /metrics/monthly`
- Query:
  ```sql
  SELECT COUNT(*), event_type
  FROM events
  WHERE created_at > NOW() - INTERVAL '30 days'
  GROUP BY event_type
  ```
- Unacceptable threshold: about `50,000,000` rows total
- Why it crosses 500ms:
  - With no index on `created_at` and no partitioning, the planner falls back to a sequential scan plus aggregate over a very large hot working set.
  - On a 45M-row table the API is already close to the edge; once the table crosses 50M rows and keeps growing toward the first 300M-row month, sub-500ms latency becomes unrealistic on a single general-purpose Postgres node.

### Risk 2: `events` recent-activity lookup per user

- Table: `events`
- File / route: `routes/events.js` -> `GET /events?user_id={id}`
- Query:
  ```sql
  SELECT *
  FROM events
  WHERE user_id = $1
  ORDER BY created_at DESC
  LIMIT 100
  ```
- Unacceptable threshold: about `30,000,000` rows total
- Why it crosses 500ms:
  - There is no composite index on `(user_id, created_at DESC)`.
  - PostgreSQL has to scan many pages to find the target user's rows and then sort them by recency before applying `LIMIT 100`.
  - Because the result set is tiny but the search space is massive, the query cost scales with table size instead of with the 100-row response.

### Risk 3: `sessions` active-session monitor

- Table: `sessions`
- File / route: `routes/sessions.js` -> `GET /sessions/active`
- Query:
  ```sql
  SELECT *
  FROM sessions
  WHERE ended_at IS NULL
  ```
- Unacceptable threshold: about `10,000,000` rows total
- Why it crosses 500ms:
  - There is no partial index for active rows.
  - The query degenerates into a full-table scan where the overwhelming majority of rows are historical sessions that do not match.
  - As the table moves into the 8-10M row range, repeated operational reads start paying the cost of scanning inactive history on every call.

### Risk 4: `events` write path under mixed OLTP + analytics load

- Table: `events`
- File / route: `routes/events.js` -> `POST /events`
- Query:
  ```sql
  INSERT INTO events (user_id, session_id, event_type, properties)
  VALUES ($1, $2, $3, $4)
  RETURNING *
  ```
- Unacceptable threshold: about `100,000,000` rows total with dashboard traffic present
- Why it crosses 500ms:
  - The application uses one database pool and one primary for both ingest and read traffic.
  - Large `SELECT` scans from `/metrics/monthly` and `/events` compete with inserts for CPU, shared buffers, disk bandwidth, WAL flushes, and autovacuum cycles.
  - Even if the insert itself is simple, the primary eventually spends enough time serving read pressure that write latency spikes past 500ms.
