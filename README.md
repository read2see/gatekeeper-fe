# Gatekeeper FE

Frontend for the Gatekeeper API gateway platform. Built with [Nuxt 4](https://nuxt.com), [Nuxt UI](https://ui.nuxt.com), and [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils).

The app uses a Nitro BFF layer to proxy authenticated requests to the Gatekeeper backend. Session cookies from the backend are stored server-side; the browser only receives a sealed Nuxt session.

## Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io) 9+
- A running [Gatekeeper](https://github.com/your-org/gatekeeper) API (default: `http://localhost:8080`)

## Setup

Install dependencies:

```bash
pnpm install
```

Copy the environment template and fill in the required values:

```bash
cp .env.example .env
```

### Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NUXT_SESSION_PASSWORD` | Production | Secret used by `nuxt-auth-utils` to seal session cookies. Must be at least 32 characters. In development, Nuxt auto-generates a password if this is unset. In production, the app will fail to start without it. |
| `NUXT_GATEKEEPER_API_BASE` | Yes | Base URL of the Gatekeeper backend API (server-only). Defaults to `http://localhost:8080`. |

Example `.env`:

```bash
NUXT_SESSION_PASSWORD=your-32-character-or-longer-secret-here
NUXT_GATEKEEPER_API_BASE=http://localhost:8080
```

## Development

Start the dev server at `http://localhost:3000`:

```bash
pnpm dev
```

## Quality checks

```bash
pnpm typecheck   # TypeScript
pnpm lint        # ESLint
pnpm build       # Production build
pnpm preview     # Preview production build locally
```

## Project structure

```
app/
  components/     # Layout, data table, forms, analytics, UI states
  composables/    # useAuth, useApiClient, useAccess, useDataTable, ...
  config/         # Menus, table configs, permissions
  layouts/        # auth, dashboard
  middleware/     # auth, guest, admin, org route guards
  pages/          # auth, app, admin, org routes
  schemas/        # Zod validation schemas
  types/          # API spec, domain types
server/
  api/auth/       # Public auth proxies (login, register, ...)
  api/gatekeeper/ # Authenticated catch-all proxy to Gatekeeper API
  utils/          # Gatekeeper fetch helper, session sync
shared/types/     # nuxt-auth-utils session type augmentation
```

## Authentication flow

1. User submits credentials on `/auth/login`.
2. Nitro proxies to Gatekeeper, captures the backend session cookie, and stores it in sealed session data.
3. `useUserSession()` hydrates user profile and organization memberships for SSR and client navigation.
4. Authenticated API calls go through `/api/gatekeeper/*`, which forwards the backend cookie server-side.

## Deployment

Build for production:

```bash
pnpm build
```

Ensure `NUXT_SESSION_PASSWORD` and `NUXT_GATEKEEPER_API_BASE` are set in the deployment environment. See the [Nuxt deployment docs](https://nuxt.com/docs/getting-started/deployment) for hosting options.
