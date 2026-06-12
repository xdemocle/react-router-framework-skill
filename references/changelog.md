# React Router Changelog Cache
<!-- cached: 2026-06-09 -->
<!-- latest: v7.17.0 (2026-06-04) -->

## v7.17.0 — 2026-06-04

### Minor Changes
- Ship a subset of official docs inside `react-router` package (available at `node_modules/react-router/docs` for AI agents/tools)

### Patch Changes
- `@react-router/dev` - Fix future flag warning URLs, log each warning only once

### Unstable
- Prevent RSC route module server exports from being scanned by client dep optimizer when `future.unstable_optimizeDeps` is enabled

---

## v7.16.0 — 2026-05-28

### Stabilized `future.v8_trailingSlashAwareDataRequests`
Stabilized in prep for v8. Zero-code-change for most users unless doing path-inspection on `.data` requests.

### Pre-v8 Future Flag Warnings
Builds now log console warnings for unenabled future flags. Flags: `v8_middleware`, `v8_splitRouteModules`, `v8_viteEnvironmentApi`, `v8_passThroughRequests`, `v8_trailingSlashAwareDataRequests`. Set explicit `false` in `react-router.config.ts` to suppress.

---

## v7.15.1 — (patch)

---

## v7.15.0 — 2026-05-05

### Stabilizations
- `future.v8_passThroughRequests`
- `mask` and `url` parameters

### Route Matching Optimizations
- Improved performance during server-side request handling and client-side navigations

---

## v7.10.0 — (prior)

### Stabilized
- `future.v8_splitRouteModules`
- `future.v8_viteEnvironmentApi`
- `fetcher.reset()`
- `DataStrategyMatch.shouldCallHandler()`

---

## v7.9.0 — 2025-09-12

### Stable Middleware and Context APIs
- `RouterContextProvider` and `createContext` — ready for production use (unstable prefix removed)
