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
| `api:generate`                        | Copy the backend's `openapi.json` and regenerate the API client   |
| `api:check`                           | Fail if the generated client is stale (CI runs it)                |
| `railway:plan` / `railway:apply`      | Preview / apply `.railway/railway.ts` to the Railway project      |

`test:e2e` boots the backend itself via `npm --prefix ../test-ci-cd-backend run
e2e:serve` (Docker Postgres + migrations), so the backend repo must be checked
out next to this one and Docker running. If a dev backend already holds :3000,
run `E2E_API_PORT=3100 npm run test:e2e`. `E2E_BACKEND_DIR` overrides where the
backend lives.

Adding shadcn components: `npx shadcn add <name>`, then rewrite its
`radix-ui` / `lucide-react` barrel imports to subpaths — ESLint rejects the
barrels.

## API client (generated)

`src/services/api/generated/` is produced by **orval** from `openapi.json`, a
committed copy of the backend's spec: typed functions plus TanStack Query
hooks (`useHealthCheck()`, …). Never edit it by hand. After a backend API
change, with the backend checked out next to this repo:

```bash
npm run api:generate   # BACKEND_DIR=… to point elsewhere
```

and commit both `openapi.json` and the generated folder. Every call goes
through `src/services/api/fetcher.ts`, which resolves `VITE_API_URL` and throws
an `ApiError` carrying the backend's error envelope on any non-2xx response.

CI guards both ends: `api:check` fails if the generated code does not match
`openapi.json`, and the e2e job fails if `openapi.json` does not match the
paired backend's.

## CI (`.github/workflows/ci.yml`)

`lint`, `typecheck`, `unit`, `build`, `e2e`, and one aggregate `CI` job — the
only check branch protection needs to require.

`e2e` picks the backend commit per run (`.github/actions/resolve-paired-ref`,
byte-identical in both repos): a `Backend-Ref: <branch>` line in the PR body,
else the same-named branch, else `main`.

## One-time GitHub setup

- **Secret `BACKEND_REPO_TOKEN`** (private repos only): a fine-grained PAT with `Contents: read` on
  the backend repo.
- **Variable `BACKEND_REPOSITORY`** (optional): `owner/name` if the backend is
  not `<this owner>/test-ci-cd-backend`.
- **Branch protection / ruleset** on `main` requiring the `CI` check (paid plan
  for private repos).

## Dependabot

Minor and patch updates arrive weekly as one grouped PR. **Majors are ignored
on purpose**: with Wait for CI, a merged Dependabot PR deploys straight to
production. Upgrade a major by hand, on a branch.

## Railway (CD)

A **web** service in the same Railway project as the api, linked to this repo,
branch `main`, **Wait for CI on**. Railway builds the `Dockerfile` at the repo
root (node build → nginx with SPA fallback, listening on Railway's `PORT`).

Its settings — build, healthcheck, restart policy, `PORT`, `VITE_API_URL`
(baked in at build time, as a Docker build arg), Wait for CI — are declared in
**`.railway/railway.ts`**. Railway does not read that file during deploys, so:

```bash
railway login && railway link   # once: project melodious-consideration, env production
npm run railway:plan            # read-only diff between the file and Railway
npm run railway:apply           # apply it
```

The file is a named partial (`web`): applying it never touches the backend's
api, Postgres or volume, which `test-ci-cd-backend/.railway/railway.ts` owns.
The api's `CORS_ORIGINS` must list this service's domain — it does, by
reference, in that file.
