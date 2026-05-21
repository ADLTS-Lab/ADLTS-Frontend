# API Endpoints — User Management
## Automated Driving License Testing System


## Final Endpoint Design

### 1 · Auth  `/api/v1/auth`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Candidate self-registration (two-step with automatic OTP trigger)           │
├────────┬──────────────────────────────┬──────────┬───────────────────────── │
│ POST   │ /auth/candidates/register    │ public   │ Creates account,         │
│        │                              │          │ triggers OTP to email    │
│ POST   │ /auth/candidates/verify-otp  │ public   │ Verifies OTP, activates  │
│        │                              │          │ account                  │
├─────────────────────────────────────────────────────────────────────────────┤
│ Invitation-based registration (Expert · Institute · Admin · Authority)      │
├────────┬──────────────────────────────┬──────────┬───────────────────────── │
│ POST   │ /auth/invitations/accept     │ public   │ Token from email,        │
│        │                              │ (token)  │ completes registration   │
├─────────────────────────────────────────────────────────────────────────────┤
│ General — all actors                                                         │
├────────┬──────────────────────────────┬──────────┬───────────────────────── │
│ POST   │ /auth/login                  │ public   │ Returns access +         │
│        │                              │          │ refresh token            │
│ POST   │ /auth/logout                 │ auth     │ Invalidates tokens       │
│ POST   │ /auth/token/refresh          │ auth     │ Rotates access token     │
│ POST   │ /auth/password/forgot        │ public   │ Sends reset link         │
│ POST   │ /auth/password/reset         │ public   │ Token from email,        │
│        │                              │ (token)  │ sets new password        │
│ PATCH  │ /auth/password/change        │ auth     │ Authenticated user       │
│        │                              │          │ changes own password     │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### 2 · Candidates  `/api/v1/candidates`

```
┌────────┬──────────────────────────────┬──────────────────────────────────────┐
│ GET    │ /candidates                  │ Admin · SuperAdmin                   │
│        │ ?page=&search=&status=       │                                      │
│        │ &gender=&city=               │ Note: Institute does NOT see this    │
│        │                              │ list. They see only their own        │
│        │                              │ verified candidates via              │
│        │                              │ /verifications (activity layer)      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /candidates/me               │ Self (Candidate)                     │
│ PATCH  │ /candidates/me               │ Self (Candidate)                     │
│        │                              │ Cannot change: email, fayida_id      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /candidates/:id              │ Admin · SuperAdmin                   │
│ PATCH  │ /candidates/:id              │ SuperAdmin — full fields             │
│ PATCH  │ /candidates/:id/status       │ Admin · SuperAdmin                   │
│        │                              │ (activate, suspend, deactivate)      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ DELETE │ /candidates/me               │ Self (Candidate)                     │
│        │                              │ Soft delete — triggers review,       │
│        │                              │ not immediate hard delete            │
│ DELETE │ /candidates/:id              │ SuperAdmin only                      │
└────────┴──────────────────────────────┴──────────────────────────────────────┘
```

---

### 3 · Experts  `/api/v1/experts`

```
┌────────┬──────────────────────────────┬──────────────────────────────────────┐
│ GET    │ /experts                     │ SuperAdmin only                      │
│        │ ?page=&search=&status=       │                                      │
│        │                              │ Admin does NOT see this list.        │
│        │                              │ Anonymity is structurally enforced   │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /experts/me                  │ Self (Expert)                        │
│ PATCH  │ /experts/me                  │ Self (Expert)                        │
│        │                              │ Cannot change: email, fayida_id,     │
│        │                              │ employee_id                          │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /experts/:id                 │ SuperAdmin only                      │
│ PATCH  │ /experts/:id                 │ SuperAdmin only — full fields        │
│ PATCH  │ /experts/:id/status          │ SuperAdmin only                      │
│        │                              │ (activate, suspend, deactivate)      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ DELETE │ /experts/:id                 │ SuperAdmin only                      │
└────────┴──────────────────────────────┴──────────────────────────────────────┘
```

> **Why Admin cannot access Expert endpoints:**
> Admin is scoped to a TestCenter. If Admin could query experts, they could
> cross-reference appeal timings at their center to identify which expert
> reviewed which appeal. Anonymity must be enforced at the routing layer,
> not just the service layer.

---

### 4 · Institutes  `/api/v1/institutes`

