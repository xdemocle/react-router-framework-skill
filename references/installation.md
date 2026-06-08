# React Router — Framework Mode Installation

Source: https://reactrouter.com/start/framework/installation
Fetched: 2026-06-08 (v7.17.0)

## Most projects start with a template

```sh
npx create-react-router@latest my-react-router-app
cd my-react-router-app
npm i
npm run dev
```

Open http://localhost:5173.

Templates:
- https://github.com/remix-run/react-router-templates — multiple ready-to-deploy templates
- Default template: `remix-run/react-router-templates/default`

## Available templates (per `references/deploying.md`)

- **Node.js with Docker** — `remix-run/react-router-templates/default`
- **Node + Custom Server** — `remix-run/react-router-templates/node-custom-server`
- **Node + Postgres (Drizzle)** — `remix-run/react-router-templates/node-postgres`
- **Vercel** — maintained by Vercel (see Vercel Guide)
- **Cloudflare Workers** — maintained by Cloudflare (see Cloudflare Guide)
- **Netlify** — maintained by Netlify
- **EdgeOne Pages** — maintained by EdgeOne

## Dev server

`react-router dev` starts Vite + React Router. Hot reload on `app/` changes. Typegen runs on every route config change.
