# Frontend Integration Checklist

This document lists the minimal steps to make the frontend ready for backend integration and for the team lead to review.

## 1. Environment

- Create a local `.env.local` from `.env.example`.
- **Vercel / self-contained mock (no `localhost:8080`):**

  ```bash
  NEXT_PUBLIC_API_BASE_URL=/api/v1
  NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK=false
  ```

- **Standalone Node mock server (optional local dev):**

  ```bash
  NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1
  ```

  Run `npm run mock:backend` in a second terminal.

- If using a private Postman mock, set `NEXT_PUBLIC_MOCK_API_KEY` to the PMAK value.

## 2. Service layer

Pages should import from `services/`, not `lib/api` directly:

| Service | Real endpoints (Postman) | Mock-only until backend ships |
|---------|--------------------------|-------------------------------|
| `auth.service.ts` | login, register, logout, `/me` by role | local fallback flag |
| `candidates.service.ts` | `GET /candidates`, `PATCH /candidates/:id/status`, `GET\|PATCH /candidates/me` | — |
| `exams.service.ts` | — | exam list, detail, stats, active exams |
| `devices.service.ts` | — | device list + summary |

## 3. API client

- `lib/api.ts` (axios) attaches `Authorization: Bearer <access_token>` from `localStorage`.
- On `401`, the client calls `POST /auth/token/refresh` with `{ refresh_token }` (or Bearer refresh token), then retries the original request.
- Official Postman path: `/auth/token/refresh`. Compatibility alias: `/auth/refresh` (same handler).

## 4. Mock API routes (Next.js — `app/api/v1/`)

These mirror the Postman contract for local/Vercel deployment. Shared state lives in `app/api/v1/_mock-auth.ts`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/auth/login` | public | Returns `{ success, data: { access_token, refresh_token, entity_type, user } }` |
| POST | `/auth/register` | public | Candidate registration |
| POST | `/auth/logout` | bearer access | Clears access token mapping |
| POST | `/auth/token/refresh` | refresh token (body or Bearer) | Rotates tokens |
| POST | `/auth/refresh` | same as above | Compatibility alias |
| GET | `/candidates/me` | candidate | Current candidate profile |
| GET | `/admins/me` | admin | Current admin profile |
| GET | `/super-admins/me` | super_admin | Current super admin profile |
| GET | `/candidates` | admin, super_admin | List candidates; `?search=` optional |
| PATCH | `/candidates/:id/status` | admin, super_admin | Body: `{ status: "active" \| "suspended" }` |

**Demo credentials (Next.js mock):**

- Candidate: `candidate@adlts.et` / `password123`
- Admin: `admin@adlts.et` / `AdminSecure123!`
- Super admin: `root@adlts.et` / `SuperSecure123!`

## 5. Auth flows to verify locally

1. `POST /auth/login` — saves `auth-token`, `refresh-token`, `user-role` in `localStorage`.
2. `GET /candidates/me` (or role-specific `/me`) — dashboard profile load.
3. Admin: `GET /candidates`, `PATCH /candidates/:id/status` on `/admin/candidates`.
4. Token refresh: force `401` (e.g. clear `auth-token` only) and confirm silent refresh via `/auth/token/refresh`.

## 6. Deployment to Vercel

1. Set `NEXT_PUBLIC_API_BASE_URL=/api/v1` in Vercel project environment variables.
2. Deploy; Next.js serves mock routes from `app/api/v1/**/route.ts` on the same origin (no CORS, no separate backend).
3. When the real backend is ready, change `NEXT_PUBLIC_API_BASE_URL` to the deployed API URL (e.g. `https://api.example.com/api/v1`). No page-level changes required if contracts match Postman.

## 7. What will be replaced by the real backend

| Layer | Replace when backend is live |
|-------|------------------------------|
| `app/api/v1/**` route handlers | Remove or disable; requests go to external API |
| `app/api/v1/_mock-auth.ts` | Delete (in-memory mock store) |
| `scripts/mock-backend.mjs` | Optional; only for offline Node mock |
| `lib/api.ts` | Keep — only `NEXT_PUBLIC_API_BASE_URL` changes |
| `services/auth.service.ts` | Keep — endpoint paths already match Postman |
| `store/authStore.ts` | Keep — token persistence unchanged |

**Temporary mock-only endpoints** (not in full production scope yet): local fallback via `NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK` and `adlts-registered-users` in `localStorage`.

## 8. Clean-up before production merge

- Remove dev fallbacks when the backend is authoritative.
- Remove debug console logs.
- Set `NEXT_PUBLIC_API_BASE_URL` to the deployed backend in CI/Vercel.

## 9. Quick local verification

```bash
npm run dev
# With NEXT_PUBLIC_API_BASE_URL=/api/v1 (do not run mock:backend)
```

- Register → login → candidate dashboard
- Admin login → `/admin/candidates` (search + status toggle)
