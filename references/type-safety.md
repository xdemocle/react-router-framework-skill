# React Router — Route Module Type Safety

Source: https://reactrouter.com/how-to/route-module-type-safety
Fetched: 2026-06-08 (v7.17.0)

## Setup (if not from template)

### 1. Add `.react-router/` to `.gitignore`

```
.react-router/
```

### 2. Include generated types in tsconfig

```json
{
  "include": [".react-router/types/**/*"],
  "compilerOptions": {
    "rootDirs": [".", "./.react-router/types"]
  }
}
```

If using multiple tsconfig files (e.g. `tsconfig.json`, `tsconfig.node.json`, `tsconfig.vite.json`), put these in the one that includes your `app/` dir — usually `tsconfig.vite.json`.

### 3. Generate types before type checking

```json
{
  "scripts": {
    "typecheck": "react-router typegen && tsc"
  }
}
```

### 4. Type `AppLoadContext` (optional)

```ts
import "react-router";
declare module "react-router" {
  interface AppLoadContext {
    // add context properties here
  }
}
```

### 5. Type-only auto-imports (with `verbatimModuleSyntax: true`)

```tsx
import type { Route } from "./+types/my-route";
```

Otherwise (default):
```tsx
import { Route } from "./+types/my-route";
```

## How it works

The Vite plugin auto-generates types into `.react-router/types/` whenever you edit `routes.ts`. Just run `react-router dev` (or your custom dev server) to get up-to-date types.

## Common errors

- **"Cannot find module './+types/my-route'"** — `react-router typegen` hasn't run, or `tsconfig` `include` doesn't include `.react-router/types/**/*`.
- **`Route.LoaderArgs` has wrong shape** — types stale. Run `typegen` + restart dev server.
- **`loaderData` is `any`** — usually means typegen hasn't been re-run after editing `routes.ts`.

## Stable features

- `Route.LoaderArgs`, `Route.ActionArgs`, `Route.ComponentProps`, `Route.ClientLoaderArgs`, `Route.ClientActionArgs` — all stable.
- `clientLoader.hydrate = true as const` — derives `loaderData` type as the client loader's return (not server loader's).
- `useNavigation()`, `useFetcher()` — fully typed.

## Unstable

- `useRoute()` (7.9.4)
- `useRouterState()` (still experimental)
- Pass-through requests (7.13.2)
- URL Masking (7.13.1)