```
┌────────┬──────────────────────────────┬──────────────────────────────────────┐
│ GET    │ /institutes                  │ Admin · SuperAdmin                   │
│        │ ?page=&search=&status=&city= │                                      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /institutes/me               │ Self (Institute)                     │
│ PATCH  │ /institutes/me               │ Self (Institute)                     │
│        │                              │ Cannot change: email                 │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /institutes/:id              │ Admin · SuperAdmin                   │
│ PATCH  │ /institutes/:id              │ SuperAdmin — full fields             │
│ PATCH  │ /institutes/:id/status       │ Admin · SuperAdmin                   │
│        │                              │ (activate, suspend,                  │
│        │                              │ pending-approval)                    │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ DELETE │ /institutes/me               │ Self (Institute)                     │
│        │                              │ Soft delete — triggers review        │
│ DELETE │ /institutes/:id              │ SuperAdmin only                      │
└────────┴──────────────────────────────┴──────────────────────────────────────┘
```

---

### 5 · Admins  `/api/v1/admins`

```
┌────────┬──────────────────────────────┬──────────────────────────────────────┐
│ GET    │ /admins                      │ SuperAdmin only                      │
│        │ ?page=&search=&status=       │                                      │
│        │ &test_center_id=             │ Regular Admin does NOT browse        │
│        │                              │ other admins                         │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /admins/me                   │ Self (Admin)                         │
│ PATCH  │ /admins/me                   │ Self (Admin)                         │
│        │                              │ Cannot change: email,                │
│        │                              │ test_center_id                       │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /admins/:id                  │ SuperAdmin only                      │
│ PATCH  │ /admins/:id                  │ SuperAdmin only — full fields        │
│ PATCH  │ /admins/:id/status           │ SuperAdmin only                      │
│        │                              │ (activate, suspend, deactivate)      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ DELETE │ /admins/:id                  │ SuperAdmin only                      │
│        │                              │ Admin cannot self-delete —           │
│        │                              │ prevents orphaned test centers       │
└────────┴──────────────────────────────┴──────────────────────────────────────┘
```

---

### 6 · Transport Authorities  `/api/v1/transport-authorities`

```
┌────────┬──────────────────────────────┬──────────────────────────────────────┐
│ GET    │ /transport-authorities       │ SuperAdmin only                      │
│        │ ?page=&search=&status=       │                                      │
│        │                              │ Admin does NOT manage auditors.      │
│        │                              │ Conflict of interest.                │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /transport-authorities/me    │ Self (TransportAuthority)            │
│ PATCH  │ /transport-authorities/me    │ Self (TransportAuthority)            │
│        │                              │ Cannot change: email                 │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /transport-authorities/:id   │ SuperAdmin only                      │
│ PATCH  │ /transport-authorities/:id   │ SuperAdmin only — full fields        │
│ PATCH  │ /transport-authorities/:id   │ SuperAdmin only                      │
│        │   /status                    │ (activate, suspend, deactivate)      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ DELETE │ /transport-authorities/:id   │ SuperAdmin only                      │
└────────┴──────────────────────────────┴──────────────────────────────────────┘
```

---

### 7 · Super Admins  `/api/v1/super-admins`

```
┌────────┬──────────────────────────────┬──────────────────────────────────────┐
│ GET    │ /super-admins                │ SuperAdmin only                      │
│        │ ?page=&search=               │ Manage the platform operator team    │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /super-admins/me             │ Self (SuperAdmin)                    │
│ PATCH  │ /super-admins/me             │ Self (SuperAdmin)                    │
│        │                              │ Cannot change: email                 │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /super-admins/:id            │ SuperAdmin only                      │
│ PATCH  │ /super-admins/:id            │ SuperAdmin only                      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ DELETE │ /super-admins/:id            │ SuperAdmin only                      │
│        │                              │ Cannot delete self                   │
└────────┴──────────────────────────────┴──────────────────────────────────────┘
```

---

### 8 · Invitations  `/api/v1/invitations`

```
┌────────┬──────────────────────────────┬──────────────────────────────────────┐
│ POST   │ /invitations                 │ Admin — can invite: Expert,          │
│        │                              │         Institute                    │
│        │                              │ SuperAdmin — can invite: Expert,     │
│        │                              │         Institute, Admin,            │
│        │                              │         TransportAuthority,          │
│        │                              │         SuperAdmin                   │
│        │                              │                                      │
│        │ body: { role, email,         │                                      │
│        │         test_center_id? }    │                                      │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ GET    │ /invitations                 │ Admin (own center's invites)         │
│        │ ?page=&status=               │ SuperAdmin (all invites)             │
├────────┼──────────────────────────────┼──────────────────────────────────────┤
│ DELETE │ /invitations/:id             │ Admin (own center's pending only)    │
│        │                              │ SuperAdmin (any pending)             │
│        │                              │ Revoke before acceptance             │
└────────┴──────────────────────────────┴──────────────────────────────────────┘
```

