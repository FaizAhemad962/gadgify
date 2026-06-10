# PERFORMANCE_REPORT - Gadgify

Audit date: 2026-06-10

## Measured Repository Evidence

The existing `frontend/dist/assets` output contains:

| Asset/chunk | Uncompressed size |
|---|---:|
| `brand-icon-*.png` | 2,245,688 bytes |
| `vendor-mui-*.js` | 464,906 bytes |
| `OrderDetailPage-*.js` | 427,869 bytes |
| `AdminDashboard-*.js` | 394,900 bytes |
| shared `index-*.js` | 323,142 bytes |
| `AppDataGrid-*.js` | 320,555 bytes |
| `html2canvas.esm-*.js` | 201,041 bytes |
| `index.es-*.js` | 158,557 bytes |

The backend uploads directory is approximately 111 MB across 89 local files. The frontend source also tracks about 1.3 MB of screenshots.

Frontend lint currently fails with 12 errors and 5 warnings. The backend TypeScript build passes. Frontend build and Jest runs did not terminate within the two-minute audit timeout, so a clean production build/test result was not established.

## Frontend Findings

### P1. Oversized brand image

- **Impact: High (LCP/network/memory)**
- **Root cause:** A 2.25 MB PNG is imported into the application bundle.
- **Solution:** Replace it with a properly sized SVG or AVIF/WebP variants. Set explicit dimensions and preload only the actual LCP image.
- **Target:** Logo under 30 KB where practical.

### P2. Large shared and route chunks

- **Impact: High (load, parse, TTI/INP)**
- **Root cause:** MUI icons/material are grouped into a 465 KB manual chunk; PDF, canvas, charts, data grid, and payment libraries enter large route graphs. The 1 MB warning threshold hides useful alerts.
- **Solution:** Remove broad barrel imports, dynamically import PDF/chart/data-grid/payment functionality at interaction time, and restore a 250-300 KB warning/budget.

### P3. Product API defeats pagination

- **Impact: High (TTFB, response size, server CPU/memory)**
- **Root cause:** The backend loads all matching products with all ratings/media, calculates averages, filters/sorts, and only then slices a page.
- **Solution:** Query bounded rows in PostgreSQL, persist/aggregate rating metrics, select only card fields, cap `limit`, and return cursor metadata.

### P4. Infinite product list grows the DOM indefinitely

- **Impact: High (scroll stutter and memory)**
- **Root cause:** `ProductsPage` appends every fetched page to `allProducts`. The installed virtualization libraries are not applied to the main catalog.
- **Solution:** Use a virtualized grid/window, paginate visibly, or discard distant pages. Keep image/video nodes outside the viewport unmounted.

### P5. Every homepage countdown tick rerenders a large page

- **Impact: Medium**
- **Root cause:** `HomePage` owns a one-second timer while also rendering a very large component tree.
- **Solution:** Move the timer into a memoized leaf component and update once per minute unless seconds are visible.

### P6. Page transition forces an extra route render

- **Impact: Medium**
- **Root cause:** `PageTransition` synchronously sets visibility false in an effect and true after 10 ms, animating the entire routed tree.
- **Solution:** Remove the transition or key a lightweight wrapper by pathname using CSS opacity only. Respect `prefers-reduced-motion`.

### P7. Context updates have broad blast radius

- **Impact: Medium**
- **Root cause:** Many global providers wrap the entire app and create new value/function objects on render.
- **Solution:** Memoize stable provider values, split state/action contexts where useful, and move server state to React Query.

### P8. Observer and timer lifecycle defects

- **Impact: Medium**
- **Root cause:** `useLazyLoad` accepts an options object dependency, which can recreate observers each render. Ref cleanup reads mutable `ref.current`. Cart buffering has no provider-unmount timer cleanup. Error notification timers are not centrally tracked/cancelled.
- **Solution:** Stabilize options, capture observed nodes in effect scope, and cancel all timers/requests on unmount.

### P9. Retry policy adds visible latency and traffic

- **Impact: Medium**
- **Root cause:** Axios retries 5xx/network requests while React Query also retries queries, producing stacked retries and delays up to seconds.
- **Solution:** Own retries in one layer, retry only idempotent requests, honor `Retry-After`, and never automatically retry payment mutations without idempotency.

### P10. Media delivery is unoptimized

- **Impact: High**
- **Root cause:** Original uploads, including large videos, are served directly by Express. Images lack generated responsive variants and durable CDN delivery.
- **Solution:** Store media in Blob Storage, generate thumbnail/card/detail sizes, transcode video, return width/height metadata, and use `srcset`, `sizes`, and poster images.

### P11. Manual chunk configuration is brittle

- **Impact: Medium**
- **Root cause:** Source files are named directly in `manualChunks`; homepage sections are still statically imported through an index, so comments describing lazy sections do not match behavior.
- **Solution:** Use dynamic imports at component boundaries and let Rollup split dependencies unless a measured cache strategy justifies manual chunks.

### P12. Frontend caching can cache HTML immutably

- **Impact: High**
- **Root cause:** IIS adds `Cache-Control: public, max-age=604800, immutable` globally.
- **Solution:** Serve `index.html` with `no-cache`; serve hashed JS/CSS/images with `public, max-age=31536000, immutable`.

## Backend Performance Findings

- Product catalog queries are the most obvious bottleneck and should be fixed first.
- `getOrders` returns all user orders and nested product media without pagination.
- Search uses unbounded `contains` queries; add limits and PostgreSQL trigram/full-text indexes when catalog size requires them.
- Payment stock decrement uses sequential per-item updates; transactionally update/validate inventory.
- Health checks hit PostgreSQL for every call. Separate shallow liveness from dependency readiness.
- Redis blacklist statistics use `KEYS`, which blocks Redis on large keyspaces; use `SCAN` or metrics counters.

## Core Web Vitals Plan

No live CWV data was available. Add Web Vitals RUM and Lighthouse CI against staging.

Initial budgets:

- LCP <= 2.5 s at p75 mobile.
- INP <= 200 ms at p75.
- CLS <= 0.1 at p75.
- Initial route JS <= 250 KB compressed.
- Any lazy route chunk <= 200 KB compressed unless explicitly approved.
- Product card image <= 80 KB typical; hero image <= 200 KB typical.

## Quick Wins

1. Replace the 2.25 MB logo.
2. Correct HTML/static caching headers.
3. Move countdown into a leaf and remove whole-page transition animation.
4. Lazy-load PDF, charts, DataGrid, and payment SDKs at use time.
5. Paginate product/order queries in PostgreSQL and select fewer fields.
6. Virtualize or visibly paginate the catalog.
7. Remove duplicate retry layers and production console logs.
