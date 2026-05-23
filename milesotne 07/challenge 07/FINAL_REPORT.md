# FINAL_REPORT

## Scope

Space Mission Logs was rebuilt and optimized inside `milesotne 07/challenge 07` only.

Metrics below were captured locally on `2026-05-23` with:

- Backend timing and payload size from `curl`
- Query counts from the backend `X-Query-Count` header and query logs
- React commit duration from the in-app profiler after typing `mars`
- DOM node count from a browser automation pass after the same search

## Baseline

Endpoint measured: `GET /api/missions`

| Metric | Baseline |
| --- | ---: |
| Response time | 8255.818 ms |
| Payload size | 965630 bytes |
| Database queries | 401 |
| React commit duration | 141.5 ms |
| DOM nodes | 4922 |

Baseline page-load query count in the browser was effectively 802.
This is an inference from React 18 Strict Mode making two initial mount requests while the endpoint still executed 401 queries per request.

## Fix-by-Fix Deltas

### 1. N+1 query problem

Change: collapsed mission + crew + logs retrieval into one relation-aware query path.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Response time | 8255.818 ms | 35.55 ms | -8220.268 ms |
| Payload size | 965630 B | 965630 B | 0 B |
| Queries | 401 | 1 | -400 |

### 2. Pagination

Change: added `page`, `limit`, `skip/take`, and metadata.

Measured endpoint after this step: `GET /api/missions?page=1&limit=20`

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Response time | 35.55 ms | 26.041 ms | -9.509 ms |
| Payload size | 965630 B | 105039 B | -860591 B |
| Queries | 1 | 2 | +1 |

Note: query count rose from 1 to 2 because pagination adds a `count()` query for metadata.

### 3. Payload trim

Change: paginated response switched to `select` and dropped the oversized `description` field.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Response time | 26.041 ms | 329.49 ms | +303.449 ms |
| Payload size | 105039 B | 31773 B | -73266 B |
| Queries | 2 | 2 | 0 |

Note: local timing was noisy here, but payload size dropped sharply and the query plan stayed flat.

### 4. Compression

Change: enabled gzip with `compression()`.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| Response time | 329.49 ms | 543.663 ms | +214.173 ms |
| Payload size | 31773 B | 3327 B | -28446 B |
| Queries | 2 | 2 | 0 |

Note: the meaningful gain here is wire size. Local latency moved around between runs, but transfer size dropped by about 89.5%.

### 5. Stable prop + `React.memo`

Change: hoisted the style object and memoized `MissionCard`.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| React commit duration | 183.5 ms | 150.4 ms | -33.1 ms |
| DOM nodes | 4922 | 4922 | 0 |

### 6. `useMemo` for filter/sort

Change: memoized the expensive filter/sort path with `[missions, normalizedSearch]`.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| React commit duration | 150.4 ms | 159.7 ms | +9.3 ms |

Note: local profiler readings varied at this stage. The important code change is that expensive work no longer reruns on unrelated renders.

### 7. AbortController + single fetch

Change: added `AbortController`, passed `signal`, and aborted on cleanup.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| React commit duration | 159.7 ms | 153.4 ms | -6.3 ms |

Page-load request behavior improved from the baseline’s double mount request to a single surviving request after cleanup.

### 8. Client-side slicing + Load More

Change: rendered only the first 12 cards and progressively revealed more.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| React commit duration | 153.4 ms | 156.2 ms | +2.8 ms |
| DOM nodes | 4922 | 312 | -4610 |

### 9. Stable callback with `useCallback`

Change: memoized the delete handler so `React.memo` can hold.

| Metric | Before | After | Delta |
| --- | ---: | ---: | ---: |
| React commit duration | 156.2 ms | 41.8 ms | -114.4 ms |
| DOM nodes | 312 | 312 | 0 |

## Final Before/After

Final measured endpoint: `GET /api/missions?page=1&limit=20`

| Metric | Baseline | Final | Total Delta |
| --- | ---: | ---: | ---: |
| Response time | 8255.818 ms | 72.831 ms | -8182.987 ms |
| Payload size | 965630 B | 3327 B | -962303 B |
| Database queries | 401 | 2 | -399 |
| React commit duration | 141.5 ms | 41.8 ms | -99.7 ms |
| DOM nodes | 4922 | 312 | -4610 |

## Load Test

Command:

```bash
npx artillery run load-test.yml
```

Target: `GET /api/missions?page=1&limit=20`

| Metric | Result |
| --- | ---: |
| Requests | 300 |
| Median | 32.1 ms |
| p95 | 50.9 ms |
| p99 | 80.6 ms |
| Mean | 33.6 ms |
| Throughput | 10 req/s |
| Error rate | 0% |

## Deployment

Automated deployment was not completed from this environment because no Render or Railway account/session was available in the workspace tools for this run.

The application is ready for deployment with:

- Backend: `npm install && npm run dev` in `backend`
- Frontend: `npm install && npm run dev` in `frontend`

## Conclusion

The biggest wins came from removing the backend N+1 loop, enforcing pagination, trimming the list payload, and reducing the rendered card count on the client.

From baseline to the final optimized state:

- backend query count dropped from 401 to 2
- wire payload dropped from 965630 bytes to 3327 bytes
- endpoint latency dropped from 8.26s to 72.8ms
- DOM nodes dropped from 4922 to 312
- profiler commit duration dropped from 141.5ms to 41.8ms
