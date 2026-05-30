# Institution-Scoped Access Control Testing Guide

## 1. Institution Accounts Setup

All demo institutions are in Addis Ababa. Passwords are uniform for testing: `InstituteSecure123!`

| Institution | Email | Password | Institution ID |
|---|---|---|---|
| Bole Driving Institute | `institute.jane@example.com` | InstituteSecure123! | bole-driving-institute |
| Kality Driving School | `kality@institution.et` | InstituteSecure123! | kality-driving-school |
| Adey Ababa Driving Center | `adey-ababa@institution.et` | InstituteSecure123! | adey-ababa-driving-center |
| Lideta Driving School | `lideta@institution.et` | InstituteSecure123! | lideta-driving-school |
| Yeka Driving Academy | `yeka@institution.et` | InstituteSecure123! | yeka-driving-academy |
| Nifas Silk Driving Center | `nifas-silk@institution.et` | InstituteSecure123! | nifas-silk-driving-center |
| AAU Driving School | `aau@institution.et` | InstituteSecure123! | aau-driving-school |

## 2. Test Candidate Accounts

These candidates have bookings at different institutions:

| Name | Email | Password | Test Center |
|---|---|---|---|
| Abebe Tesfaye | `abebe.tesfaye@example.com` | SecurePassword123! | Bole (Booking at Bole) |
| Marta Girma | `marta@example.com` | SecurePassword123! | Bole (Booking at Bole) |
| John Smith | `john@example.com` | SecurePassword123! | Bole (Booking at Bole) |
| Kebebew Assefa | `kebebew@example.com` | SecurePassword123! | AAU (Booking at AAU) |
| Liya Getnet | `liya@example.com` | SecurePassword123! | Kality (Booking at Kality) |

## 3. Test Scenarios

### Scenario 1: Institution Sees Only Their Own Requests ✅

**Expected Behavior:**
- Bole institution should see 3 pending/approved requests: Abebe, Marta, John
- AAU institution should see 1 request: Kebebew
- Kality institution should see 1 request: Liya
- AAU should NOT see Abebe, Marta, John

**Test Steps:**
1. Login to `/admin/login` as Bole: `institute.jane@example.com` / `InstituteSecure123!`
2. Navigate to `/admin/active-exams` (or wherever institution bookings are shown)
3. ✅ Verify you see exactly 3 candidates: Abebe, Marta, John
4. Logout
5. Login as AAU: `aau@institution.et` / `InstituteSecure123!`
6. ✅ Verify you see exactly 1 candidate: Kebebew
7. ✅ Verify Abebe, Marta, John are NOT visible

---

### Scenario 2: Approve/Reject is Institution-Scoped ✅

**Expected Behavior:**
- AAU cannot approve/reject Bole's bookings
- Only Bole can approve/reject Bole's bookings
- Backend returns 403 Forbidden for cross-institution attempts

**Test Steps:**

**Part A: AAU Attempts Cross-Institution Modification (Should Fail)**

1. Login as AAU: `aau@institution.et` / `InstituteSecure123!`
2. Get Bole's booking ID (e.g., `mock-booking-1` - Abebe's booking)
3. Attempt to approve via API:
   ```bash
   curl -X PATCH http://localhost:3000/api/v1/bookings/mock-booking-1/verify \
     -H "Authorization: Bearer <AAU_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"action":"approve"}'
   ```
4. ✅ Should return `403 Forbidden` with message "Forbidden"
5. ✅ Booking status in backend should remain "Pending"

**Part B: Bole Approves Own Booking (Should Succeed)**

1. Login as Bole: `institute.jane@example.com` / `InstituteSecure123!`
2. Navigate to dashboard and click "Approve" on Abebe's booking, or use API:
   ```bash
   curl -X PATCH http://localhost:3000/api/v1/bookings/mock-booking-1/verify \
     -H "Authorization: Bearer <BOLE_TOKEN>" \
     -H "Content-Type: application/json" \
     -d '{"action":"approve"}'
   ```
3. ✅ Should return `200 OK` with updated booking status = "Approved"
4. ✅ Booking status should update in backend

---

### Scenario 3: Candidate Sees Only Their Own Booking

**Expected Behavior:**
- Abebe can only see their own booking at Bole
- Abebe cannot see Kebebew's booking at AAU

**Test Steps:**
1. Login as Abebe: `abebe.tesfaye@example.com` / `SecurePassword123!`
2. Navigate to candidate dashboard
3. ✅ Should see their booking at "Bole Driving Institute"
4. ✅ Should NOT see Kebebew's AAU booking

---

### Scenario 4: Admin/Super-Admin Can See All Bookings

**Expected Behavior:**
- Super-admin can see all bookings from all institutions
- Super-admin can approve/reject any booking

**Test Steps:**
1. Login as root (Super-Admin): `root@adlts.et` / `SuperSecure123!`
2. Navigate to any admin dashboard that shows all bookings
3. ✅ Should see bookings from all institutions: Bole (3), AAU (1), Kality (1)
4. Super-admin should be able to approve/reject any booking regardless of institution

---

## 4. Backend Architecture (Already Implemented ✅)

### Permission Check Flow

