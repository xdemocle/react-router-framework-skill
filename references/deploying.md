# React Router — Deploying (Framework Mode)

Source: https://reactrouter.com/start/framework/deploying
Fetched: 2026-06-08 (v7.17.0)

## Two deployment modes

- **Fullstack Hosting** — server-rendered (SSR). Runs Node / Workers / etc.
- **Static Hosting** — pre-rendered. Deploys as SPA.

## Templates (post-`create-react-router`)

### Node.js with Docker
```
npx create-react-router@latest --template remix-run/react-router-templates/default
```
- Server Rendering
- Tailwind CSS
- Deploys to: AWS ECS, Google Cloud Run, Azure Container Apps, DO App Platform, Fly.io, Railway

### Node with Docker (Custom Server)
```
npx create-react-router@latest --template remix-run/react-router-templates/node-custom-server
```
- Custom express server

### Node + Postgres (Drizzle)
```
npx create-react-router@latest --template remix-run/react-router-templates/node-postgres
```
- Drizzle ORM
- Custom express server

### Vercel
- Vercel-maintained template: https://vercel.com/templates/react-router/react-router-boilerplate

### Cloudflare Workers
- Cloudflare-maintained template: https://developers.cloudflare.com/workers/framework-guides/web-apps/react-router/

### Netlify
- Netlify-maintained template: https://docs.netlify.com/build/frameworks/framework-setup-guides/react-router/

### EdgeOne Pages
- https://pages.edgeone.ai/document/framework-react-router

## CF Workers specifics (Rocco's stack)

`react-router.config.ts`:
```ts
import type { Config } from "@react-router/dev/config";
export default {
  ssr: true,
  v8_viteEnvironmentApi: true, // required since 7.10.0
} satisfies Config;
```

`vite.config.ts`:
```ts
import { reactRouter } from "@react-router/dev/vite";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter(), // MUST be before cloudflare()
    cloudflare(),
    tsconfigPaths(),
  ],
});
```

Build: `npm run build` → `dist/` (or `build/client` + `build/server`).

Deploy: `wrangler deploy` or via CF Pages Git integration.
