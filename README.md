# test-ci-cd-frontend

React 19 + Vite 8 SPA — TanStack Router/Query, Tailwind 4 + shadcn/Radix,
i18next. Pairs with [`test-ci-cd-backend`](../test-ci-cd-backend). CI on
GitHub Actions, CD via Railway's GitHub integration.

## Local setup

```bash
nvm use                 # Node per .nvmrc — under the shell's default v20 failures look like broken deps
npm ci
npm run dev             # http://localhost:5173, proxies /api to API_PROXY_TARGET (default :3000)
```

Copy `.env.example` to `.env.development.local` to point the proxy elsewhere.

## Scripts

| Script                                | What it does                                                      |
| ------------------------------------- | ----------------------------------------------------------------- |
| `lint` / `format:check` / `typecheck` | The three static gates CI runs — prettier is separate from ESLint |
| `test`                                | Vitest unit tests (`src/**/*.test.tsx`)                           |
| `build`                               | `tsc -b && vite build`                                            |
| `test:e2e`                            | Playwright against the **real** backend and the production bundle |

`test:e2e` boots the backend itself via `npm --prefix ../test-ci-cd-backend run
e2e:serve` (Docker Postgres + migrations), so the backend repo must be checked
out next to this one and Docker running. If a dev backend already holds :3000,
run `E2E_API_PORT=3100 npm run test:e2e`. `E2E_BACKEND_DIR` overrides where the
backend lives.

Adding shadcn components: `npx shadcn add <name>`, then rewrite its
`radix-ui` / `lucide-react` barrel imports to subpaths — ESLint rejects the
barrels.

## CI (`.github/workflows/ci.yml`)

`lint`, `typecheck`, `unit`, `build`, `e2e`, and one aggregate `CI` job — the
only check branch protection needs to require.

`e2e` picks the backend commit per run (`.github/actions/resolve-paired-ref`,
byte-identical in both repos): a `Backend-Ref: <branch>` line in the PR body,
else the same-named branch, else `main`.

## One-time GitHub setup

- **Secret `BACKEND_REPO_TOKEN`**: a fine-grained PAT with `Contents: read` on
  the backend repo.
- **Variable `BACKEND_REPOSITORY`** (optional): `owner/name` if the backend is
  not `<this owner>/test-ci-cd-backend`.
- **Branch protection / ruleset** on `main` requiring the `CI` check (paid plan
  for private repos).

## Railway (CD)

A **web** service in the same Railway project as the api, linked to this repo,
branch `main`, **Wait for CI on**. Railway builds the `Dockerfile` at the repo
root (node build → nginx with SPA fallback, listening on Railway's `PORT`).

These live in the Railway service settings, not in this repo — Railway no
longer accepts `railway.json` for new services:

| Setting        | Value                                                                                        |
| -------------- | -------------------------------------------------------------------------------------------- |
| Healthcheck    | `/`, 60s timeout                                                                             |
| Restart policy | on failure, 5 retries                                                                        |
| `PORT`         | `8080`                                                                                       |
| `VITE_API_URL` | `https://${{api.RAILWAY_PUBLIC_DOMAIN}}/api` — baked in at build time, as a Docker build arg |

…and add the web service's domain to the api's `CORS_ORIGINS`.
