/**
 * Railway infrastructure for the frontend: the web service only. The api,
 * Postgres and its volume belong to test-ci-cd-backend's own
 * .railway/railway.ts.
 *
 * Railway does NOT read this file during deploys — deploys come from pushes to
 * `main` (Wait for CI on). Changes here reach Railway only via
 * `npm run railway:plan` (safe, read-only) and `npm run railway:apply`.
 */
import { defineRailway, github, project, service } from "railway/iac";

// A named partial: this repo owns only `web`, so an apply here never deletes
// the backend's resources (and vice versa).
export const partial = "web";

export default defineRailway(() => {
  const web = service("web", {
    // checkSuites = "Wait for CI": a commit on main deploys only once its
    // GitHub checks (the aggregate `CI` job) pass.
    source: github("valeu36/test-ci-cd-frontend", { checkSuites: true }),
    build: {
      buildEnvironment: "V3",
      builder: "DOCKERFILE",
      dockerfilePath: "Dockerfile",
    },
    healthcheck: "/",
    healthcheckTimeout: 60,
    replicas: { sfo: 1 },
    deploy: { restartPolicyMaxRetries: 5 },
    env: {
      // nginx listens here (nginx.conf.template).
      PORT: "8080",
      // Baked into the bundle at build time (a Docker build arg). The api is
      // owned by the backend repo's partial, so it is referenced by Railway's
      // own template syntax rather than a typed ref.
      VITE_API_URL: "https://${{api.RAILWAY_PUBLIC_DOMAIN}}/api",
    },
  });

  return project("melodious-consideration", { resources: [web] });
});