```
Institution User Request
    ↓
getAuthenticatedUser(request) → Gets user from token
    ↓
verifyBooking(user, bookingId, action) 
    ↓
userCanVerifyBooking(user, booking)
    ↓
userCanAccessBooking(user, booking)
    ↓
bookingMatchesInstitution(booking, institutionId)
    ↓
✅ PASS → Update status | ❌ FAIL → Return 403 Forbidden
```

### Key Functions (in `_mock-bookings.ts`)

- **`userCanAccessBooking()`**: Checks if user can view a booking
  - Institution users: Only if booking.institutionId matches their institutionId
  - Super/Admin users: Can access all bookings
  - Candidates: Only their own bookings (email match)

- **`userCanVerifyBooking()`**: Checks if user can approve/reject
  - Institution users: Only for their institution's bookings
  - Super/Admin users: Can verify any booking
  - Candidates: Cannot verify

- **`bookingMatchesInstitution()`**: Slugifies and compares institution IDs
  - Handles different formats: `bole-driving-institute` matches `Bole Driving Institute`

---

## 5. API Endpoints to Test

### Get Bookings (Institution-Filtered)
```
GET /api/v1/bookings?institute_id=bole-driving-institute
Authorization: Bearer <BOLE_TOKEN>
```
✅ Returns only Bole's bookings (3 total)

### Approve/Reject Booking (Institution-Scoped)
```
PATCH /api/v1/bookings/:id/verify
Authorization: Bearer <INSTITUTION_TOKEN>
Content-Type: application/json

{
  "action": "approve" | "reject"
}
```
✅ Returns 403 if wrong institution, 200 if correct

### Get Single Booking (Verification)
```
GET /api/v1/bookings/:id
Authorization: Bearer <INSTITUTION_TOKEN>
```
✅ Returns booking if institution matches, 403 if not

---

## 6. Postman Collection Checklist

Based on the Postman collection, verify these endpoints exist:

- [ ] **Login Endpoints**
  - [ ] `POST /auth/login` (works for all roles including institutions)
  
- [ ] **Institution Booking Endpoints**
  - [ ] `GET /bookings?institute_id={id}` (with institution filtering)
  - [ ] `GET /bookings/{id}` (with institution scope check)
  - [ ] `PATCH /bookings/{id}/verify` (approve/reject with action parameter)
  
- [ ] **Candidate Booking Endpoints**
  - [ ] `POST /bookings` (candidate creates booking)
  - [ ] `GET /bookings` (candidate sees only their bookings)
  
- [ ] **Admin/Super-Admin Endpoints**
  - [ ] `GET /bookings` (no filtering, see all)
  - [ ] `PATCH /bookings/{id}/verify` (can approve/reject any)

---

## 7. Known Limitations

- **No cross-institution institution user login**: AAU user cannot log in from a Bole terminal; only from AAU's designated terminal
- **Static seed data**: Bookings are seeded on app startup; modifications are in-memory only
- **No email verification**: Demo institutions are pre-created without self-registration flow

---

## 8. How to Validate All Requirements

### ✅ Requirement 1: Candidate Chooses Institution
- Candidate books at Bole → Bole sees them, AAU doesn't

**How to Test:**
```bash
# Candidate makes booking
POST /api/v1/bookings
{
  "institutionId": "bole-driving-institute",
  "licenseCategory": "B",
  "bloodType": "O+",
  "preferredDate": "2026-06-03",
  "preferredSession": "Morning"
}
```

### ✅ Requirement 2: Bole Sees Only Bole Bookings
- Login as Bole → See 3 candidates
- Login as AAU → See 0 Bole bookings

### ✅ Requirement 3: AAU Cannot Modify Bole Bookings
- AAU attempts PATCH on Bole booking → 403 Forbidden
- Bole approves Bole booking → 200 OK, status updates

### ✅ Requirement 4: Postman Collection Has All Endpoints
- Check postman/ADLTS.postman_collection.json for all endpoints above

---

## 9. Next Steps to Complete End-to-End Testing

1. **Build and Run the App**
   ```bash
   npm run build
   npm run dev
   ```

2. **Test Login Endpoints** (Postman)
   - Login as each institution
   - Verify token is generated correctly

3. **Test Booking Endpoints** (Postman or curl)
   - List bookings for each institution
   - Verify only institution-scoped results

4. **Test Approval Workflow** (UI or API)
   - Approve booking as correct institution
   - Attempt approval as wrong institution
   - Verify 403 response

5. **Test Frontend Filtering**
   - Institution dashboard should only show their bookings
   - Admin dashboard should show all bookings

---

## 10. Troubleshooting

### "403 Forbidden" When Approving Own Booking
- Check: Is the user's `institutionId` set correctly in auth?
- Check: Does the booking's `institutionId` match slugified user's institution?

### Institution Sees Bookings from Other Institutions
- Check: Is the filtering happening server-side in the API endpoint?
- Check: Does `userCanAccessBooking()` match correctly?

### "Forbidden" Error When Both Institutions Are Correct
- Check: Are the institutionIds slugified the same way?
  - `"bole-driving-institute"` === `slugify("Bole Driving Institute")`

