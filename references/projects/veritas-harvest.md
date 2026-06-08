# veritas-harvest (Tracva website)

**Path:** GitHub `xdemocle/veritas-harvest` (Lovable-managed; not on either server). Local clone: `/tmp/rr7-scan/veritas-harvest`.
**Lovable rule:** Read-only for me — never push agent docs to this repo. (Per `MEMORY.md`.)
**RR version:** `^7.13.1`
**Vite plugins (order):** `reactRouter()` → `tsconfigPaths()` → `cloudflare({ viteEnvironment: { name: 'ssr' } })` (dev only) → `tailwindcss()`
**Deploy target:** Cloudflare Workers (with TanStack Query + custom middleware)

## Routes (`src/app/routes.ts`)

Uses `routes.ts` config (not file-system), with `id` for paired IT/EN routes. Heavy on SEO country landing pages.

```ts
export default [
  index('routes/index.tsx'),
  // Farms — IT and EN slugs (same file, different ids)
  route('aziende', 'routes/farms.tsx', { id: 'farms-it' }),
  route('farms', 'routes/farms.tsx', { id: 'farms-en' }),
  // Retailer + dynamic supplier
  route('retailer', 'routes/retailer.tsx'),
  route('retailer/:id', 'routes/supplier-profile.tsx'),
  // Attestations, Pricing, Auth — same pattern of IT/EN pairs
  route('certificazioni', 'routes/attestations.tsx', { id: 'attestations-it' }),
  route('attestations', 'routes/attestations.tsx', { id: 'attestations-en' }),
  // ... pricing, login, register
  // Auth API handler
  route('api/auth/*', 'routes/api.auth.$.tsx'),
  // Country landing pages (full names to avoid clashing with /it /de language prefixes)
  route('italy', 'routes/country.italy.tsx'),
  route('spain', 'routes/country.spain.tsx'),
  // ... 9 countries
  // Catch-all
  route('*', 'routes/$.tsx'),
] satisfies RouteConfig;
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
} satisfies Config;
```

## `root.tsx` — middleware + providers

```tsx
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { serverMiddleware, authMiddleware } from './lib/middlewares.server';
import appCss from './styles/app.css?url';

export const middleware: MiddlewareFunction[] = [serverMiddleware, authMiddleware];

const queryClient = new QueryClient();
```

## Notable patterns

- **IT/EN route pairs with custom `id`** — same module file, two URL slugs, distinct IDs for prerender targeting. Pattern: `{ id: 'page-it' }` / `{ id: 'page-en' }`.
- **Country landing pages use full names** — `italy`, `spain`, `germany` (not `it`, `de`, `es`). Avoids collision with future language-prefix routes.
- **Custom middleware in `root.tsx`** — `serverMiddleware` (logging? rate limiting?) + `authMiddleware` (session check). The stable `middleware` export in RR7.
- **TanStack Query at root** — global `QueryClient`, used across all routes. Best practice for server-state caching.
- **Multiple contexts** — `LanguageProvider`, `ThemeProvider`, `TooltipProvider`, `Toaster`. Provider stack at root.
- **`?url` CSS import** — `import appCss from './styles/app.css?url'` then `<link rel="stylesheet" href={appCss} />` in `root.tsx`. This is the SSR-friendly pattern (vs the Vite dev CSS-as-JS-module approach).
- **Custom `entry.client.tsx` and `entry.server.tsx`** — both exist. Use these to customize streaming, hydration, or add polyfills.
- **Path alias `@/`** for `src/`. Vite `tsconfigPaths()` resolves it.

## Pitfalls hit here

- **Two routes pointing at the same file** — without `{ id: '...' }`, RR7 throws on duplicate file references. Custom IDs are mandatory.
- **Country code route names** — `route('it', ...)` is dangerous if you ever add i18n later (collides with `/it/...` prefix). Use full names.
- **Middleware order matters** — `serverMiddleware` should run BEFORE `authMiddleware` so logs capture all requests, including 401s.
- **CSS in root.tsx with `?url`** — must be a literal `import` (not dynamic). Required for RR7's bundler to extract the asset.
- **Lovable-managed** — if I'm tempted to push fixes here, NO. Use the Lovable UI or PR through normal review.
