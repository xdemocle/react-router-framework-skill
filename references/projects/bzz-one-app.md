# bzz-one-app

**Path:** GitHub `xdemocle/bzz-one-app` (not on either server; cloned to `/tmp/rr7-scan/bzz-one-app` for caching)
**RR version:** `^7.13.0`
**Vite plugins (order):** `tsconfigPaths()` → `eslint()` → `tailwindcss()` → `reactRouter()` (skipped when `VITEST=1`) → `cloudflare({ viteEnvironment: { name: 'ssr' } })`
**Deploy target:** Cloudflare Workers (intent), with `@cloudflare/vitest-pool-workers` for tests

## Routes — file-system routing only

No `app/routes.ts` config; uses `@react-router/fs-routes` with `flatRoutes()`:

```ts
// app/routes.ts
import { type RouteConfig } from '@react-router/dev/routes';
import { flatRoutes } from '@react-router/fs-routes';

const routes: RouteConfig = flatRoutes();
export default routes;
```

Files follow the flat-routes naming convention with i18n prefix:
- `app/routes/($lng)._index.tsx`
- `app/routes/($lng).features.tsx`
- `app/routes/($lng).contact.tsx`

`($lng)` is an **optional** segment in flat-routes syntax. If absent, route is the same; if present, becomes `/<lng>/...`.

## `react-router.config.ts`

```ts
export default {
  ssr: true,
  future: {
    v8_viteEnvironmentApi: true,
  },
} satisfies Config;
```

Minimal — relies on file-system routing for the route tree.

## `vite.config.ts`

```ts
plugins: [
  tsconfigPaths(),
  eslint(),
  tailwindcss(),
  !process.env.VITEST && reactRouter(),
  cloudflare({ viteEnvironment: { name: 'ssr' } }),
].filter(Boolean)
```

Note: `reactRouter()` is conditionally added — skipped under vitest to avoid the framework plugin interfering with unit tests. `cloudflare()` is ALWAYS present (including in prod), with `viteEnvironment: { name: 'ssr' }` so it hooks into the SSR environment only.

## Sample route file

```tsx
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link, type MetaFunction } from 'react-router';
// ...

export const meta: MetaFunction = () => {
  const { t } = useTranslation('home');
  return [
    { title: t('meta.title') },
    { name: 'description', content: t('meta.description') },
  ];
};

export default function Index() { /* ... */ }
```

- `useTranslation('home')` from `react-i18next` — translations are NOT routed; one shared dictionary per page namespace.
- `framer-motion` for animations.
- Path alias `~/` to `app/`.

## Notable patterns

- **Pure file-system routing** — no `routes.ts` config. Cleaner for small projects, harder for complex i18n (compared to agrilink's `routes.ts` + helper).
- **`($lng)` optional segment** — flat-routes syntax for i18n without subfolders. Each `($lng).<page>.tsx` is one file that handles all language variants.
- **`reactRouter()` conditionally excluded in tests** — `!process.env.VITEST && reactRouter()`. Avoids the framework plugin when running pure unit tests.
- **`cloudflare({ viteEnvironment: { name: 'ssr' } })` always on** — even in dev. This is the CORRECT pattern (vs the theweb3-ninja-website case where CF plugin was disabled in dev).
- **Tailwind v4** — uses BOTH `@tailwindcss/vite` AND `@tailwindcss/postcss` in `package.json`. PostCSS for legacy compat, Vite plugin for primary processing.
- **Tests in `workerd`** — `@cloudflare/vitest-pool-workers` runs vitest in the actual Workers runtime. Catches CF-specific bugs that Node tests miss.

## Pitfalls hit here

- **`reactRouter()` skipped in VITEST** means unit tests can't use `<Link>` or `useLoaderData` without a test wrapper. Use `createRoutesStub` or E2E for component tests.
- **File-system routing with i18n** gets confusing fast — `($lng).` is the only way to do it without `routes.ts`. For 5+ languages with localized URLs, switch to `routes.ts` + helper (agrilink pattern).
