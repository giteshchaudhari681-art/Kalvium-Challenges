# TxnTracker Performance Challenge

Welcome to the TxnTracker React Performance Engineering challenge. This version includes the completed optimization pass and the supporting measurements.

## Initial Setup

```bash
npm install
npm run dev
```

## Live Deployment

https://txntracker-list-optimisation-gitesh.vercel.app

## Summary

The dashboard originally rendered 2,000 transaction rows at once and froze on search input. The optimized version applies:

- `react-window` virtualization
- `React.memo` row memoization
- `useCallback` for stable row selection
- `useMemo` for cached filtering

Detailed measurements and analysis are documented in [PERF_REPORT.md](./PERF_REPORT.md).
