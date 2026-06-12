# React Router Changelog Cache
<!-- cached: 2026-06-12 -->
<!-- latest: v7.17.0 (2026-06-04) -->

## v7.17.0

Date: 2026-06-04

### Minor Changes

- `react-router` - Ship a subset of the official documentation inside the `react-router` package ([#15121](https://github.com/remix-run/react-router/pull/15121))
  - Markdown docs are now available in `node_modules/react-router/docs`, letting AI coding agents and the React Router agent skills read official docs locally
  - Excludes auto-generated API docs (`api/`), `community/` content, and tutorials (`tutorials/`)

### Patch Changes

- `@react-router/dev` - Fix future flag warning URLs and only log each future flag warning one time ([#15138](https://github.com/remix-run/react-router/pull/15138))

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `@react-router/dev` - Prevent RSC route module server exports from being scanned by the client dependency optimizer when `future.unstable_optimizeDeps` is enabled. ([#15005](https://github.com/remix-run/react-router/pull/15005))

**Full Changelog**: [`v7.16.0...v7.17.0`](https://github.com/remix-run/react-router/compare/react-router@7.16.0...react-router@7.17.0)
## v7.16.0

Date: 2026-05-28

### What's Changed

#### Stabilized `future.v8_trailingSlashAwareDataRequests`

We've stabilized this flag in preparation for the upcoming v8 release. Unless you are doing specific path-inspection on `.data` requests or have specific CDN/caching/pre-rendering logic around `.data` requests, this should largely be a zero-code-change adoptions. Please see the [docs](https://reactrouter.com/upgrading/future#futurev8_trailingslashawaredatarequests) for more info.

#### Pre-v8 Future Flag Warnings

In preparation for the upcoming v8 release, `7.16.0` begins logging console warnings during builds for future flags that you have not enabled yet. If you have all future flags enabled, the v8 upgrade should be mostly non-breaking (short of some underlying dependency minimum versions bumps - React 19, Node 22.12, Vite 7). You can suppress these warnings until you are ready top adopt flags by setting an explicit `false` in your `react-router.config.ts`.

### Minor Changes

- `react-router` - Stabilize `future.unstable_trailingSlashAwareDataRequests` as `future.v8_trailingSlashAwareDataRequests` ([#15098](https://github.com/remix-run/react-router/pull/15098))
- `@react-router/dev` - Log future flag warnings for upcoming React Router v8 flags ([#15029](https://github.com/remix-run/react-router/pull/15029))
  - `v8_middleware`, `v8_splitRouteModules`, `v8_viteEnvironmentApi`, `v8_passThroughRequests`, `v8_trailingSlashAwareDataRequests`

### Patch Changes

- `react-router` - Disable manifest path when lazy route discovery is disabled ([#15068](https://github.com/remix-run/react-router/pull/15068))
- `react-router` - Fix browser URL creation to use the configured history `window` instead of the global `window` ([#15066](https://github.com/remix-run/react-router/pull/15066))
  - Pass the history/router window through to `createBrowserURLImpl` so custom window contexts keep the correct URL origin.
- `react-router` - Fix `useNavigation()` return type to preserve discriminated union across navigation states ([#15095](https://github.com/remix-run/react-router/pull/15095))
- `react-router` - Widen `MetaDescriptor` `script:ld+json` type from `LdJsonObject` to `LdJsonObject | LdJsonObject[]` to permit multiple JSON-LD schemas in a single `<script type="application/ld+json">` tag emitted by `<Meta />` ([#15082](https://github.com/remix-run/react-router/pull/15082))
- `react-router-dom` - Remove stale/invalid `unpkg` field from `package.json` ([#15075](https://github.com/remix-run/react-router/pull/15075))
  - This was removed from other packages with the release of v7 but missed in the `react-router-dom` re-export package
- `@react-router/express` - Ignore writes after Express responses close ([#15107](https://github.com/remix-run/react-router/pull/15107))
  - Avoid surfacing client disconnects as adapter errors when the response stream has already been destroyed or ended
- `@react-router/node` - Honor Node writable backpressure in `writeReadableStreamToWritable` and `writeAsyncIterableToWritable` ([#15071](https://github.com/remix-run/react-router/pull/15071))
  - Await `'drain'` when `writable.write()` returns `false` instead of letting chunks accumulate in the writable's internal buffer
  - Reject (rather than hang) if the writable errors or closes mid-stream
- `@react-router/serve` - Normalize `assetsBuildDirectory` path separators in `react-router-serve` so Windows-built server artifacts can serve `/assets/*` correctly when run on Linux ([#14982](https://github.com/remix-run/react-router/pull/14982))

**Full Changelog**: [`v7.15.1...v7.16.0`](https://github.com/remix-run/react-router/compare/react-router@7.15.1...react-router@7.16.0)
## v7.15.1

Date: 2026-05-14

### What's New

#### `useRouterState` (unstable)

Following our [Less is More](https://github.com/remix-run/react-router/blob/main/GOVERNANCE.md#design-goals) design goal, this release includes a new `unstable_useRouterState()` hook (Framework + Data Mode) that consolidates access to active and pending router states ([RFC](https://github.com/remix-run/react-router/discussions/12358), [Roadmap Issue](https://github.com/remix-run/react-router/issues/13073)).

This should allow you to consolidate usages of a bunch of different hooks which will likely be marked deprecated later on in v8 and potentially removed in an eventual v9:

```ts
let { active, pending } = unstable_useRouterState();

// Active is always populated with the current location
active.location; // replaces `useLocation()`
active.searchParams; // replaces `useSearchParams()[0]`
active.params; // replaces `useParams()`
active.matches; // replaces `useMatches()`
active.type; // replaces `useNavigationType()`

// Pending is only populated during a navigation
pending.location; // replaces `useNavigation().location`
pending.searchParams; // equivalent to `new URLSearchParams(useNavigation().search)`
pending.params; // Not directly accessible today
pending.matches; // Not directly accessible today
pending.type; // Not directly accessible today
pending.state; // replaces `useNavigation().state`
pending.formMethod; // replaces useNavigation().formMethod
pending.formAction; // replaces useNavigation().formAction
pending.formEncType; // replaces useNavigation().formEncType
pending.formData; // replaces useNavigation().formData
pending.json; // replaces useNavigation().json
pending.text; // replaces useNavigation().text
```

### Patch Changes

- `react-router` - Memoize `useFetchers` to return a stable identity and only change if fetchers changed ([#15028](https://github.com/remix-run/react-router/pull/15028))
- `react-router` - Update router to operate on fetcher Maps in an immutable manner to avoid delayed React renders from potentially reading an updated but not yet committed Map. This could result in brief flickers in some fetcher-driven optimistic UI scenarios ([#15028](https://github.com/remix-run/react-router/pull/15028))
- `react-router` - Fix `serverLoader()` returning stale SSR data when a client navigation aborts pending hydration before the hydration `clientLoader` resolves ([#15022](https://github.com/remix-run/react-router/pull/15022))
- `react-router` - Fix `RouterProvider` `onError` callback not being called for synchronous initial loader errors in SPA mode ([#15039](https://github.com/remix-run/react-router/pull/15039)) ([#14942](https://github.com/remix-run/react-router/pull/14942))
- `react-router` - Internal refactor to consolidate mutation request detection through shared utility ([#15033](https://github.com/remix-run/react-router/pull/15033))
- `@react-router/dev` - Fix `basename` conflicting with `app` directory name when Vite `base` is set ([#15027](https://github.com/remix-run/react-router/pull/15027))
  - When the Vite `base` config and React Router `basename` both match the app directory name (e.g. `base: "/app/"`, `basename: "/app/"`), Vite would strip the base prefix from server-build virtual module import paths, causing "Failed to load url /root.tsx" errors
  - The fix uses `/@fs/` absolute paths for those imports to bypass Vite's base-stripping logic

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `react-router` - Add a new `unstable_useRouterState()` hook that consolidates access to active and pending router states (RFC: #12358) ([#15017](https://github.com/remix-run/react-router/pull/15017))
  - Data/Framework/RSC only — throws when used without a data router

**Full Changelog**: [`v7.15.0...v7.15.1`](https://github.com/remix-run/react-router/compare/react-router@7.15.0...react-router@7.15.1)
## v7.15.0

Date: 2026-05-05

### What's Changed

#### Stabilizations

We've stabilized a bunch of APIs in this release in preparation for a React Router v8 release hopefully in the next month or two. These flag/prop renames are breaking changes if you've already opted into the unstable APIs so please make sure you make the appropriate changes if so.

- `future.unstable_passThroughRequests` → `future.v8_passThroughRequests`
- `future.unstable_subResourceIntegrity` → top-level `config.subResourceIntegrity`
- `prerender.unstable_concurrency` → `prerender.concurrency`
- `unstable_url` → `url` (loader, action, middleware, instrumentation args)
- `unstable_instrumentations` → `instrumentations`
  - Plus associated types (`ServerInstrumentation`, `ClientInstrumentation`, etc.)
- `unstable_pattern` → `pattern` (loader, action, middleware, instrumentation args)
- `unstable_defaultShouldRevalidate` → `defaultShouldRevalidate`
- `unstable_useTransitions` → `useTransitions`
- `unstable_mask` → `mask` (on `<Link>`, `useLinkClickHandler`, `useNavigate`, and `Location`)

#### Route matching optimizations

We've added a handful of route matching optimizations in this release for Framework and Data mode. The changes are mostly related to caching the internal flattened/ranked route branches and reducing additional calls to `matchRoutes` along the critical path. This should result in improved performance during both server-side request handling and client-side navigations.

### Minor Changes

- `react-router` - Stabilize `unstable_defaultShouldRevalidate` as `defaultShouldRevalidate` on `<Link>`, `<Form>`, `useLinkClickHandler`, `useSubmit`, `fetcher.submit`, and `setSearchParams` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `react-router` - Stabilize the instrumentation APIs ([14999](https://github.com/remix-run/react-router/pull/14999))
  - `unstable_instrumentations` is now `instrumentations`
  - `unstable_pattern` is now `pattern`
  - The `unstable_ServerInstrumentation`, `unstable_ClientInstrumentation`, `unstable_InstrumentRequestHandlerFunction`, `unstable_InstrumentRouterFunction`, `unstable_InstrumentRouteFunction`, and `unstable_InstrumentationHandlerResult` types have had their `unstable_` prefixes removed
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `react-router` - Stabilize `unstable_mask` as `mask` on `<Link>`, `useLinkClickHandler`, and `useNavigate`, and rename the corresponding `Location.unstable_mask` field to `Location.mask` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `react-router` - Stabilize the `unstable_normalizePath` option on `staticHandler.query` and `staticHandler.queryRoute` as `normalizePath` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `react-router` - Stabilize `future.unstable_passThroughRequests` as `future.v8_passThroughRequests` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `react-router` - Remove `unstable_subResourceIntegrity` from the runtime `FutureConfig` type; the flag is now controlled by the top-level `subResourceIntegrity` option in `react-router.config.ts` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `react-router` - Stabilize `unstable_url` as `url` on `loader`, `action`, and `middleware` function args ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `react-router` - Stabilize `unstable_useTransitions` as `useTransitions` on `<BrowserRouter>`, `<HashRouter>`, `<HistoryRouter>`, `<MemoryRouter>`, `<Router>`, `<RouterProvider>`, `<HydratedRouter>`, and `useLinkClickHandler` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `@react-router/dev` - Stabilize `future.unstable_passThroughRequests` as `future.v8_passThroughRequests` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `@react-router/dev` - Stabilize `prerender.unstable_concurrency` as `prerender.concurrency` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly
- `@react-router/dev` - Stabilize `future.unstable_subResourceIntegrity` as a top-level `subResourceIntegrity` config option in `react-router.config.ts` ([14999](https://github.com/remix-run/react-router/pull/14999))
  - ⚠️ This is a breaking change if you have already opted into the unstable version - you will need to update your code accordingly

### Patch Changes

- `react-router` - Add `nonce` to `<Scripts>` `<link rel="modulepreload">` elements (if provided) ([af5d49b](https://github.com/remix-run/react-router/commit/af5d49b))
- `react-router` - Fix a bug with `unstable_defaultShouldRevalidate={false}` where parent routes that did not export a `shouldRevalidate` function could be incorrectly included in the single fetch call for new child route data ([#15012](https://github.com/remix-run/react-router/pull/15012))
- `react-router` - Mark `mask` as an optional field in `Location` for easier mocking in unit tests ([#14999](https://github.com/remix-run/react-router/pull/14999))
- `react-router` - Improve server-side route matching performance by pre-computing flattened/cached route branches ([#14967](https://github.com/remix-run/react-router/pull/14967))
  - Performance benchmarks showed roughly a 10-15% improvement in server-side request handling performance
- `react-router` - Cache flattened/ranked route branches to optimize server-side route matching ([#14967](https://github.com/remix-run/react-router/pull/14967))
- `react-router` - Improve route matching performance in Framework/Data Mode ([#14971](https://github.com/remix-run/react-router/pull/14971))
  - Avoiding unnecessary calls to `matchRoutes` in data router scenarios
    - This includes adding back the optimization that was removed in `7.6.0` ([#13562](https://github.com/remix-run/react-router/pull/13562))
    - The issues that prompted the revert have been addressed by using the available router `matches` but always updating `match.route` to the latest route in the `manifest`
  - Leverage pre-computed pre-computing flattened/cached route branches during client side route matching
  - Performance benchmarks showed roughly a 15-30% improvement in server-side request handling performance

**Full Changelog**: [`v7.14.2...v7.15.0`](https://github.com/remix-run/react-router/compare/react-router@7.14.2...react-router@7.15.0)
## v7.14.2

Date: 2026-04-21

### Patch Changes

- `react-router` - Remove the un-documented custom error serialization logic from the internal turbo-stream implementation. React Router only automatically handles serialization of `Error` and it's standard subtypes (`SyntaxError`, `TypeError`, etc.). ([#14992](https://github.com/remix-run/react-router/pull/14992))
- `react-router` - Properly handle parent middleware redirects during `fetcher.load` ([#14974](https://github.com/remix-run/react-router/pull/14974))
- `react-router` - Remove redundant `Omit<RouterProviderProps, "flushSync">` from `react-router/dom` `RouterProvider` ([#14874](https://github.com/remix-run/react-router/pull/14874))
- `react-router` - Improved types for `generatePath`'s `param` arg ([#14984](https://github.com/remix-run/react-router/pull/14984))
  - Type errors when required params are omitted:

    ```ts
    // Before
    // Passes type checks, but throws at runtime 💥
    generatePath(":required", { required: null });

    // After
    generatePath(":required", { required: null });
    //                          ^^^^^^^^ Type 'null' is not assignable to type 'string'.ts(2322)
    ```

  - Allow omission of optional params:

    ```ts
    // Before
    generatePath(":optional?", {});
    //                         ^^ Property 'optional' is missing in type '{}' but required in type '{ optional: string | null | undefined; }'.ts(2741)

    // After
    generatePath(":optional?", {});
    ```

  - Allows extra keys:

    ```ts
    // Before
    generatePath(":a", { a: "1", b: "2" });
    //                           ^ Object literal may only specify known properties, and 'b' does not exist in type '{ a: string; }'.ts(2353)

    // After
    generatePath(":a", { a: "1", b: "2" });
    ```

- `@react-router/dev` - Fix typegen for layouts without pages ([#14875](https://github.com/remix-run/react-router/pull/14875))
  - Previously, typegen could produce `pages: ;` in `.react-router/types/+routes.ts` when a route corresponded to 0 pages
  - Now, `pages: never;` is correctly generated for those cases

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `@react-router/dev` - For `unstable_reactRouterRSC` Vite plugin consumers, require `@vitejs/plugin-react` in user Vite config, and more reliably split route modules ([#14965](https://github.com/remix-run/react-router/pull/14965))
  - ⚠️ This is a breaking change if you have begun using the `unstable_reactRouterRSC` Vite plugin - please install `@vitejs/plugin-react` and add the `react` plugin to your Vite plugins array.

**Full Changelog**: [`v7.14.1...v7.14.2`](https://github.com/remix-run/react-router/compare/react-router@7.14.1...react-router@7.14.2)
## v7.14.1

Date: 2026-04-13

### Patch Changes

- `react-router` - Fix a potential race condition that can occur when rendering a `HydrateFallback` and initial loaders land before the `router.subscribe` call happens in the `RouterProvider` layout effect ([#14497](https://github.com/remix-run/react-router/pull/14497))
- `react-router` - Normalize double-slashes in redirect paths ([#14962](https://github.com/remix-run/react-router/pull/14962))
- `@react-router/dev` - Add TypeScript 6 support to peer dependency ranges ([#14935](https://github.com/remix-run/react-router/pull/14935))

**Full Changelog**: [`v7.14.0...v7.14.1`](https://github.com/remix-run/react-router/compare/react-router@7.14.0...react-router@7.14.1)
## v7.14.0

Date: 2026-04-02

### Minor Changes

- Add support for Vite 8 ([#14876](https://github.com/remix-run/react-router/pull/14876))

### Patch Changes

- `react-router` - Remove recursion from vendored `turbo-stream` v2 implementation allowing for encoding/decoding of large payloads ([#14838](https://github.com/remix-run/react-router/pull/14838))
- `react-router` - Fix `encodeViaTurboStream` memory leak via unremoved `AbortSignal` listener ([#14900](https://github.com/remix-run/react-router/pull/14900))
- `@react-router/dev` - Support for prerendering multiple server bundles with `v8_viteEnvironmentApi` ([#14921](https://github.com/remix-run/react-router/pull/14921))

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `@react-router/dev` - Pre-rendering and SPA Mode support for RSC Framework Mode ([#14907](https://github.com/remix-run/react-router/pull/14907))
- `@react-router/dev` - Update `react-router reveal` to support RSC Framework Mode for `entry.client`, `entry.rsc`, `entry.ssr` ([#14904](https://github.com/remix-run/react-router/pull/14904))
- `react-router` - Support `<Link prefetch>` in RSC Framework Mode ([#14902](https://github.com/remix-run/react-router/pull/14902))
- `react-router` - Add support for new route module exports in unstable RSC Framework Mode ([#14901](https://github.com/remix-run/react-router/pull/14901))
  - ⚠️ This is a breaking change if you have already adopted RSC Framework Mode in it's unstable state - you will need to update your route modules to export the new annotations
  - The following route module components have their own mutually exclusive server component counterparts:

    | Client Component export | Server Component export |
    | ----------------------- | ----------------------- |
    | `default`               | `ServerComponent`       |
    | `ErrorBoundary`         | `ServerErrorBoundary`   |
    | `Layout`                | `ServerLayout`          |
    | `HydrateFallback`       | `ServerHydrateFallback` |

  - If you were previously exporting a `ServerComponent`, your `ErrorBoundary`, `Layout`, and `HydrateFallback` were also implicitly server components
  - If you want to keep those as server components - rename them and prefix them with `Server`
  - If you were previously importing the implementations of those components from a client module, you can inline them

    ```tsx
    // Before
    import { ErrorBoundary as ClientErrorBoundary } from "./client";

    export function ServerComponent() {
      // ...
    }

    export function ErrorBoundary() {
      return <ClientErrorBoundary />;
    }

    export function Layout() {
      // ...
    }

    export function HydrateFallback() {
      // ...
    }
    ```

    ```tsx
    // After

    export function ServerComponent() {
      // ...
    }

    export function ErrorBoundary() {
      // previous implementation of ClientErrorBoundary, this is now a client component
    }

    export function ServerLayout() {
      // rename previous Layout export to ServerLayout to make it a server component
    }

    export function ServerHydrateFallback() {
      // rename previous HydrateFallback export to ServerHydrateFallback to make it a server component
    }
    ```

**Full Changelog**: [`v7.13.2...v7.14.0`](https://github.com/remix-run/react-router/compare/react-router@7.13.2...react-router@7.14.0)
## v7.13.2

Date: 2026-03-23

### What's Changed

#### Pass-through Requests (unstable)

By default, React Router normalizes the `request.url` passed to your `loader`, `action`, and `middleware` functions by removing React Router's internal implementation details (`.data` suffixes, `index` + `_routes` query params). This release introduces a new `future.unstable_passThroughRequests` flag to disable this normalization and pass the raw HTTP `request` instance to your handlers.

In addition to reducing server-side overhead by eliminating multiple `new Request()` calls on the critical path, this also provides additional visibility to your route handlers/instrumentations allowing you to differentiate document from data requests.

If you were previously relying on the normalization of `request.url`, you can switch to use the new sibling `unstable_url` parameter which contains a `URL` instance representing the normalized location:

```tsx
// ❌ Before: you could assume there was no `.data` suffix in `request.url`
export async function loader({ request }: Route.LoaderArgs) {
  let url = new URL(request.url);
  if (url.pathname === "/path") {
    // This check will fail with the flag enabled because the `.data` suffix will
    // exist on data requests
  }
}

// ✅ After: use `unstable_url` for normalized routing logic and `request.url`
// for raw routing logic
export async function loader({ request, unstable_url }: Route.LoaderArgs) {
  if (unstable_url.pathname === "/path") {
    // This will always have the `.data` suffix stripped
  }

  // And now you can distinguish between document versus data requests
  let isDataRequest = new URL(request.url).pathname.endsWith(".data");
}
```

#### Route handlers/middleware `unstable_url` parameter

We have added a new `unstable_url: URL` parameter to route handler methods (`loader`, `action`, `middleware`, etc.) that contains the normalized URL the application is navigating to or fetching with React Router implementation details removed (`.data`suffix, `index`/`_routes` query params).

This parameter is primarily needed when adopting the new `future.unstable_passthroughRequests` future flag as a way to continue accessing the normalized URL. If you don't have the flag enabled, then `unstable_url` will match `request.url`.

### Patch Changes

- `react-router` - Fix `clientLoader.hydrate` when an ancestor route is also hydrating a `clientLoader` ([#14835](https://github.com/remix-run/react-router/pull/14835))
- `react-router` - Fix type error when passing Framework Mode route components using `Route.ComponentProps` to `createRoutesStub` ([#14892](https://github.com/remix-run/react-router/pull/14892))
- `react-router` - Fix percent encoding in relative path navigation ([#14786](https://github.com/remix-run/react-router/pull/14786))
- `react-router` - Internal refactor to consolidate framework-agnostic/React-specific route type layers - no public API changes ([#14765](https://github.com/remix-run/react-router/pull/14765))
- `@react-router/dev` - Fix `react-router dev` crash when Unix socket files exist in the project root ([#14854](https://github.com/remix-run/react-router/pull/14854))
- `@react-router/dev` - Escape redirect locations in pre-rendered redirect HTML ([#14880](https://github.com/remix-run/react-router/pull/14880))
- `create-react-router` - replace `chalk` with `picocolors` ([#14837](https://github.com/remix-run/react-router/pull/14837))

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `react-router` - Sync protocol validation to RSC flows ([#14882](https://github.com/remix-run/react-router/pull/14882))
- `react-router` - Add `future.unstable_passThroughRequests` flag ([#14775](https://github.com/remix-run/react-router/pull/14775))
- `react-router` - Add a new `unstable_url: URL` parameter to route handler methods (`loader`, `action`, `middleware`, etc.) representing the normalized URL the application is navigating to or fetching, with React Router implementation details removed (`.data`suffix, `index`/`_routes` query params) ([#14775](https://github.com/remix-run/react-router/pull/14775))

**Full Changelog**: [`v7.13.1...v7.13.2`](https://github.com/remix-run/react-router/compare/react-router@7.13.1...react-router@7.13.2)
## v7.13.1

Date: 2026-02-23

### What's Changed

#### URL Masking (unstable)

This release includes a new `<Link unstable_mask>` API which brings first-class support for URL masking to Framework/Data Mode ([RFC](https://github.com/remix-run/react-router/discussions/9864)). This allows the same type of UI you could achieve in Declarative Mode via [manual `backgroundLocation` management](https://github.com/remix-run/react-router/tree/main/examples/modal). That example has been converted to Data Mode using the new API [here](https://github.com/remix-run/react-router/tree/main/examples/modal-data-router).

### Patch Changes

- `react-router` - Clear timeout when `turbo-stream` encoding completes ([#14810](https://github.com/remix-run/react-router/pull/14810))
- `react-router` - Improve error message when `Origin` header is invalid ([#14743](https://github.com/remix-run/react-router/pull/14743))
- `react-router` - Fix `matchPath` optional params matching without a `"/"` separator. ([#14689](https://github.com/remix-run/react-router/pull/14689))
  - `matchPath("/users/:id?", "/usersblah")` now returns null
  - `matchPath("/test_route/:part?", "/test_route_more")` now returns null.
- `react-router` - Fix `HydrateFallback` rendering during initial lazy route discovery with matching splat route ([#14740](https://github.com/remix-run/react-router/pull/14740))
- `react-router` - Preserve query parameters and hash on manifest version mismatch reload ([#14813](https://github.com/remix-run/react-router/pull/14813))

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `react-router` - RSC: fix null reference exception in bad codepath leading to invalid route tree comparisons ([#14780](https://github.com/remix-run/react-router/pull/14780))
- `react-router` - RSC: add `unstable_getRequest` API ([#14758](https://github.com/remix-run/react-router/pull/14758))
- `react-router` - RSC: Update failed origin checks to return a 400 status and appropriate UI instead of a generic 500 ([#14755](https://github.com/remix-run/react-router/pull/14755))
- `react-router` - Add support for `<Link unstable_mask>` in Framework/Data Mode which allows users to navigate to a URL in the router but "mask" the URL displayed in the browser ([#14716](https://github.com/remix-run/react-router/pull/14716))
  - This is useful for contextual routing usages such as displaying an image in a modal on top of a gallery, but displaying a browser URL directly to the image that can be shared and loaded without the contextual gallery in the background
  - The masked location, if present, will be available on `useLocation().unstable_mask` so you can detect whether you are currently masked or not
  - Masked URLs only work for SPA use cases, and will be removed from `history.state` during SSR
  - This provides a first-class API to mask URLs in Framework/Data Mode to achieve the same behavior you could do in Declarative Mode via [manual `backgroundLocation` management](https://github.com/remix-run/react-router/tree/main/examples/modal).

    ```tsx
    // routes/gallery.tsx
    export function clientLoader({ request }: Route.LoaderArgs) {
      let sp = new URL(request.url).searchParams;
      return {
        images: getImages(),
        // When the router location has the image param, load the modal data
        modalImage: sp.has("image") ? getImage(sp.get("image")!) : null,
      };
    }

    export default function Gallery({ loaderData }: Route.ComponentProps) {
      return (
        <>
          <GalleryGrid>
            {loaderData.images.map((image) => (
              <Link
                key={image.id}
                {/* Navigate the router to /galley?image=N */}}
                to={`/gallery?image=${image.id}`}
                {/* But display /images/N in the URL bar */}}
                unstable_mask={`/images/${image.id}`}
              >
                <img src={image.url} alt={image.alt} />
              </Link>
            ))}
          </GalleryGrid>

          {/* When the modal data exists, display the modal */}
          {data.modalImage ? (
            <dialog open>
              <img src={data.modalImage.url} alt={data.modalImage.alt} />
            </dialog>
          ) : null}
        </>
      );
    }
    ```

**Full Changelog**: [`v7.13.0...v7.13.1`](https://github.com/remix-run/react-router/compare/react-router@7.13.0...react-router@7.13.1)
## v7.13.0

Date: 2026-01-23

### Minor Changes

- `react-router` - Add `crossOrigin` prop to `Links` component ([#14687](https://github.com/remix-run/react-router/pull/14687))

### Patch Changes

- `react-router` - Fix double slash normalization for `useNavigate` paths with a colon ([#14718](https://github.com/remix-run/react-router/pull/14718))
- `react-router` - Fix missing `nonce` on inline `criticalCss` ([#14691](https://github.com/remix-run/react-router/pull/14691))
- `react-router` - Update failed origin checks to return a 400 status instead of a 500 ([#14737](https://github.com/remix-run/react-router/pull/14737))
- `react-router` - Loosen `allowedActionOrigins` glob check so `**` matches all domains ([#14722](https://github.com/remix-run/react-router/pull/14722))
- `@react-router/dev` - Bump `@remix-run/node-fetch-server` dep ([#14704](https://github.com/remix-run/react-router/pull/14704))
- `@react-router/fs-routes` - Fix route file paths when routes directory is outside of the app directory ([#13937](https://github.com/remix-run/react-router/pull/13937))

**Full Changelog**: [`v7.12.0...v7.13.0`](https://github.com/remix-run/react-router/compare/react-router@7.12.0...react-router@7.13.0)
## v7.12.0

Date: 2026-01-07

### Security Notice

This release addresses 3 security vulnerabilities:

- [CSRF in React Router Action/Server Action Request Processing](https://github.com/remix-run/react-router/security/advisories/GHSA-h5cw-625j-3rxh)
- [XSS via Open Redirects](https://github.com/remix-run/react-router/security/advisories/GHSA-2w69-qvjg-hvjx)
- [React Router SSR XSS in ScrollRestoration](https://github.com/remix-run/react-router/security/advisories/GHSA-8v8x-cx79-35w7)

### Minor Changes

- `react-router` - Add additional layer of CSRF protection by rejecting submissions to UI routes from external origins ([#14708](https://github.com/remix-run/react-router/pull/14708))
  - If you need to permit access to specific external origins, there is a new `allowedActionOrigins` config field in `react-router.config.ts` where you can specify external origins

### Patch Changes

- `react-router` - Fix `generatePath` when used with suffixed params (i.e., `/books/:id.json`) ([#14269](https://github.com/remix-run/react-router/pull/14269))
- `react-router` - Escape HTML in scroll restoration keys ([#14705](https://github.com/remix-run/react-router/pull/14705))
- `react-router` - Validate redirect locations ([#14706](https://github.com/remix-run/react-router/pull/14706))
- `@react-router/dev` - Fix `Maximum call stack size exceeded` errors when HMR is triggered against code with cyclic imports ([#14522](https://github.com/remix-run/react-router/pull/14522))
- `@react-router/dev` - Skip SSR middleware in `vite preview` server for SPA mode ([#14673](https://github.com/remix-run/react-router/pull/14673))

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `react-router` - Preserve `clientLoader.hydrate=true` when using `<HydratedRouter unstable_instrumentations>` ([#14674](https://github.com/remix-run/react-router/pull/14674))
- `react-router` - Pass `<Scripts nonce>` value through to the underlying `importmap` `script` tag when using `future.unstable_subResourceIntegrity` ([#14675](https://github.com/remix-run/react-router/pull/14675))
- `react-router` - Export `UNSAFE_createMemoryHistory` and `UNSAFE_createHashHistory` alongside `UNSAFE_createBrowserHistory` for consistency ([#14663](https://github.com/remix-run/react-router/pull/14663))
  - These are not intended to be used for new apps but intended to help apps using `unstable_HistoryRouter` migrate from v6->v7 so they can adopt the newer APIs
- `@react-router/dev` - Add a new `future.unstable_trailingSlashAwareDataRequests` flag to provide consistent behavior of `request.pathname` inside `middleware`, `loader`, and `action` functions on document and data requests when a trailing slash is present in the browser URL. ([#14644](https://github.com/remix-run/react-router/pull/14644))
  - Currently, your HTTP and `request` pathnames would be as follows for `/a/b/c` and `/a/b/c/`

    | URL `/a/b/c` | **HTTP pathname** | **`request` pathname`** |
    | ------------ | ----------------- | ----------------------- |
    | **Document** | `/a/b/c`          | `/a/b/c` ✅             |
    | **Data**     | `/a/b/c.data`     | `/a/b/c` ✅             |

    | URL `/a/b/c/` | **HTTP pathname** | **`request` pathname`** |
    | ------------- | ----------------- | ----------------------- |
    | **Document**  | `/a/b/c/`         | `/a/b/c/` ✅            |
    | **Data**      | `/a/b/c.data`     | `/a/b/c` ⚠️             |

  - With this flag enabled, these pathnames will be made consistent though a new `_.data` format for client-side `.data` requests:

    | URL `/a/b/c` | **HTTP pathname** | **`request` pathname`** |
    | ------------ | ----------------- | ----------------------- |
    | **Document** | `/a/b/c`          | `/a/b/c` ✅             |
    | **Data**     | `/a/b/c.data`     | `/a/b/c` ✅             |

    | URL `/a/b/c/` | **HTTP pathname**  | **`request` pathname`** |
    | ------------- | ------------------ | ----------------------- |
    | **Document**  | `/a/b/c/`          | `/a/b/c/` ✅            |
    | **Data**      | `/a/b/c/_.data` ⬅️ | `/a/b/c/` ✅            |

  - This a bug fix but we are putting it behind an opt-in flag because it has the potential to be a "breaking bug fix" if you are relying on the URL format for any other application or caching logic
  - Enabling this flag also changes the format of client side `.data` requests from `/_root.data` to `/_.data` when navigating to `/` to align with the new format - This does not impact the `request` pathname which is still `/` in all cases

**Full Changelog**: [`v7.11.0...v7.12.0`](https://github.com/remix-run/react-router/compare/react-router@7.11.0...react-router@7.12.0)
## v7.11.0

Date: 2025-12-17

### What's Changed

We've added `vite preview` support and stabilized the client-side `onError` API - please make the appropriate changes if you've adopted the `unstable_onError` API already in a prior release.

#### `vite preview` Support

We've added support for [`vite preview`](https://vite.dev/guide/cli#vite-preview) when using Framework mode to make it easy to preview your production build.

#### Stabilized Client-side `onError`

The existing `<RouterProvider unstable_onError>`/`<HydratedRouter unstable_onError>` APIs have been stabilized as `<RouterProvider onError>`/`<HydratedRouter onError>`. Please see the [Error Reporting](https://reactrouter.com/7.11.0/how-to/error-reporting#client-errors) docs for more information.

#### Call-site Revalidation Opt-out (unstable)

We've added initial unstable support for call-site revalidation opt-out via a new `unstable_defaultShouldRevalidate` flag ([RFC](https://github.com/remix-run/react-router/discussions/10006)). This flag is available on all navigation/fetcher submission APIs to alter standard revalidation behavior. If any routes include a `shouldRevalidate` function, then the flag value will be passed to that function so the route has the final say on revalidation behavior.

```tsx
<Form method="post" unstable_defaultShouldRevalidate={false} />
submit(data, { method: "post", unstable_defaultShouldRevalidate: false })
<fetcher.Form method="post" unstable_defaultShouldRevalidate={false} />
fetcher.submit(data, { method: "post", unstable_defaultShouldRevalidate: false })
```

This flag is also available on non-submission navigational use cases - for example, you may want to opt-out of revalidation when adding a search param that doesn't impact the UI:

```tsx
<Link to="?analytics-param=1" unstable_defaultShouldRevalidate={false} />;
navigate("?analytics-param=1", { unstable_defaultShouldRevalidate: false });
setSearchParams(params, { unstable_defaultShouldRevalidate: false });
```

### Minor Changes

- `react-router` - Stabilize `<HydratedRouter onError>`/`<RouterProvider onError>` ([#14546](https://github.com/remix-run/react-router/pull/14546))
- `@react-router/dev` - Add `vite preview` support ([#14507](https://github.com/remix-run/react-router/pull/14507))

### Patch Changes

- `react-router` - Fix `unstable_useTransitions` prop on `<Router>` component to permit omission for backwards compatibility ([#14646](https://github.com/remix-run/react-router/pull/14646))
- `react-router` - Allow redirects to be returned from client side middleware ([#14598](https://github.com/remix-run/react-router/pull/14598))
- `react-router` - Handle `dataStrategy` implementations that return insufficient result sets by adding errors for routes without any available result ([#14627](https://github.com/remix-run/react-router/pull/14627))
- `@react-router/serve` - Update `compression` and `morgan` dependencies to address `on-headers` CVE: [GHSA-76c9-3jph-rj3q](https://github.com/advisories/GHSA-76c9-3jph-rj3q) ([#14652](https://github.com/remix-run/react-router/pull/14652))

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `react-router` - RSC: Support for throwing `data()` and Response from server component render phase ([#14632](https://github.com/remix-run/react-router/pull/14632))
  - Response body is not serialized as async work is not allowed as error encoding phase.
  - If you wish to transmit data to the boundary, throw `data()` instead
- `react-router` - RSC: Support for throwing `redirect` Response's at render time ([#14596](https://github.com/remix-run/react-router/pull/14596))
- `react-router` - RSC: `routeRSCServerRequest` replace `fetchServer` with `serverResponse` ([#14597](https://github.com/remix-run/react-router/pull/14597))
- `@react-router/dev` - RSC (Framework mode): Manual chunking for `react` and `react-router` deps ([#14655](https://github.com/remix-run/react-router/pull/14655))
- `@react-router/dev` - RSC (Framework mode): Optimize `react-server-dom-webpack` if in project `package.json` ([#14656](https://github.com/remix-run/react-router/pull/14656))
- `@react-router/{dev,serve}` - RSC (Framework mode): Support custom entrypoints ([#14643](https://github.com/remix-run/react-router/pull/14643))
- `react-router` - Add a new `unstable_defaultShouldRevalidate` flag to various APIs to allow opt-ing out of standard revalidation behaviors ([#14542](https://github.com/remix-run/react-router/pull/14542))

**Full Changelog**: [`v7.10.1...v7.11.0`](https://github.com/remix-run/react-router/compare/react-router@7.10.1...react-router@7.11.0)
## v7.10.1

Date: 2025-12-04

### Patch Changes

- `react-router` - Update the `useOptimistic` stub we provide for React 18 users to use a stable setter function to avoid potential `useEffect` loops - specifically when using `<Link viewTransition>` ([#14628](https://github.com/remix-run/react-router/pull/14628))
- `@react-router/dev` - Import ESM package `pkg-types` with a dynamic `import()` to fix issues on Node 20.18 ([#14624](https://github.com/remix-run/react-router/pull/14624))
- `@react-router/dev` - Update `valibot` dependency to `^1.2.0` to address [GHSA-vqpr-j7v3-hqw9](https://github.com/advisories/GHSA-vqpr-j7v3-hqw9) ([#14608](https://github.com/remix-run/react-router/pull/14608))

**Full Changelog**: [`v7.10.0...v7.10.1`](https://github.com/remix-run/react-router/compare/react-router@7.10.0...react-router@7.10.1)
## v7.10.0

Date: 2025-12-02

### What's Changed

We've stabilized a handful of existing APIs and future flags in this release, please make the appropriate changes if you'd adopted any of these APIs in their unstable state!

#### Stabilized `future.v8_splitRouteModules`

The existing `future.unstable_splitRouteModules` flag has been stabilized as `future.v8_splitRouteModules` in `react-router.config.ts`. Please see the [docs](https://reactrouter.com/7.10.0/upgrading/future#futurev8_splitroutemodules) for more information on adopting this flag.

#### Stabilized `future.v8_viteEnvironmentApi`

The existing `future.unstable_viteEnvironmentApi` flag has been stabilized as `future.v8_viteEnvironmentApi` in `react-router.config.ts`. Please see the [docs](https://reactrouter.com/7.10.0/upgrading/future#futurev8_viteenvironmentapi) for more information on adopting this flag.

#### Stabilized `fetcher.reset()`

The existing `fetcher.unstable_reset()` API has been stabilized as `fetcher.reset()`.

#### Stabilized `DataStrategyMatch.shouldCallHandler()`

The existing low-level `DataStrategyMatch.unstable_shouldCallHandler()`/`DataStrategyMatch.unstable_shouldRevalidateArgs` APIs have been stabilized as `DataStrategyMatch.shouldCallHandler()`/`DataStrategyMatch.shouldRevalidateArgs`. Please see the [docs](https://reactrouter.com/7.10.0/how-to/data-strategy) for information about using a custom `dataStrategy` and how to migrate away from the deprecated `DataStrategyMatch.shouldLoad` API if you are using that today.

### Minor Changes

- `react-router` - Stabilize `fetcher.reset()` ([#14545](https://github.com/remix-run/react-router/pull/14545))
  - ⚠️ This is a breaking change if you have begun using `fetcher.unstable_reset()` - please update your code to use `fetcher.reset()`
- `react-router` - Stabilize the `dataStrategy` `match.shouldCallHandler()`/`match.shouldRevalidateArgs` APIs ([#14592](https://github.com/remix-run/react-router/pull/14592))
  - The `match.shouldLoad` API is now marked deprecated in favor of these more powerful alternatives
  - ⚠️ This is a breaking change if you have begun using `match.unstable_shouldCallHandler()`/`match.unstable_shouldRevalidateArgs` - please update your code to use `match.shouldCallHandler()`/`match.shouldRevalidateArgs`
- `@react-router/dev` - Stabilize `future.v8_splitRouteModules`, replacing `future.unstable_splitRouteModules` ([#14595](https://github.com/remix-run/react-router/pull/14595))
  - ⚠️ This is a breaking change if you have begun using `future.unstable_splitRouteModules` - please update your `react-router.config.ts`
- `@react-router/dev` - Stabilize `future.v8_viteEnvironmentApi`, replacing `future.unstable_viteEnvironmentApi` ([#14595](https://github.com/remix-run/react-router/pull/14595))
  - ⚠️ This is a breaking change if you have begun using `future.unstable_viteEnvironmentApi` - please update your `react-router.config.ts`

### Patch Changes

- `react-router` - Fix a Framework Mode bug where the `defaultShouldRevalidate` parameter to `shouldRevalidate` would not be correct after `action` returned a 4xx/5xx response (`true` when it should have been `false`) ([#14592](https://github.com/remix-run/react-router/pull/14592))
  - If your `shouldRevalidate` function relied on that parameter, you may have seen unintended revalidations
- `react-router` - Fix `fetcher.submit` failing with plain objects containing a `tagName` property ([#14534](https://github.com/remix-run/react-router/pull/14534))
- `react-router` - Fix the promise returned from `useNavigate` in Framework/Data Mode so that it properly tracks the duration of `popstate` navigations (i.e., `navigate(-1)`) ([#14524](https://github.com/remix-run/react-router/pull/14524))
- `react-router` - Preserve `statusText` on the `ErrorResponse` instance when throwing `data()` from a route handler ([#14555](https://github.com/remix-run/react-router/pull/14555))
- `react-router` - Optimize `href()` to avoid backtracking regex on splat ([#14329](https://github.com/remix-run/react-router/pull/14329))
- `@react-router/dev` - Fix internal type error in `useRoute` types that surfaces when `skipLibCheck` is disabled ([#14577](https://github.com/remix-run/react-router/pull/14577))
- `@react-router/dev` - Load environment variables before evaluating `routes.ts` ([#14446](https://github.com/remix-run/react-router/pull/14446))
  - For example, you can now compute your routes based on [`VITE_`-prefixed environment variables](https://vite.dev/guide/env-and-mode#env-variables)

    ```ts
    // app/routes.ts
    import { type RouteConfig, route } from "@react-router/dev/routes";

    const routes: RouteConfig = [];

    // Only add the route when VITE_ENV_ROUTE is set
    if (import.meta.env.VITE_ENV_ROUTE === "my-route") {
      routes.push(route("my-route", "routes/my-route.tsx"));
    }

    export default routes;
    ```

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `react-router` - Add `unstable_pattern` to the parameters for client side `unstable_onError` ([#14573](https://github.com/remix-run/react-router/pull/14573))
- `react-router` - Refactor how `unstable_onError` is called internally by `RouterProvider` to avoid potential strict mode issues ([#14573](https://github.com/remix-run/react-router/pull/14573))
- `react-router` - Add new `unstable_useTransitions` flag to routers to give users control over the usage of [`React.startTransition`](https://react.dev/reference/react/startTransition) and [`React.useOptimistic`](https://react.dev/reference/react/useOptimistic) ([#14524](https://github.com/remix-run/react-router/pull/14524))
  - Please see the [docs](https://reactrouter.com/7.10.0/explanation/react-transitions) for more information
  - Framework Mode + Data Mode:
    - `<HydratedRouter unstable_transition>`/`<RouterProvider unstable_transition>`
    - When left unset (current default behavior)
      - Router state updates are wrapped in `React.startTransition`
      - ⚠️ This can lead to buggy behaviors if you are wrapping your own navigations/fetchers in `React.startTransition`
      - You should set the flag to `true` if you run into this scenario to get the enhanced `useOptimistic` behavior (requires React 19)
    - When set to `true`
      - Router state updates remain wrapped in `React.startTransition` (as they are without the flag)
      - `Link`/`Form` navigations will be wrapped in `React.startTransition`
        - You can drop down to `useNavigate`/`useSubmit` if you wish to opt out of this outer `React.startTransition` call for the navigation
      - A subset of router state info will be surfaced to the UI _during_ navigations via `React.useOptimistic` (i.e., `useNavigation()`, `useFetchers()`, etc.)
        - ⚠️ This is a React 19 API so you must also be React 19 to opt into this flag for Framework/Data Mode
    - When set to `false`
      - The router will not leverage `React.startTransition` or `React.useOptimistic` on any navigations or state changes
  - Declarative Mode
    - `<BrowserRouter unstable_useTransitions>`
    - When left unset
      - Router state updates are wrapped in `React.startTransition`
    - When set to `true`
      - Router state updates remain wrapped in `React.startTransition` (as they are without the flag)
      - `Link`/`Form` navigations will be wrapped in `React.startTransition`
    - When set to `false`
      - The router will not leverage `React.startTransition` on any navigations or state changes

**Full Changelog**: [`v7.9.6...v7.10.0`](https://github.com/remix-run/react-router/compare/react-router@7.9.6...react-router@7.10.0)
## v7.9.6

Date: 2025-11-13

### Security Notice

This release addresses 1 security vulnerability:

- [Unexpected external redirect via untrusted paths](https://github.com/remix-run/react-router/security/advisories/GHSA-9jcx-v3wj-wh4m)

### Patch Changes

- `react-router` - Properly handle ancestor thrown middleware errors before `next()` on fetcher submissions ([#14517](https://github.com/remix-run/react-router/pull/14517))
- `react-router` - Fix issue with splat routes interfering with multiple calls to `patchRoutesOnNavigation` ([#14487](https://github.com/remix-run/react-router/pull/14487))
- `react-router` - Normalize double-slashes in `resolvePath` ([#14529](https://github.com/remix-run/react-router/pull/14529))
- `@react-router/dev` - Use a dynamic `import()` to load ESM-only `p-map` dependency to avoid issues on Node 20.18 and below ([#14492](https://github.com/remix-run/react-router/pull/14492))
- `@react-router/dev` - Short circuit `HEAD` document requests before calling `renderToPipeableStream` in the default `entry.server.tsx` to more closely align with the [spec](https://httpwg.org/specs/rfc9110.html#HEAD) ([#14488](https://github.com/remix-run/react-router/pull/14488))

### Unstable Changes

⚠️ _[Unstable features](https://reactrouter.com/community/api-development-strategy#unstable-flags) are not recommended for production use_

- `react-router` - Add `location`/`params` as arguments to client-side `unstable_onError` to permit enhanced error reporting ([#14509](https://github.com/remix-run/react-router/pull/14509))
  - ⚠️ This is a breaking change if you've already adopted `unstable_onError`
  - The second parameter has changed to an object including `errorInfo`, `location`, and `params`:

    ```tsx
    // <RouterProvider unstable_onError={errorHandler} />
    // <HydratedRouter unstable_onError={errorHandler} />

    // Before
    function errorHandler(error: unknown, errorInfo?: React.errorInfo) {
      /*...*/
    }

    // After
    function errorHandler(
      error: unknown,
      info: {
        location: Location;
        params: Params;
        errorInfo?: React.ErrorInfo;
      },
    ) {
      /*...*/
    }
    ```

**Full Changelog**: [`v7.9.5...v7.9.6`](https://github.com/remix-run/react-router/compare/react-router@7.9.5...react-router@7.9.6)