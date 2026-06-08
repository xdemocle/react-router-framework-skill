# React Router — Routing (Framework Mode)

Source: https://reactrouter.com/start/framework/routing
Fetched: 2026-06-08 (v7.17.0)

## Routes are configured in `app/routes.ts`

```ts
import { type RouteConfig, route, index, layout, prefix } from "@react-router/dev/routes";

export default [
  index("./home.tsx"),
  route("about", "./about.tsx"),

  layout("./auth/layout.tsx", [
    route("login", "./auth/login.tsx"),
    route("register", "./auth/register.tsx"),
  ]),

  ...prefix("concerts", [
    index("./concerts/home.tsx"),
    route(":city", "./concerts/city.tsx"),
    route("trending", "./concerts/trending.tsx"),
  ]),
] satisfies RouteConfig;
```

## File-system routing (alternative)

```ts
import { type RouteConfig, route } from "@react-router/dev/routes";
import { flatRoutes } from "@react-router/fs-routes";

export default [
  route("/", "./home.tsx"),
  ...(await flatRoutes()),
] satisfies RouteConfig;
```

## Route module pattern

```tsx
import type { Route } from "./+types/team";

export async function loader({ params }: Route.LoaderArgs) {
  return { name: "..." };
}

export default function Component({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.name}</h1>;
}
```

## Nested routes

```ts
route("dashboard", "./dashboard.tsx", [
  index("./home.tsx"),
  route("settings", "./settings.tsx"),
]),
```

Parent path is auto-included in child. Children render through `<Outlet />`.

## Root route

Every route is nested inside `app/root.tsx`.

## Layout routes

`layout(file, children)` — adds nesting without a URL segment.

## Index routes

`index(file)` — renders into parent's `<Outlet />` at parent's URL. No children.

## Route prefixes

`prefix("parent", children)` — adds path prefix without introducing a new route in the tree.

## Dynamic segments

`:name` — parsed from URL, available as `params.name`.

```ts
route("teams/:teamId", "./team.tsx"),
route("c/:categoryId/p/:productId", "./product.tsx"),
```

## Optional segments

Add `?` to make a segment optional: `route(":lang?/categories", ...)`.

## Splat routes

`*` catches the rest of the path. Available as `params["*"]`.
