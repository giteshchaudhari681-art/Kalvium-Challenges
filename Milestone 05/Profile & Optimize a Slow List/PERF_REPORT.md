# PERF_REPORT

Measurement note: this terminal environment could not operate Chrome DevTools interactively, so the numbers below come from the React `Profiler` API, DOM inspection, and scripted Chrome runs against the same user interactions. Screenshot artifacts are saved at `screenshots/baseline-profiler.png` and `screenshots/after-profiler.png`.

## Baseline Observations

The unoptimized page took `4647ms` to reach a visible transaction row. The list mounted all `2000` rows immediately, which pushed the full page DOM to about `39,751` nodes.

Typing in the search box caused a noticeable freeze. A single keystroke (`a`) spent `715.8ms` in the profiled `TransactionList` commit and took about `1183ms` wall-clock before the UI settled. Typing a 3-character query (`ama`) took about `1198ms`, which felt like a full pause rather than normal input feedback.

Scrolling was also carrying unnecessary cost because the browser had to manage a 2,000-row list in the DOM at once. The headless scroll command completed in `112ms`, but the real issue was already visible in the mount cost and DOM size.

## Root Cause Analysis

How many `TransactionRow` components re-rendered on one keystroke:
The keystroke rebuilt the full filtered result set. In the baseline `a` search, that showed up as `2896` `TransactionRow` render calls in development Strict Mode, which corresponds to `1448` rendered rows after filtering.

What render time was shown for that interaction:
`715.8ms` of React work for the main `TransactionList` update commit.

Why every row re-rendered when only the filter string changed:
The parent component recomputed `filteredTransactions` on every render, recreated the `onSelect` callback inline, and rendered the full `transactions.map(...)` output. That invalidated memoization opportunities and forced the list subtree to rebuild.

What was the DOM node count before virtualization:
`2000` mounted list rows and about `39,751` total DOM nodes on the page.

## Optimisation Plan

Virtualization addresses DOM pressure and initial mount cost by rendering only the visible rows.

`React.memo` addresses unnecessary row updates, but only when row props are stable enough for shallow comparison to succeed.

`useCallback` addresses prop instability from the inline row click handler. Without it, `React.memo` is mostly neutralized because every parent render hands children a fresh function reference.

`useMemo` addresses wasted filter work by caching `filteredTransactions` until either `transactions` or `filter` actually changes.

Order:
1. Virtualization first, because rendering 2,000 rows was the largest structural problem and the biggest DOM cost.
2. `React.memo` second, to make visible row reuse possible.
3. `useCallback` third, because memoized rows still received a fresh `onSelect` prop every render.
4. `useMemo` last, because it reduces repeated computation after the larger rendering issues are contained.

Virtualization alone is not enough because it lowers DOM count but does not stop the visible rows from re-rendering when parent props keep changing.

## Implementation Notes

Virtualization:
I replaced the eager `transactions.map(...)` render with `react-window`'s `List` component. The list now uses the measured viewport height of `649px`, the measured row height of `83px`, and renders only the visible slice plus a small overscan buffer.

`React.memo`:
I wrapped `TransactionRow` in `React.memo` and added a comparator that treats unchanged row data and unchanged layout values as reusable. This was necessary because the virtualizer passes a `style` object to each row.

`useCallback`:
I moved the inline `onSelect={(id) => setSelectedId(id)}` handler into a stable `handleSelect` callback in `Transactions.jsx`. That stopped the row click prop from changing on every parent render.

`useMemo`:
I wrapped the filter calculation in `useMemo([transactions, filter])` inside `useTransactions`. That removed repeated filtering work when the inputs were unchanged.

## Results Table

| Metric | Before | After | Improvement |
| --- | ---: | ---: | ---: |
| Initial render time | `4647ms` | `2386ms` | `48.7%` faster |
| Keystroke re-render time | `715.8ms` | `23.3ms` | `96.7%` faster |
| Components re-rendered per keystroke | `2896` render calls | `24` render calls | `99.2%` fewer |
| DOM nodes in list | `2000` | `12` | `99.4%` fewer |

Supporting measurements after virtualization:
The first virtualization pass alone reduced total page DOM nodes from `39,751` to `331`, reduced mounted list rows from `2000` to `12`, and dropped one-keystroke React work from `715.8ms` to `12.3ms`.

## Reflection

Virtualization delivered the biggest win because it removed the core structural problem: the browser no longer had to mount and maintain 2,000 row components at once. I would avoid virtualization for short lists where the complexity outweighs the benefit, avoid `React.memo` for tiny cheap components whose props change every render anyway, avoid `useCallback` when function identity is not part of any memoized boundary, and avoid `useMemo` when the computation is trivial or the cached value is more expensive to maintain than to recompute.
