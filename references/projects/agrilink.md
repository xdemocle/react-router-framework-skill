# agrilink

**Path:** `~/Documents/agrilink/` (on srv3)
**RR version:** `^7.17.0`
**Vite plugins (order):** `mdx()` → `reactRouter()` → `i18nNamespacePlugin()` → `svgr()` → `cloudflare()` (dev only) → `tailwindcss()` → `ViteImageOptimizer()` (non-SSR only)
**Deploy target:** Cloudflare Workers (with a custom Rolldown patch)

## Routes (`src/app/routes.ts`)

Two-tier: `routesBase` (canonical English routes) + `routesAlias` (localized paths for 11 languages via `prefix()`). API routes use a custom `RR_API_PREFIX` and come BEFORE language-prefixed routes to avoid conflicts.

```ts
const routesBase = [
  index('routes/_index/route.tsx'),
  route('about', 'routes/about/route.tsx'),
  route('posts/:slug', 'routes/post/route.tsx'),
  route('u/dashboard', 'routes/u.dashboard/route.tsx'),
  // ... user, farm, sensor, billing routes
];

const routesAlias = helperCreateRoutes(routesBase); // localized slugs per language

export default [
  // API first (before language prefixes)
  route(`${RR_API_PREFIX.substring(1)}/debug`, 'routes/api.debug.ts'),
  route(`${RR_API_PREFIX.substring(1)}/auth/*`, 'routes/api.auth.$.ts'),
  route(`${RR_API_PREFIX.substring(1)}/fields`, 'routes/api.fields/route.ts'),
  // ... then localized routes
];
```

## `react-router.config.ts`

```ts
export default {
  appDirectory: './src/app',
  buildDirectory: 'dist',
  ssr: true,
  future: {
    v8_middleware: true,
    unstable_optimizeDeps: true,
    v8_splitRouteModules: true,
    v8_viteEnvironmentApi: true,
  },
  buildEnd: () => {
    if (IS_SSR) {
      updateVersionJson('end');
      cleanPublicPostbuild();
      patchCreateRequireForCloudflare(); // ← custom workaround
    }
  },
} satisfies Config;
```

## Notable patterns

- **Custom `patchCreateRequireForCloudflare()`** post-build fix: Rolldown generates `createRequire(import.meta.url)` for CJS interop. In `workerd`, `import.meta.url` is `undefined` for dynamically-imported modules → `ERR_INVALID_ARG_VALUE`. The patch replaces the call with a fallback `file:///worker/index.js`. **Reuse this pattern for any project that uses CJS deps in workerd.**
- **`appDirectory: './src/app'`** — custom path. Type imports become `import { Route } from '../../+types/route'` (deeper nesting).
- **All v8 future flags enabled** — `v8_middleware`, `v8_splitRouteModules`, `v8_viteEnvironmentApi`, plus `unstable_optimizeDeps`.
- **i18n via custom `helperCreateRoutes(routesBase)`** — wraps every route, replaces paths with localized slugs from `LANGUAGE_RESOURCES`, sets `id: \`${lng}-${pathId}\`` for unambiguous prerender. Languages: 11.
- **API routes come BEFORE language prefixes** — so `/api/fields` doesn't get eaten by `/it/api/fields`. Common pitfall when mixing i18n + APIs.
- **Splat API route**: `${RR_API_PREFIX}/auth/*` → `routes/api.auth.$.ts` for dynamic auth paths.
- **Vite plugin order with custom plugins** — `mdx()` first (so MDX files are processed before RR scans routes), then `reactRouter()` (the main framework plugin), then app-specific custom plugins (`i18nNamespacePlugin`, `svgr`), then `cloudflare()` in dev only, then `tailwindcss()`.

## Pitfalls hit here

- **`workerd` + CJS interop** — any dep that uses `createRequire(import.meta.url)` will crash. The `patchCreateRequireForCloudflare()` post-build step is a workaround. Real fix is upstream (Rolldown or workerd), but until then, copy this pattern.
- **i18n route IDs MUST be unique** — without the `\`${lng}-${pathId}\`` pattern, the same file referenced at 11 paths causes `routes.ts` validation errors.
- **API routes under i18n prefixes** — put API routes first in the array, or they get shadowed.
