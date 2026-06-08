# React Router — Data Loading (Framework Mode)

Source: https://reactrouter.com/start/framework/data-loading
Fetched: 2026-06-08 (v7.17.0)

## Three modes

1. **Client** — `clientLoader` only. Page fetches data in browser.
2. **Server** — `loader` only. SSR + pre-render. Load client via auto-`fetch` on navigations.
3. **Static** — `loader` + pre-rendering at build time.

## Client data loading

```tsx
import type { Route } from "./+types/product";

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const res = await fetch(`/api/products/${params.pid}`);
  return res.json();
}

export function HydrateFallback() {
  return <div>Loading...</div>;
}

export default function Product({ loaderData }: Route.ComponentProps) {
  const { name, description } = loaderData;
  return <h1>{name}</h1>;
}
```

## Server data loading

```tsx
import type { Route } from "./+types/product";
import { fakeDb } from "../db";

export async function loader({ params }: Route.LoaderArgs) {
  return fakeDb.getProduct(params.pid);
}

export default function Product({ loaderData }: Route.ComponentProps) {
  return <h1>{loaderData.name}</h1>;
}
```

`loader` is removed from client bundles — safe to use server-only APIs.

## Static data loading (pre-render)

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  async prerender() {
    let products = await readProductsFromCSVFile();
    return products.map(p => `/products/${p.id}`);
  },
} satisfies Config;
```

Pre-rendered at build. Any URL not pre-rendered is server-rendered as usual (mixed mode).

## Using both loaders

```tsx
export async function loader({ params }: Route.LoaderArgs) {
  return fakeDb.getProduct(params.pid);
}

export async function clientLoader({ serverLoader, params }: Route.ClientLoaderArgs) {
  const res = await fetch(`/api/products/${params.pid}`);
  const serverData = await serverLoader();
  return { ...serverData, ...(await res.json()) };
}
```

- Server `loader` runs on initial SSR.
- `clientLoader` runs on subsequent client-side navigations.
- Set `clientLoader.hydrate = true as const` to force the client loader to also run on hydration.

## Serialization

Loader data is auto-serialized server→client. Supports: primitives, plain objects/arrays, `Map`, `Set`, `Date`, `URL`, `RegExp`, `FormData`, `BigInt`, `Promise` (for streaming).

## Streaming

See `references/changelog.md` and the streaming pattern in SKILL.md. The pattern: return un-awaited Promises from a loader + `<Await>` + `<Suspense>` in component.
