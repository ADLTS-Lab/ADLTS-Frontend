# ADLTS Frontend

**Automated Driving License Testing System** – Frontend application for the Ethiopian digital driver licensing platform.

> Built with Next.js 16, Tailwind CSS, TypeScript, and i18n support for Amharic/English.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3-06B6D4)
![License](https://img.shields.io/badge/License-MIT-green)


---

## Overview

ADLTS Frontend provides a modern, bilingual interface for Ethiopia's automated driving license testing system. It supports:

- **Candidates** – register, take exams, view results and history.
- **Admins** – manage devices, monitor active exams, oversee candidates.
- **Super Admins** – full system control (invitations, user management).
- **Experts / Institutes / Transport Authorities** – invitation‑based onboarding (coming soon).

The app is fully responsive, works with a real backend API, and includes a mock backend for local development.

---

## Features


- **Authentication** (login, registration, OTP verification, password reset)
- **Role‑based redirection** (candidate → candidate dashboard, admin → admin devices)
- **Candidate Portal**
  - Dashboard with profile, stats, upcoming test
  - Exam history table
  - Result detail page (score breakdown)
- **Admin Portal**
  - Device management dashboard (grid of devices with status, battery, storage)
  - Active exams monitor (real‑time card grid)
  - Candidate management table (search, status toggle)
- **Bilingual UI** (Amharic / English) with persistent language toggle
- **Mock backend** (local API routes for development)
- **Protected routes** (unauthorised users redirected to login)
- **Responsive design** (mobile, tablet, desktop)

---

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| State Management | Zustand + localStorage persistence |
| HTTP Client | Axios |
| Icons | Lucide React |
| i18n | Custom hook with local dictionaries (`en`, `am`) |
| Dev Mock API | Local Next.js API routes (`app/api/v1/`) |
| Testing (future) | Playwright |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Git

### Installation

```bash
git clone https://github.com/ADLTS-Lab/ADLTS-Frontend.git
cd ADLTS-Frontend
npm install
```

## Booking Lifecycle Smoke Tests

The booking lifecycle is enforced in the shared service layer, the mock API, and the UI entry points. Use the checklist below to verify the current rules locally.

1. Candidate creates a booking, then tries to create another while the current booking is `Pending`, `Approved`, `Payment Pending`, or `Scheduled`. Expected result: the second booking is rejected.
2. Candidate creates a new booking only after the latest booking is `Rejected`, `Cancelled`, or `Completed`. Expected result: booking creation succeeds.
3. Institution attempts to approve or reject a booking that is not `Pending`. Expected result: the request fails with a validation error.
4. Attempt to move `Rejected`, `Cancelled`, `Completed`, or `Expired` back to `Approved`, `Payment Pending`, `Paid`, or `Scheduled`. Expected result: the request fails.
5. Confirm institute-scoped views only show bookings for the logged-in institution.
6. Confirm the candidate dashboard, booking page, payment page, and institution requests page all reflect the same booking state.

Postman examples for the lifecycle live in [postman/ADLTS_API.postman_collection.json](postman/ADLTS_API.postman_collection.json). Use the Bookings section for create/verify and the Payments section for checkout and retry flows.