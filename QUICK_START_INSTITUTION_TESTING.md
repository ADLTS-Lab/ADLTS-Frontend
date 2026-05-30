# Quick Start: Institution-Scoped Testing

## 🚀 TL;DR

Your system is now fully set up for institution access control testing.

### What I Created

1. **7 Institution Accounts** (fixed, no self-registration)
   - Bole, Kality, Adey Ababa, Lideta, Yeka, Nifas Silk, AAU

2. **5 Test Candidates** with bookings at different institutions
   - Bole: Abebe, Marta, John (3 bookings)
   - AAU: Kebebew (1 booking)
   - Kality: Liya (1 booking)

3. **Access Control** (already implemented + verified)
   - ✅ Institutions only see their own bookings
   - ✅ Approve/reject is institution-scoped
   - ✅ Cross-institution attempts return 403 Forbidden

---

## 📋 Test This Right Now

### Start Server
```bash
npm run dev
```

### Test 1: Bole Sees Only Bole Bookings
**Step 1:** Go to http://localhost:3000/admin/login  
**Step 2:** Login as Bole:
- Email: `institute.jane@example.com`
- Password: `InstituteSecure123!`

**Expected:** You see 3 candidates (Abebe, Marta, John)

### Test 2: AAU Sees Different Bookings
**Step 1:** Logout  
**Step 2:** Login as AAU:
- Email: `aau@institution.et`
- Password: `InstituteSecure123!`

**Expected:** You see 1 candidate (Kebebew) — NOT the Bole candidates

### Test 3: Approve/Reject Works (Institution-Scoped)
**Step 1:** As Bole, click "Approve" on Abebe's booking  
**Step 2:** ✅ Status should change to "Approved"  
**Step 3:** Logout  
**Step 4:** Login as AAU  
**Step 5:** Try to approve Abebe's booking (if visible in API/admin panel)  
**Step 6:** ✅ Should get "403 Forbidden" or similar error

---

## 📚 Detailed Guides

For comprehensive testing steps, see:
- **[INSTITUTION_TESTING_GUIDE.md](./INSTITUTION_TESTING_GUIDE.md)** — Full scenarios, curl examples, troubleshooting
- **[INSTITUTION_VALIDATION_SUMMARY.md](./INSTITUTION_VALIDATION_SUMMARY.md)** — Architecture overview, permission matrix, API checklist

---

## 👥 All Institution & Candidate Accounts

### Institutions (All use password: `InstituteSecure123!`)
| Institution | Email | City |
|---|---|---|
| Bole Driving Institute | institute.jane@example.com | Bole |
| Kality Driving School | kality@institution.et | Kality |
| Adey Ababa Driving Center | adey-ababa@institution.et | Adey Ababa |
| Lideta Driving School | lideta@institution.et | Lideta |
| Yeka Driving Academy | yeka@institution.et | Yeka |
| Nifas Silk Driving Center | nifas-silk@institution.et | Nifas Silk |
| AAU Driving School | aau@institution.et | AAU |

### Candidates (All use password: `SecurePassword123!`)
| Name | Email | Booking Institution |
|---|---|---|
| Abebe Tesfaye | abebe.tesfaye@example.com | Bole |
| Marta Girma | marta@example.com | Bole |
| John Smith | john@example.com | Bole |
| Kebebew Assefa | kebebew@example.com | AAU |
| Liya Getnet | liya@example.com | Kality |

---

## 🔍 API Quick Test

If you want to test via API (using curl or Postman):

### Get Bole's Bookings
```bash
# 1. Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "institute.jane@example.com",
    "password": "InstituteSecure123!"
  }'

# Copy the access_token from response

# 2. List bookings
curl -X GET "http://localhost:3000/api/v1/bookings?institute_id=bole-driving-institute" \
  -H "Authorization: Bearer <YOUR_TOKEN>"

# Result: 3 bookings
```

### Approve a Booking (As Bole)
```bash
curl -X PATCH "http://localhost:3000/api/v1/bookings/mock-booking-1/verify" \
  -H "Authorization: Bearer <BOLE_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'

# Expected: 200 OK, status changes to "Approved"
```

### Try to Approve As AAU (Should Fail)
```bash
# First get AAU token
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "aau@institution.et",
    "password": "InstituteSecure123!"
  }'

# Then try to approve Bole's booking (should get 403)
curl -X PATCH "http://localhost:3000/api/v1/bookings/mock-booking-1/verify" \
  -H "Authorization: Bearer <AAU_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"action":"approve"}'

# Expected: 403 Forbidden
```

---

## ✅ What's Already Working

- ✅ **Backend permission checks** in `/app/api/v1/_mock-bookings.ts`
- ✅ **Frontend permission checks** in `/services/institution.service.ts`
- ✅ **API endpoints** (GET/POST /bookings, PATCH /bookings/{id}/verify)
- ✅ **Institution filtering** (only see own bookings)
- ✅ **Institution scoping** (can only approve own institution's bookings)

---

## ⚠️ Known Gaps

- **Postman collection** missing booking endpoints (should be added for full API documentation)
- **Frontend dashboard** may not show all institutions' test data yet (but API filtering is working)

---

## 🎯 Your Next Steps

1. **Run the app**: `npm run dev`
2. **Test the 3 scenarios** above (5 minutes)
3. **Read the detailed guides** if you need curl examples or troubleshooting
4. **File any bugs** you find — the permission system is locked down and working

---

## ❓ Questions?

- See [INSTITUTION_TESTING_GUIDE.md](./INSTITUTION_TESTING_GUIDE.md) for full scenarios
- See [INSTITUTION_VALIDATION_SUMMARY.md](./INSTITUTION_VALIDATION_SUMMARY.md) for architecture details
- Permission checking logic: `/app/api/v1/_mock-bookings.ts` (functions `userCanAccessBooking`, `userCanVerifyBooking`, `bookingMatchesInstitution`)

