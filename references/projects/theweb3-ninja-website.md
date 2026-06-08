# theweb3-ninja-website

**Path:** `~/Documents/theweb3-ninja-website/`
**RR version:** `^7.13.1`
**Vite plugins (order):** `tsconfigPaths()` → `reactRouter()` → (Cloudflare plugin DISABLED — see note)
**Deploy target:** Cloudflare Pages (intent), currently static-served

## Routes (`app/routes.ts`)

Uses `layout()` to group under a shared shell. Heavy use of `index(file, { id: '...' })` with custom IDs (useful for prerender targeting).

```ts
import { type RouteConfig, index, layout, route } from '@react-router/dev/routes';

export default [
  layout('routes/_layout.tsx', [
    index('routes/_index.tsx'),
    route('team', 'routes/team.tsx'),
    route('case-studies', 'routes/case-studies/_index.tsx', { id: 'case-studies-index' }),
    route('case-studies/:slug', 'routes/case-studies/$slug.tsx'),
    route('blog', 'routes/blog/_index.tsx', { id: 'blog-index' }),
    route('blog/*', 'routes/blog/$.tsx', { id: 'blog-catchall' }),
    // ... more dynamic-segment routes
  ]),
  layout('routes/resources/_layout.tsx', [
    route('resources/cto-blockchain-integration-guide', '...'),
  ]),
] satisfies RouteConfig;
```

## `react-router.config.ts`

Dynamic prerender that reads `case-studies`, `industries`, `services`, `use-cases` data files and `blog-posts.json`. Each category slug + each blog post gets prerendered. Skip prerender gracefully if `blog-posts.json` missing (warns and continues).

```ts
const POSTS_PER_PAGE = 9;
const staticPaths = ['/', '/team', '/how-we-work', ...];
const dynamicPaths = caseStudies.map(c => `/case-studies/${c.slug}`);
// ... bundled in prerender array
```

## Notable patterns

- **Custom route IDs** (`{ id: 'case-studies-index' }`) — used to disambiguate when the same path exists in multiple places. Useful for prerender targeting.
- **Splat for blog** — `route('blog/*', 'routes/blog/$.tsx')` catches all blog sub-paths in one file.
- **Dual layout nesting** — outer `_layout.tsx` for site shell, inner `routes/resources/_layout.tsx` for resources section.
- **Cloudflare plugin DISABLED in dev** — comment says: "Temporarily disabled - causing 404 issues in dev". Workaround: deploy to CF with the plugin enabled, dev runs without it. **Gotcha to remember.**

## Pitfalls hit here

- Cloudflare plugin + dev server conflict on this project. Don't enable `@cloudflare/vite-plugin` in `vite.config.ts` while running `react-router dev` locally — it intercepts `/api/*` and 404s.
