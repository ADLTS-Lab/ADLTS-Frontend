# Frontend Integration Checklist

This document lists the minimal steps to make the frontend ready for backend integration and for the team lead to review.

1. Environment
   - Create a local `.env.local` with these variables (see `.env.example`).
   - `NEXT_PUBLIC_API_BASE_URL` should point to the backend or Postman mock (include `/api/v1` if your mock collection uses that prefix).
   - If using a private Postman mock, set `NEXT_PUBLIC_MOCK_API_KEY` to the PMAK value.

2. API client
   - We use `lib/api.ts` (axios) with an `x-api-key` header if `NEXT_PUBLIC_MOCK_API_KEY` is set and an Authorization header from `localStorage` when present.
   - The client retries no requests; 401 responses clear the token and redirect to `/login`.

3. Auth flows to verify locally
   - `POST /auth/register` — should accept the candidate payload and return either a `{ data: { access_token, user } }` shape or at least a successful 200. The frontend saves a local fallback user when the mock is stateless.
   - `POST /auth/login` — should return `{ data: { access_token, entity_type, user } }` or a similar shape (the client normalizes variants).
   - `POST /auth/password/reset` — should accept `{ token, password }` from the reset form.

4. Postman mock tips
   - Save example responses on the relevant requests (register, login, reset) so the mock returns a body.
   - For private mocks, add a request header `x-api-key` with the PMAK value. `lib/api.ts` will add this header automatically if `NEXT_PUBLIC_MOCK_API_KEY` is set.

   7. Local fallback toggle

   - For working with stateless mocks you can enable a local fallback that stores registered users in `localStorage` and allows logging in against them. Set `NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK=true` in your `.env.local` to enable this behavior. Set to `false` to require the backend for auth flows.

5. Clean-up before production merge
   - Remove any dev fallbacks (the `adlts-registered-users` local storage persistence is for testing against stateless mocks).
   - Remove debug console logs.
   - Ensure `NEXT_PUBLIC_API_BASE_URL` is set to the deployed backend in CI or Vercel environment settings.

6. Quick local verification
   - Start dev server: `npm run dev`
   - Test register -> login -> dashboard flows.
   - Test forgot-password (sends email in real backend; mock should show success). For reset flow, use link `http://localhost:3000/reset-password?token=<token>`.

If you want, I can: (A) remove the local fallback code and convert registration to fail when the backend is authoritative, or (B) leave fallback in place and add a feature flag. Tell me which behavior you prefer and I will implement it.
