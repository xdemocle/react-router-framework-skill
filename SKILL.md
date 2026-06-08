---
name: "react-router"
description: "RR7 framework mode: routing, loaders, actions, streaming, typegen, CF Workers. Gotchas + project mapping for Eveo, bzz.one, CyberGrandpa. Use when Rocco asks about react-router, RR7, @react-router/dev, routes.ts, loaders, actions, fetchers, or hits a routing/SSR/typegen error on any of his RR7 projects."
---

# React Router v7 — Framework Mode Skill

**For:** Claudio71 (Claudio assistant) when working on Rocco's RR7 projects.
**Goal:** Fill the gaps in RR7 framework mode knowledge — streaming, latest patches, and CF Workers specifics. Caches critical docs locally, embeds Rocco's known gotchas.

---

## When to load this skill

Triggered when:
- Message mentions `react-router`, `RR7`, `@react-router/dev`, `routes.ts`, `loader`, `action`, `useFetcher`, `defer`, `Await`, `Outlet`, or `Route.*` types.
- Debugging a route module, loader, action, or hydration issue.
- Working on Eveo, bzz.one, CyberGrandpa, Tracva, or any Rocco project on RR7.
- CF Workers deploy that uses `@react-router/dev` or `react-router` server runtime.

---

## Rocco's RR7 projects (cached patterns, June 2026)

| Project | Path | RR version | Notes |
|---|---|---|---|
| **theweb3-ninja-website** | `~/Documents/theweb3-ninja-website/` | 7.13.1 | Marketing site, layouts, splat routes, CF plugin conflict in dev |
| **code-connect-sa** | `~/Documents/code-connect-sa/` | RR7 (see `package.json`) | `ssr: false`, static prerender, magic-link auth, `appDirectory: "src"` |
| **rocco-s-realm** | `~/Documents/rocco-s-realm/` | 7.15.1 | MDX, dynamic prerender, splat catchall |

