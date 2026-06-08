# rocco-s-realm

**Path:** `~/Documents/rocco-s-realm/`
**RR version:** `^7.15.1`
**Vite plugins (order):** MDX plugin → (RR + Tailwind later in the chain)
**Deploy target:** Static prerender with MDX content

## Routes (`src/routes.ts`)

Mix of static pages, dynamic blog posts, and a splat catchall.

```ts
export default [
  index('routes/Index.tsx'),
  route('about', 'routes/About.tsx'),
  route('services', 'routes/Services.tsx'),
  route('mentoring', 'routes/Mentoring.tsx'),
  route('code-refactoring', 'routes/CodeRefactoring.tsx'),
  route('hire', 'routes/Hire.tsx'),
  route('ai-agents', 'routes/AIAgents.tsx'),
  route('portfolio', 'routes/Portfolio.tsx'),
  route('portfolio/ajna-labs', 'routes/portfolio/AjnaLabs.tsx'),
  route('portfolio/mode-network', 'routes/portfolio/ModeNetwork.tsx'),
  route('portfolio/omnia-defi', 'routes/portfolio/OmniaDeFi.tsx'),
  route('blog', 'routes/Blog.tsx'),
  route('blog/:slug', 'routes/BlogPost.tsx'),
  route('contact', 'routes/Contact.tsx'),
  route('*', 'routes/NotFound.tsx'),
] satisfies RouteConfig;
```

## MDX setup

```ts
mdx({
  remarkPlugins: [[remarkFrontmatter, { type: 'yaml', marker: '-' }], remarkGfm],
  rehypePlugins: [rehypeHighlight, rehypeSlug],
  providerImportSource: '@mdx-js/react',
})
```

Vite config has MDX plugin BEFORE React Router plugin.

## `react-router.config.ts`

Dynamic prerender that:
- Lists static pages (`/`, `/about`, `/services`, `/hire`, `/ai-agents`, `/mentoring`, `/code-refactoring`, `/portfolio`, `/portfolio/ajna-labs`, etc.)
- Reads a preprocessed JSON of blog slugs and adds `/blog/<slug>` for each.

## Notable patterns

- **MDX + RR7** — works smoothly. Vite plugin order: MDX first, then RR. The `providerImportSource` is for MDX components to be available in route files.
- **Splat catchall** — `route('*', 'routes/NotFound.tsx')` at the end. RR picks this up for any unmatched path. RR routes are matched in order, so this MUST be last.
- **Subdirectory grouping** — `routes/portfolio/AjnaLabs.tsx` grouped under one parent dir even though the route is flat. Helps with file organization.
- **Static + dynamic hybrid prerender** — list of static paths + computed blog slugs combined into a single `prerender` array.

## Pitfalls hit here

- **MDX frontmatter parsing** — `[type: 'yaml', marker: '-']` is the correct pair. If `marker` is wrong, frontmatter silently fails to parse.
- **`rehypeHighlight` + `rehypeSlug`** both required for syntax-highlighted code blocks with anchor links.
- **Splat route at the end is critical** — putting `*` earlier in the array breaks ALL other routes (splat matches anything, eats the rest).
