# REDESIGN_INTEGRATION_LOCK.md

The frontend/backend integration is already completed and build-clean.

This redesign task is UI-only.

## Do not change

- API endpoint paths
- service function contracts
- auth/login/refresh behavior
- token/localStorage auth persistence
- role guards
- role redirects
- backend response envelope handling
- fallback gating with `NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK`
- environment variable behavior
- backend repo files
- verified service calls
- real API integration logic

## Do not create

- new backend endpoints
- new frontend API contracts
- fake business records
- fake dashboard numbers in portal pages
- localStorage business fallback data
- silent success states when backend fails

## Allowed

- redesign layout
- redesign shared components
- improve navigation/sidebar/footer
- improve landing page storytelling
- improve dashboards visually using existing data
- add charts only from existing service data
- improve loading/error/empty states
- improve accessibility
- improve responsiveness
- improve typography, colors, spacing, shadows, and motion

## API/data rules

- Existing pages must continue using existing services.
- Existing services must continue using verified backend endpoints.
- Generic UI components must not fetch data.
- Shared UI primitives must receive data through props.
- If data is unavailable, show loading, empty, error, or unavailable state.
- Do not invent data.
- Do not fake success.

## Required checks after each phase

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1 NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK=false npm run build
npm test
git diff --check