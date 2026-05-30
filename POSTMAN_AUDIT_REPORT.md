# Postman Collection Audit Report

## 📊 Current Status

| Section | Total Endpoints | Booking Endpoints | Status |
|---------|---|---|---|
| **ADLTS.postman_collection.json** | 48 endpoints | 0 endpoints | ⚠️ INCOMPLETE |
| **Actual API Routes** | ~50+ routes | 3 endpoints | ✅ COMPLETE |

---

## ✅ What Exists in Postman Collection

### Authentication (Complete)
- `POST /auth/login` ✅ (works for all roles: institution, candidate, admin, etc.)
- `POST /auth/logout` ✅
- `POST /auth/token/refresh` ✅
- `PATCH /auth/password/change` ✅

### Institution Management (Complete)
- `GET /institutes` ✅
- `GET /institutes/me` ✅
- `PATCH /institutes/me` ✅
- `PATCH /institutes/me/logo` ✅

### Candidate Management (Complete)
- `GET /candidates` ✅
- `GET /candidates/me` ✅
- `PATCH /candidates/me` ✅

### Invitations (Complete)
- `POST /invitations` ✅
- `GET /invitations` ✅
- `POST /invitations/{id}/resend` ✅

---

## ❌ What's Missing from Postman Collection

### Booking Endpoints (0/3 documented)

#### 1. GET /bookings - List Bookings (Institution-Filtered)
```
Method: GET
URL: {{baseUrl}}/bookings?institute_id={{institutionId}}&page=1&pageSize=10
Headers:
  - Authorization: Bearer {{instituteToken}}
Response:
  {
    "success": true,
    "data": {
      "items": [
        {
          "id": "mock-booking-1",
          "institutionId": "bole-driving-institute",
          "institutionName": "Bole Driving Institute",
          "candidateDetails": {
            "name": "Abebe Tesfaye",
            "email": "abebe.tesfaye@example.com",
            "phone": "+251912345678"
          },
          "licenseCategory": "B",
          "bloodType": "O+",
          "preferredDate": "2026-06-03",
          "preferredSession": "Morning",
          "status": "Pending",
          "createdAt": "2026-05-31T...",
          "updatedAt": "2026-05-31T..."
        }
      ],
      "total": 3,
      "page": 1,
      "pageSize": 10
    }
  }
```

#### 2. POST /bookings - Create Booking
```
Method: POST
URL: {{baseUrl}}/bookings
Headers:
  - Authorization: Bearer {{candidateToken}}
  - Content-Type: application/json
Body:
  {
    "institutionId": "bole-driving-institute",
    "licenseCategory": "B",
    "bloodType": "O+",
    "preferredDate": "2026-06-03",
    "preferredSession": "Morning",
    "additionalNotes": "Optional notes"
  }
Response:
  {
    "success": true,
    "data": {
      "id": "mock-booking-new",
      "institutionId": "bole-driving-institute",
      "institutionName": "Bole Driving Institute",
      "candidateDetails": {
        "name": "Candidate Name",
        "email": "candidate@example.com"
      },
      "status": "Pending",
      "createdAt": "2026-05-31T...",
      "updatedAt": "2026-05-31T..."
    }
  }
```

#### 3. PATCH /bookings/{id}/verify - Approve/Reject Booking
```
Method: PATCH
URL: {{baseUrl}}/bookings/{{bookingId}}/verify
Headers:
  - Authorization: Bearer {{instituteToken}}
  - Content-Type: application/json
Body:
  {
    "action": "approve" | "reject"
  }
Response (Success):
  {
    "success": true,
    "message": "Booking status updated successfully.",
    "data": {
      "id": "mock-booking-1",
      "status": "Approved",
      "updatedAt": "2026-05-31T..."
    }
  }
Response (403 Forbidden):
  {
    "success": false,
    "message": "Forbidden.",
    "status": 403
  }
```

---

## 🔔 Notification Endpoints (Partially Implemented)

### Already in Postman? NO ❌
### Actually Implemented? YES ✅

| Endpoint | Method | Status |
|----------|--------|--------|
| `/api/v1/notifications` | GET | ✅ Implemented |
| `/api/v1/notifications/{id}/read` | PATCH | ✅ Implemented |
| `/api/v1/notifications/read-all` | PATCH | ✅ Implemented |

**Should be added to Postman collection:**
```
GET /notifications?page=1&limit=20
PATCH /notifications/{id}/read
PATCH /notifications/read-all
```

---

## 📝 Recommendations

### Priority 1: Add to Postman (Required)
1. ✅ `GET /bookings` with institute_id parameter
2. ✅ `POST /bookings` for creating new bookings
3. ✅ `PATCH /bookings/{id}/verify` for approve/reject
4. ✅ `GET /notifications`
5. ✅ `PATCH /notifications/{id}/read`
6. ✅ `PATCH /notifications/read-all`

### Priority 2: Enhance Documentation
1. Add test scenarios showing institution access control
2. Add environment variables for testing:
   - `{{boleToken}}`
   - `{{aauToken}}`
   - `{{adminToken}}`
3. Add pre-request script to set institution tokens
4. Add tests to validate 403 responses

---

## 🔗 Implementation Reference

**Where booking endpoints are implemented:**
- `GET /bookings` → `/app/api/v1/bookings/route.ts` (line ~30)
- `POST /bookings` → `/app/api/v1/bookings/route.ts` (line ~80)
- `PATCH /bookings/{id}/verify` → `/app/api/v1/bookings/[id]/verify/route.ts` (line ~1)

**Permission logic:**
- Backend: `/app/api/v1/_mock-bookings.ts`
  - `userCanAccessBooking()` (line 123)
  - `userCanVerifyBooking()` (line 130)
  - `bookingMatchesInstitution()` (line 120)

---

## 🧪 Test Data in Postman Environment

Add these variables to Postman environment for easy testing:

```json
{
  "name": "ADLTS Development",
  "values": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000/api/v1"
    },
    {
      "key": "boleEmail",
      "value": "institute.jane@example.com"
    },
    {
      "key": "bolePassword",
      "value": "InstituteSecure123!"
    },
    {
      "key": "aauEmail",
      "value": "aau@institution.et"
    },
    {
      "key": "aauPassword",
      "value": "InstituteSecure123!"
    },
    {
      "key": "candidateEmail",
      "value": "abebe.tesfaye@example.com"
    },
    {
      "key": "candidatePassword",
      "value": "SecurePassword123!"
    },
    {
      "key": "superAdminEmail",
      "value": "root@adlts.et"
    },
    {
      "key": "superAdminPassword",
      "value": "SuperSecure123!"
    },
    {
      "key": "boleToken",
      "value": ""
    },
    {
      "key": "aauToken",
      "value": ""
    },
    {
      "key": "bookingId",
      "value": "mock-booking-1"
    }
  ]
}
```

---

## ✅ Verification Checklist

- [x] 3 booking endpoints exist in actual API
- [x] Permission checking is implemented and scoped
- [x] Test data is seeded (5 bookings across 3 institutions)
- [x] 7 institution accounts created
- [ ] Booking endpoints added to Postman collection (TODO)
- [ ] Notification endpoints added to Postman collection (TODO)

---

## 🚀 Action Items

1. **Update Postman Collection** with 3 booking endpoints (10 min)
2. **Update Postman Collection** with 3 notification endpoints (5 min)
3. **Add test scenarios** to Postman (institution access control, cross-institution 403, etc.) (15 min)
4. **Export updated collection** and commit to repo (2 min)

Total effort: ~30 minutes to fully document the API.