> Invitation acceptance lives in Auth:
> `POST /auth/invitations/accept` — public, token from email

---

## RBAC Summary Matrix

```
Endpoint                        Candidate  Expert  Institute  Authority  Admin  SuperAdmin
────────────────────────────────────────────────────────────────────────────────────────────
GET  /candidates                   —         —         —          —        ✓       ✓
GET  /candidates/me                ✓         —         —          —        —       —
GET  /candidates/:id               —         —         —          —        ✓       ✓
PATCH /candidates/me               ✓         —         —          —        —       —
PATCH /candidates/:id              —         —         —          —        —       ✓
PATCH /candidates/:id/status       —         —         —          —        ✓       ✓
DELETE /candidates/me              ✓(soft)   —         —          —        —       —
DELETE /candidates/:id             —         —         —          —        —       ✓

GET  /experts                      —         —         —          —        —       ✓
GET  /experts/me                   —         ✓         —          —        —       —
GET  /experts/:id                  —         —         —          —        —       ✓
PATCH /experts/me                  —         ✓         —          —        —       —
PATCH /experts/:id                 —         —         —          —        —       ✓
PATCH /experts/:id/status          —         —         —          —        —       ✓
DELETE /experts/:id                —         —         —          —        —       ✓

GET  /institutes                   —         —         —          —        ✓       ✓
GET  /institutes/me                —         —         ✓          —        —       —
GET  /institutes/:id               —         —         —          —        ✓       ✓
PATCH /institutes/me               —         —         ✓          —        —       —
PATCH /institutes/:id              —         —         —          —        —       ✓
PATCH /institutes/:id/status       —         —         —          —        ✓       ✓
DELETE /institutes/me              —         —         ✓(soft)    —        —       —
DELETE /institutes/:id             —         —         —          —        —       ✓

GET  /admins                       —         —         —          —        —       ✓
GET  /admins/me                    —         —         —          —        ✓       —
GET  /admins/:id                   —         —         —          —        —       ✓
PATCH /admins/me                   —         —         —          —        ✓       —
PATCH /admins/:id                  —         —         —          —        —       ✓
PATCH /admins/:id/status           —         —         —          —        —       ✓
DELETE /admins/:id                 —         —         —          —        —       ✓

GET  /transport-authorities        —         —         —          —        —       ✓
GET  /transport-authorities/me     —         —         —          ✓        —       —
GET  /transport-authorities/:id    —         —         —          —        —       ✓
PATCH /transport-authorities/me    —         —         —          ✓        —       —
PATCH /transport-authorities/:id   —         —         —          —        —       ✓
PATCH /transport-authorities/:id/status —    —         —          —        —       ✓
DELETE /transport-authorities/:id  —         —         —          —        —       ✓

GET  /super-admins                 —         —         —          —        —       ✓
GET  /super-admins/me              —         —         —          —        —       ✓
GET  /super-admins/:id             —         —         —          —        —       ✓
PATCH /super-admins/me             —         —         —          —        —       ✓
PATCH /super-admins/:id            —         —         —          —        —       ✓
DELETE /super-admins/:id           —         —         —          —        —       ✓ (not self)

POST /invitations                  —         —         —          —        ✓*      ✓
GET  /invitations                  —         —         —          —        ✓*      ✓
DELETE /invitations/:id            —         —         —          —        ✓*      ✓

* Admin scoped to own TestCenter only
```

---

## Immutable Fields Per Actor

These fields must be rejected with `400` if sent in any PATCH request.

```
Candidate          email, fayida_id
Expert             email, fayida_id, employee_id
Institute          email
Admin              email, test_center_id
TransportAuthority email
SuperAdmin         email
```

---

## Key Design Rules

```
Rule                                                    Enforcement
──────────────────────────────────────────────────────────────────────────────
All routes prefixed /api/v1                             Router config
Status changes are PATCH /:id/status, not in PATCH /:id Separate handler
/me resolves identity from JWT, no UUID in path         Auth middleware
Expert routes: Admin role returns 403 always            Role guard middleware
TransportAuthority management: Admin returns 403        Role guard middleware
Admin cannot delete themselves                          Service layer check
SuperAdmin cannot delete themselves                     Service layer check
Candidate/Institute self-delete is soft (status change) Service layer
Immutable fields rejected at request validation layer   DTO validation
Invitation role scope enforced (Admin cannot invite     Service layer check
  SuperAdmin or TransportAuthority)
OTP has rate limit and expiry (5 min, 3 attempts)       Auth middleware
Password reset token is single-use and expires (15 min) Auth service
```
