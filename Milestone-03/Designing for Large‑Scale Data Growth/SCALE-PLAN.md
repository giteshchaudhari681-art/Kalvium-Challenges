# Scale Plan

## Growth Projections

### Row growth

| Table | Current | 12 months | 24 months | 36 months |
| --- | ---: | ---: | ---: | ---: |
| `events` | 45,000,000 | 3,695,000,000 | 7,345,000,000 | 10,995,000,000 |
| `sessions` | 225,000 | 18,475,000 | 36,725,000 | 54,975,000 |
| `feature_usage` | 225,000 | 18,475,000 | 36,725,000 | 54,975,000 |

Assumptions:

- `events` uses the exact README rate: `10,000,000` rows/day.
- `sessions` assumes one `POST /sessions/start` per active user per day.
- `feature_usage` assumes one `POST /metrics/feature-usage` per active user per day.
- Current `sessions` and `feature_usage` size is derived from the current 4.5-day `events` window: `50,000 x 4.5 = 225,000`.

### First breaking query by table

| Table | Route | File | Query that breaks first | Why |
| --- | --- | --- | --- | --- |
| `events` | `GET /metrics/monthly` | `routes/metrics.js` | `SELECT COUNT(*), event_type FROM events WHERE created_at > NOW() - INTERVAL '30 days' GROUP BY event_type` | Unpartitioned 30-day aggregate over the largest table. |
| `sessions` | `GET /sessions/active` | `routes/sessions.js` | `SELECT * FROM sessions WHERE ended_at IS NULL` | Full scan of an ever-growing history table without a partial index. |
| `feature_usage` | `POST /metrics/feature-usage` | `routes/metrics.js` | `INSERT INTO feature_usage (user_id, feature_name, used_at) VALUES ($1, $2, NOW()) RETURNING *` | Append-only writes eventually suffer from primary-node contention and table bloat. |

Thresholds carried forward from `GROWTH-ANALYSIS.md`:

- `events` monthly aggregate becomes unacceptable around `50,000,000` rows.
- `events` recent-activity lookup becomes unacceptable around `30,000,000` rows without a composite index.
- `sessions` active-session lookup becomes unacceptable around `10,000,000` rows.
- `events` insert latency becomes unacceptable around `100,000,000` rows when heavy reads share the same primary.

## Three-Strategy Summary

### 1. Partitioning strategy

Chosen strategy:

- Range partition `events` by `created_at`
- Monthly partitions
- Three explicit partitions created in schema: `events_2026_04`, `events_2026_05`, `events_2026_06`
- `events_default` acts as a safety net if the next monthly partition is not created yet

Why `created_at`:

- The largest read path in the app is time-based: `GET /metrics/monthly` filters the last 30 days.
- The archive policy is also time-based: hot data for 90 days, cold data after that.
- Partitioning by `user_id` would scatter a 30-day aggregate across every partition and make archiving awkward.

Why monthly, not yearly:

- Yearly partitions would still leave up to `3.65B` rows inside one partition at current growth.
- Monthly partitions keep the hot working set near `300,000,000` rows per partition, which is still large but tractable.
- Monthly boundaries align cleanly with the 30-day dashboard query and the 90-day hot window.

How partition pruning changes the common `events` workload:

- `POST /events`
  - PostgreSQL routes the insert into exactly one monthly partition instead of appending to a single multi-billion-row heap.
- `GET /metrics/monthly`
  - The `created_at > NOW() - INTERVAL '30 days'` predicate prunes old partitions and limits the scan to the current month and, at worst, the previous month.
- `GET /events?user_id={id}`
  - The route now reads only the hot 90-day window, so PostgreSQL can prune older partitions and use the new `(user_id, created_at DESC)` index on the remaining hot partitions.

### 2. Archiving strategy

Retention policy:

- Keep raw `events` in the hot partitioned table for 90 days.
- Move older raw events into `events_archive`.
- Keep archived rows indefinitely for compliance and audit access unless a separate legal retention rule overrides that later.

Archive query:

