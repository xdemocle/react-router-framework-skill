# React Router — Actions (Framework Mode)

Source: https://reactrouter.com/start/framework/actions
Fetched: 2026-06-08 (v7.17.0)

## Introduction

Data mutations are done through Route actions. After action completes, all loader data on the page is auto-revalidated.

- `action` — server only
- `clientAction` — browser only, takes priority when both defined

## Client actions

```tsx
import type { Route } from "./+types/project";
import { Form } from "react-router";
import { someApi } from "./api";

export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  const title = formData.get("title");
  return await someApi.updateProject({ title });
}

export default function Project({ actionData }: Route.ComponentProps) {
  return (
    <div>
      <h1>Project</h1>
      <Form method="post">
        <input type="text" name="title" />
        <button>Submit</button>
      </Form>
      {actionData ? <p>{actionData.title} updated</p> : null}
    </div>
  );
}
```

## Server actions

```tsx
export async function action({ request }: Route.ActionArgs) {
  const data = await request.formData();
  const title = data.get("title");
  return await fakeDb.updateProject({ title });
}
```

`action` is removed from client bundles.

## Calling actions

### Declarative: `<Form>`

```tsx
import { Form } from "react-router";

<Form action="/projects/123" method="post">
  <input type="text" name="title" />
  <button>Submit</button>
</Form>
```

This causes a navigation. New history entry.

### Imperative: `useSubmit`

```tsx
import { useSubmit } from "react-router";

let submit = useSubmit();
submit({ quizTimedOut: true }, { action: "/end-quiz", method: "post" });
```

Also navigates.

### Non-navigating: `useFetcher`

```tsx
import { useFetcher } from "react-router";

function Task() {
  let fetcher = useFetcher();
  let busy = fetcher.state !== "idle";

  return (
    <fetcher.Form method="post" action="/update-task/123">
      <input type="text" name="title" />
      <button>{busy ? "Saving..." : "Save"}</button>
    </fetcher.Form>
  );
}
```

Or imperatively: `fetcher.submit({ title: "New" }, { action: "/update-task/123", method: "post" })`.

No navigation. No new history entry. Loader data is still revalidated.

## Auto-revalidation

After ANY action (Form or fetcher), all loaders on the current page re-run and update the UI. No manual refetch needed.

To opt out: use `shouldRevalidate` (per-route) or call-site revalidation opt-out (unstable, 7.11.0).