**NOT on srv2 (likely on srv3, Rocco's laptop, or already on CF Pages without local checkout):**
- Eveo (canonical: `eveo-marketplace-app`)
- bzz.one
- CyberGrandpa (`cybergrandpa.top`, `.space`)
- Tracva (`tracva.work`)

When those land on this server, add cache files under `references/projects/`. Until then, treat their stack as "RR7 framework + CF Workers" by default and consult `references/deploying.md`.

---

## CRITICAL GOTCHAS — DO NOT RE-DERIVE (loaded knowledge, confirmed failing)

1. **Vite plugin order** — `reactRouter()` MUST come BEFORE `cloudflare()` in `vite.config.ts`. Wrong order → CSS loads as `text/javascript`. Confirmed on Eveo + bzz.one.
2. **CF Workers `v8_viteEnvironmentApi`** — `v8_viteEnvironmentApi: true` required in `react-router.config.ts` for RR7 on CF Workers. Stabilized in 7.10.0.
3. **Tailwind v4 + RR7** — `tailwindcss/nesting` removed in v4. Use `@tailwindcss/vite`. CSS served as JS module — bare side-effect import only (`import '@/styles/app.css'`). NO `?url` + `<link>`. FOUC in dev is expected.
4. **CSS file location** — must be inside `src/app/`. Don't reference from project root.
5. **SPA vs Framework mode** — for CF Workers/SSR, use `@react-router/dev` framework mode ONLY. Never `createBrowserRouter` (data mode/declarative mode).
6. **Type errors involving `Route.*`** — usually means typegen hasn't run or `.react-router/` isn't in `tsconfig`. Run `react-router typegen` first.
7. **`react-router typegen` before `tsc`** — see `references/type-safety.md`.

---

## Cached documentation (support files)

Read these when the question matches:

| File | Covers | Read when... |
|---|---|---|
| `references/installation.md` | Framework install, templates, dev server | New project setup |
| `references/routing.md` | `routes.ts`, file conventions, layouts, dynamic/index/prefix | Designing routes |
| `references/route-module.md` | Component, loader, clientLoader, action, clientAction, middleware | Building a route module |
| `references/data-loading.md` | Server vs client vs static loaders, HydrateFallback | Data fetching decisions |
| `references/actions.md` | Server/client actions, `<Form>`, `useSubmit`, `useFetcher` | Mutations |
| `references/type-safety.md` | `.react-router/types/`, `Route.*` types, typegen setup | TypeScript errors involving `Route.` |
| `references/deploying.md` | Templates per platform, CF Workers external link | Deployment decisions |
| `references/changelog.md` | v7.0.0 → v7.17.0 highlights | "Is this feature available?" / "What changed in 7.x?" |
| `references/projects/theweb3-ninja-website.md` | Routes, config, pitfall (CF plugin dev conflict) | Working on theweb3-ninja-website |
| `references/projects/code-connect-sa.md` | Routes, `ssr:false` + prerender + magic-link auth | Working on code-connect-sa |
| `references/projects/rocco-s-realm.md` | Routes, MDX, dynamic prerender, splat catchall | Working on rocco-s-realm |

---

## Decision tree — common problems

### "I want to stream data from a loader"

Use `defer` (Promises returned from a loader are awaited; for streaming, return Promises without awaiting):

```ts
export async function loader() {
  return {
    critical: await getCritical(),
    slow: getSlow(), // returns a Promise, not awaited → streamed
  };
}
```

Then in component:

```tsx
import { Await, useLoaderData } from "react-router";
import { Suspense } from "react";

function Page() {
  const { critical, slow } = useLoaderData<typeof loader>();
  return (
    <>
      <Critical data={critical} />
      <Suspense fallback={<Spinner />}>
        <Await resolve={slow}>
          {(data) => <Slow data={data} />}
        </Await>
      </Suspense>
    </>
  );
}
```

**Micro-opts:**
- `defer` is preferred over `await` for any non-critical data.
- Use `clientLoader.hydrate = true as const` only if you need to refetch on hydration.
- `<Suspense>` boundaries should match UI structure, not be at the root.
- For static content, use prerendering in `react-router.config.ts` (works in framework mode).
- Nested `<Await>` works but keep depth shallow (≤3).

### "Type error involving `Route.*`"

1. Run `react-router typegen` to regenerate `.react-router/types/`.
2. Confirm `.gitignore` includes `.react-router/`.
3. Confirm `tsconfig.json` has `.react-router/types/**/*` in `include` and `rootDirs` is `[".", "./.react-router/types"]`.
4. If you just edited `routes.ts`, types may be stale — restart `react-router dev`.
5. Full setup in `references/type-safety.md`.

### "I want to deploy to Cloudflare Workers"

Use the Cloudflare template (recommended for greenfield):
```sh
npx create-react-router@latest --template remix-run/react-router-templates/cloudflare
```

Or adapt existing: `react-router.config.ts` needs `v8_viteEnvironmentApi: true`. `vite.config.ts` needs `reactRouter()` BEFORE `@cloudflare/vite-plugin`. See `references/deploying.md` for the platform matrix.

### "My CSS isn't loading / shows as text/javascript"

Vite plugin order is wrong. In `vite.config.ts`:
```ts
plugins: [
  reactRouter(), // FIRST
  cloudflare(),  // SECOND
  tsconfigPaths(),
],
```

### "Form submission isn't working"

- `<Form>` (capital F) is the RR component, not raw `<form>`.
- `action` defaults to current route; pass `action="/path"` to target another.
- For non-navigating submissions, use `<fetcher.Form>` or `useFetcher()`.

### "Action data not refreshing the UI"

After a successful action, all loader data on the page is **automatically revalidated**. No manual refetch. If it's not happening, check that you're using `<Form>` or `useFetcher` (not `fetch()` directly), and that the action returns data (not just a Response).

### "Route is 404'ing"

- Pattern in `routes.ts` must match exactly (case-sensitive).
- Dynamic segments use `:` prefix (`route("users/:id", ...)`).
- `index()` doesn't take a pattern — renders into parent's outlet.
- If using `@react-router/fs-routes`, confirm `flatRoutes()` is spread into config.

---

## Streaming with Suspense — the gap I had

Pattern in RR7 framework mode:
- `defer()` (or just returning un-awaited Promises) from a loader returns mixed data.
- `<Await>` resolves a Promise in the render tree.
- Wrap in `<Suspense>` to show fallback during resolution.
- Data is auto-serialized to the client on hydration.

This was named `defer()` in Remix v1 (unchanged in RR7). Works identically in framework mode today.

**Edge cases:**
- Errors in a streamed Promise → catch with `<Await errorElement={<Error />}>`.
- Nested streams work but keep shallow.
- Don't stream things that block the initial HTML render (above-the-fold critical content).

---

## Stable vs. unstable (as of v7.17.0, June 2026)

### Stable (no flag)
- Middleware (stable in 7.9.0) — `middleware` + `clientMiddleware` route exports.
- `v8_viteEnvironmentApi` (7.10.0) — required for CF Workers now.
- `fetcher.reset()` (7.10.0).
- `DataStrategyMatch.shouldCallHandler()` (7.10.0).
- `v8_splitRouteModules` (7.10.0).
- `v8_trailingSlashAwareDataRequests` (7.16.0).
- `clientLoader.hydrate = true as const` (always stable).
- Type-safe `href` utility (7.2.0).
- `route.lazy` Object API (7.5.0).
- `routeDiscovery` config (7.6.0).
- Vite preview support (7.11.0).
- Client-side `onError` (7.11.0).
- `vite preview` (7.11.0).
- Pre-rendering with SPA fallback (7.2.0).
- Root `loader` in SPA mode (7.2.0).

### Unstable (need `unstable_` prefix or 🧪 marker)
- RSC APIs (7.7.0+) — `RSCStaticRouter`, `routeRSCServerRequest`, etc.
- `useRoute()`, `useRouterState()` — hooks still experimental.
- Pass-through requests (7.13.2).
- URL Masking (7.13.1).
- Call-site revalidation opt-out (7.11.0).
- `unstable_flushSync` (v6.19.0).
- `useResolvedPath` (newer).

### Just removed
- `v7_relativeSplatPath` (became default in v6.21.0).
- `v7_skipActionErrorRevalidation` (stable in 6.25.0).

For latest: see `references/changelog.md`.

---

## Self-update protocol

This skill has a daily cron that re-fetches the CHANGELOG and the streaming + type-safety docs. If the user is debugging a RR7 issue and the skill content seems stale, `web_fetch` the live page from `reactrouter.com`.

Daily cron (rr7-changelog-watch):
- Schedule: 02:00 Europe/Rome (quiet slot, no medicine overlap).
- Source: `web_fetch` against `https://raw.githubusercontent.com/remix-run/react-router/main/CHANGELOG.md`.
- Action: re-write `references/changelog.md`; surface any new stable features in this SKILL.md's "Stable vs. unstable" table.

---

## Last verified

2026-06-08. Source: reactrouter.com (v7.17.0) + GitHub CHANGELOG. Re-verify on every RR minor bump.

---

## Credits

Originally created by **Claudio71** (Rocco Russo's OpenClaw assistant) as part of a knowledge-skill library. Caches public React Router v7 documentation for use by AI agents working on RR7 framework mode projects.
