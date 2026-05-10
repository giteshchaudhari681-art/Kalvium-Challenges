# ShopDash States Audit

## Move 1: Screen-by-screen gaps

| Screen | What the user sees while loading | What the user sees if the API call fails | What the user sees if the API returns empty data |
| --- | --- | --- | --- |
| Dashboard Overview | The page title and the large chart placeholder render, but the four KPI cards area stays blank. It looks like a missing section rather than a loading state. | Exactly the same as loading: the KPI cards never appear, no explanation is shown, and the chart placeholder stays on screen as if the page is half-finished. | There is no empty handling. If stats come back missing, the KPI area stays blank with no explanation of why the overview has no metrics yet. |
| Orders | The title and `Export Report` button render, but the orders list area is an empty white gap. Users get no signal that order cards are still loading. | Exactly the same as loading: the list stays empty and there is no message, no retry action, and no indication that the request failed. | An empty array renders nothing below the header, so it looks like the page is broken or the content got clipped. |
| Products | The title and action buttons render, but the inventory grid becomes a blank content area until data arrives. | Exactly the same as loading: the page body stays empty with no explanation and no recovery path. | An empty array produces an empty grid, so the page looks unfinished instead of intentionally empty. |
| Customers | The title and table shell render, including column headers, but the table body is completely blank. It reads like missing rows rather than loading. | Exactly the same as loading: the table body stays empty and there is no error copy or retry affordance. | The table headers remain visible with zero rows beneath them, which looks like a rendering bug instead of an empty state. |

## Move 2: Missing-state checklist

| Screen | Loading missing | Error missing | Empty missing |
| --- | --- | --- | --- |
| Dashboard Overview | Yes | Yes | Yes |
| Orders | Yes | Yes | Yes |
| Products | Yes | Yes | Yes |
| Customers | Yes | Yes | Yes |

## Move 3: Loading-state plan

Decision: use skeletons, not spinners, because every affected screen is a list, table, or dashboard layout where shape preview reduces perceived wait and layout shift better than a generic spinner.

Orders skeleton plan: render 4 placeholder cards that mirror `OrderCard` with these utilities:

- Wrapper: `relative overflow-hidden rounded-lg border border-slate-200 bg-white p-4 shadow-sm`
- Left column blocks: `h-4 w-24 rounded-full bg-slate-200` and `mt-3 h-3 w-32 rounded-full bg-slate-100`
- Right column blocks: `h-4 w-16 rounded-full bg-slate-200 ml-auto` and `mt-3 h-6 w-20 rounded-full bg-slate-100 ml-auto`
- Shimmer overlay: `before:absolute before:inset-0 before:-translate-x-full before:animate-shimmer before:bg-gradient-to-r before:from-transparent before:via-white/70 before:to-transparent`

Loading patterns by screen:

- Dashboard Overview: 4 stat-card skeletons plus a large chart panel skeleton.
- Orders: 4 skeleton cards shaped like `OrderCard`.
- Products: 6 skeleton cards shaped like `ProductCard`.
- Customers: 5 skeleton table rows shaped like `CustomerRow`.

## Move 4: Error copy

- Dashboard Overview: "We couldn't load your storefront overview. Check your connection and try again to refresh today's metrics."
- Orders: "We couldn't load your orders. Check your connection and try again to bring the latest order activity back."
- Products: "We couldn't load your inventory. Try again to reconnect to the product catalog and stock counts."
- Customers: "We couldn't load your customer list. Try again to reconnect and restore shopper profiles."

All error states should show a visible Retry button.

## Move 5: Empty-state plan

| Screen | Empty title | Supporting message | CTA |
| --- | --- | --- | --- |
| Dashboard Overview | No performance data yet | Your overview cards will appear once orders, revenue, and customer activity start flowing into ShopDash. | `Refresh overview` |
| Orders | No orders yet | New orders will appear here as soon as customers start checking out. | `Refresh orders` |
| Products | No products in inventory | Add your first product to start tracking stock, pricing, and catalog performance. | `Add product` |
| Customers | No customers to show | Customer profiles will appear here after shoppers place orders or create accounts. | `Refresh customers` |

Search-specific empty states are not currently needed because this app does not expose search or filtering results views yet.

## Move 6: Orders state sketch plan

Sketch deliverable: create a lightweight wireframe image showing the Orders page in three panels:

- Loading panel with four stacked order skeletons.
- Error panel with alert icon, recovery copy, and Retry button.
- Empty panel with inbox-style illustration, title, message, and CTA.

The sketch image will be committed into the repo and referenced in the final PR materials.
