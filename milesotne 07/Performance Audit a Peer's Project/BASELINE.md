# Performance Audit Metrics

## Baseline

| Metric | Baseline |
| --- | --- |
| `GET /api/scores` response time | `686.998 ms` |
| Payload size | `331,857 bytes` (`324.08 KB`) |
| Successful API responses on page load | `2` |
| Search typing latency samples | `26.9 ms`, `11.1 ms`, `60.3 ms` |
| Peak typing latency sample | `60.3 ms` |
| DOM nodes after load | `12,249` |
| Score cards rendered | `305` |

## After Each Fix

| Step | Response time | Payload size | Successful API responses on load | Peak typing latency | DOM nodes | Cards |
| --- | --- | --- | --- | --- | --- | --- |
| Baseline | `686.998 ms` | `324.08 KB` | `2` | `60.3 ms` | `12,249` | `305` |
| 1. Pagination with metadata | `1,636.608 ms` | `21.35 KB` | `2` | `50.0 ms` | `849` | `20` |
| 2. Trim payload | `65.795 ms` | `2.09 KB` | `2` | `27.5 ms` | `829` | `20` |
| 3. Enable gzip compression | `61.108 ms` | `645 bytes` compressed (`2.09 KB` uncompressed) | `2` | `60.7 ms` | `829` | `20` |
| 4. AbortController cleanup | `61.108 ms` | `645 bytes` compressed (`2.09 KB` uncompressed) | `1` | `38.1 ms` | `829` | `20` |
