# React Router — Route Module

Source: https://reactrouter.com/start/framework/route-module
Fetched: 2026-06-08 (v7.17.0)

## What is a route module

A route module is the file referenced in `routes.ts`. It defines:
- automatic code-splitting
- data loading (`loader`, `clientLoader`)
- mutations (`action`, `clientAction`)
- revalidation
- error boundaries
- middleware (`middleware`, `clientMiddleware`)
- meta, links, headers, etc.

## Component (default export)

```tsx
export default function MyRouteComponent() { ... }
```

Receives props from `Route.ComponentProps`:
- `loaderData`
- `actionData`
- `params`
- `matches`

```tsx
import type { Route } from "./+types/route-name";

export default function MyRouteComponent({
  loaderData, actionData, params, matches,
}: Route.ComponentProps) { ... }
```

## middleware (stable in 7.9.0)

Server-side. Runs sequentially before/after document and data requests.

```tsx
async function loggingMiddleware({ request, context }, next) {
  console.log(`${new Date().toISOString()} ${request.method} ${request.url}`);
  const start = performance.now();
  const response = await next();
  console.log(`... Response ${response.status} (${performance.now() - start}ms)`);
  return response;
}

export const middleware = [loggingMiddleware];
```

Use for: logging, auth checks, header injection, post-processing responses.

## clientMiddleware (stable)

Same as middleware but in the browser during client navigations. **No Response returned.**

```tsx
async function loggingMiddleware({ request, context }, next) {
  console.log(`... ${request.method} ${request.url}`);
  await next();
  console.log(`... done`);
}

export const clientMiddleware = [loggingMiddleware];
```

## loader

Called on the server for SSR / pre-rendering. Removed from client bundles.

```tsx
export async function loader() {
  return { message: "Hello, world!" };
}
```

## clientLoader

Called only in browser. Useful for SPA-like data fetching. Can call `serverLoader()` to chain.

```tsx
export async function clientLoader({ serverLoader }) {
  const serverData = await serverLoader();
  const data = getDataFromClient();
  return { ...serverData, ...data };
}

// Force client loader to run during hydration (after SSR):
clientLoader.hydrate = true as const;
```

`as const` makes `hydrate: true` instead of `boolean` so types are derived correctly.

## action

Server-side mutation. All loader data on the page is auto-revalidated after.

```tsx
export async function action({ request }: Route.ActionArgs) {
  const data = await request.formData();
  await db.addItem({ title: data.get("title") });
  return { ok: true };
}
```

## clientAction

Browser-only mutation. Takes priority over server `action` when both defined.

```tsx
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  return await someApi.updateProject({ title: formData.get("title") });
}
```

## Other exports (brief)

- `meta` — `<title>`, OG tags, etc.
- `links` — `<link rel="stylesheet">`, etc.
- `headers` — custom response headers.
- `handle` — arbitrary data accessible via `useMatches()`.
- `shouldRevalidate` — opt out of automatic revalidation.
- `ErrorBoundary` — error UI.
- `HydrateFallback` — UI while `clientLoader` runs during hydration.
- `lazy` — lazy-load the module.

## HydrateFallback

Required when `clientLoader.hydrate = true`. Renders during the initial hydration if client loader is still running.

```tsx
export function HydrateFallback() {
  return <div>Loading...</div>;
}
```

## ErrorBoundary

```tsx
import { isRouteErrorResponse, useRouteError } from "react-router";

export function ErrorBoundary() {
  const error = useRouteError();
  if (isRouteErrorResponse(error)) {
    return <div>{error.status} {error.statusText}</div>;
  }
  return <div>Unexpected error</div>;
}
```