```sql
WITH moved_rows AS (
    DELETE FROM events
    WHERE created_at < NOW() - INTERVAL '90 days'
    RETURNING id, user_id, session_id, event_type, properties, created_at
)
INSERT INTO events_archive (
    id,
    user_id,
    session_id,
    event_type,
    properties,
    created_at,
    archived_at
)
SELECT
    id,
    user_id,
    session_id,
    event_type,
    properties,
    created_at,
    NOW()
FROM moved_rows;
```

How it should run:

- Trigger nightly with cron, for example `0 2 * * *` in UTC.
- Run during the lowest ingest window because it performs delete + insert work.
- Add a partition-maintenance companion job ahead of month-end to create the next monthly partition before traffic reaches it.

How archived data remains queryable:

- Compliance and audit jobs should read directly from `events_archive`.
- If the product later needs a single query surface, expose a read-only reporting view that unions hot `events` and `events_archive`.

Expected hot-table reduction:

- Daily event growth is `10,000,000`, so a 90-day hot window caps raw hot data near `900,000,000` rows.
- Without archiving, 12 months of growth reaches `3,695,000,000` rows.
- After the first 90 days of nightly archiving have warmed up, the hot table stays about `2,795,000,000` rows smaller than the unarchived 12-month case, which is about a `75.6%` reduction.

### 3. Read replica routing

Read-only database routes:

- `GET /events`
- `GET /sessions/active`
- `GET /metrics/monthly`

Write routes:

- `POST /events`
- `POST /sessions/start`
- `POST /metrics/feature-usage`

Routing approach implemented:

- `PRIMARY_DB_URL` is used for writes.
- `REPLICA_DB_URL` is used for reads.
- If `REPLICA_DB_URL` is missing, reads fall back to the primary.
- The route files now call `db.readQuery(...)` for `SELECT` paths and `db.writeQuery(...)` for `INSERT` paths.

Highest read-load routes and why they belong on a replica:

- `GET /metrics/monthly`
  - This is the heaviest query in the app because it aggregates a large 30-day event slice.
- `GET /events`
  - Dashboard activity feeds are frequent, user-facing reads and they hit the largest table.
- `GET /sessions/active`
  - Operations and monitoring traffic can poll this endpoint repeatedly.

Why this reduces pressure on the primary:

- The primary can spend its resources on ingest-heavy writes to `events`, `sessions`, and `feature_usage`.
- Analytical and dashboard reads no longer compete with ingest for CPU, shared buffers, and disk throughput on the same node.

## Implementation Order

1. Partitioning first.
   This is the most urgent change because the `events` table is already at `45,000,000` rows and is growing by `10,000,000` rows every day. The monthly analytics query will fail first if the table remains monolithic.

2. Read replica routing second.
   Once `events` is partitioned, the next bottleneck is mixed workload contention. Routing all `SELECT` traffic away from the primary protects ingest before the table crosses into the first hundreds of millions of rows.

3. Archiving third.
   Archiving matters for long-term control of hot data size, but it only becomes effective after there is enough aged data to move. It is still essential, just slightly less urgent than stopping the immediate monolithic-table and mixed-workload risks.

## Trade-offs and Risks

### Partitioning

Trade-off:

- Native partitioning adds operational complexity because partitions must be created ahead of time and index strategy now exists per partition family.

Risk and mitigation:

- If the next monthly partition is not created, inserts can fail or spill into the default partition.
- Mitigate by scheduling automatic partition creation before month rollover and monitoring whether `events_default` receives rows.

### Archiving

Trade-off:

- Queries against older history are no longer available from the hot table alone.

Risk and mitigation:

- If the archive job is delayed or written incorrectly, data can be duplicated or temporarily unavailable in reporting.
- Mitigate with transactional archive jobs, row-count reconciliation, and a compliance query path that reads `events_archive` directly.

### Read replicas

Trade-off:

- Replicas can lag behind the primary, so recent writes may not be visible immediately on read-only routes.

Risk and mitigation:

- A user can post an event and then briefly miss it on a replica-backed dashboard call.
- Mitigate by documenting eventual consistency for analytics endpoints and keeping a primary-read escape hatch for any future route that requires read-after-write guarantees.
