# code-connect-sa

**Path:** `~/Documents/code-connect-sa/`
**RR version:** Uses `dev/build/serve` scripts (RR7 framework mode; check `package.json` for exact)
**Vite plugins (order):** `tailwindcss()` → `reactRouter()` → `tsconfigPaths()`
**Deploy target:** Static prerender only (`ssr: false`)

## Routes (`src/routes.ts`)

Flat route list (no `layout()`). SA platform with admin/student/public paths.

```ts
import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/Index.tsx"),
  route("admin/dashboard", "routes/AdminDashboard.tsx"),
  route("admin/login", "routes/AdminLogin.tsx"),
  route("auth/callback", "routes/AuthCallback.tsx"),
  route("contact-us", "routes/ContactUs.tsx"),
  route("pre-register", "routes/PreRegister.tsx"),
  route("student", "routes/StudentDashboard.tsx"),
  route("student/login", "routes/UserLogin.tsx"),
  route("student/magic-link", "routes/MagicLinkRequest.tsx"),
  // ... more
] satisfies RouteConfig;
```

## `react-router.config.ts`

```ts
export default {
  ssr: false,
  appDirectory: "src",
  buildDirectory: "dist",
  prerender: [
    "/", "/terms-conditions", "/privacy-policy", "/popia-compliance",
    "/contact-us", "/student", "/admin/dashboard",
    "/student/login", "/admin/login", "/pre-register", "/program",
    // ... longer list
  ],
} satisfies Config;
```

## Notable patterns

- **`appDirectory: "src"`** — RR default is `app/`. This project puts routes under `src/`, common when migrating from Vite SPA or shared component dirs.
- **`ssr: false`** — pure SPA with prerender. Loads auth-gated pages as static HTML; auth state handled client-side.
- **Prerender includes auth routes** — `/admin/dashboard`, `/student/login` are prerendered as static. Client-side auth wrapper decides what to show. **Gotcha:** if you prerender an auth-gated page, the static HTML leaks the shell. Make sure `HydrateFallback` + clientLoader auth check happen before any sensitive data renders.
- **Path-typed `action` attribute** — `<Form action="/admin/dashboard" method="post">` is used widely. No nested route paths; all top-level.
- **Magic link auth flow** — `/student/magic-link` (request) → email → `/auth/callback` (token verify) → `/student/magic-link-success` (landing). Three-route auth flow with no `useSession()`.

## Pitfalls hit here

- **Static prerender + auth** = careful about what ships in HTML. Even skeletons can leak structure. Use `<HydrateFallback>` for ALL auth-gated UI until the client confirms session.
- **`appDirectory: "src"`** breaks the default `import { Route } from "./+types/route-name"` path. Type import becomes `import { Route } from "../+types/route-name"` (one level up).
