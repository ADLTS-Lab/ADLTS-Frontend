# ADLTS Comprehensive Page Content Brief

Generated for the ADLTS frontend redesign workflow.

This file is a content source of truth for expanding the current short pages into longer, more comprehensive public pages and richer role-based portal pages. It is written to pair with the existing UI redesign notes and with `REDESIGN_INTEGRATION_LOCK.md`.

## 1. How To Use This File

Use this document when assigning agents to redesign the landing page, public pages, authentication pages, and role portals.

- Treat the copy below as source material, not as a rigid wireframe.
- Keep backend API contracts unchanged.
- Do not invent live operational numbers in portal pages.
- Static marketing statements are allowed on public pages, but dashboard metrics must come from existing services.
- Keep the bilingual direction: English content is the source here; Amharic copy should be translated after the English structure is approved.
- Use actual app routes from this repo.
- Prefer the shared UI primitives already present in `app/components/ui`.
- Keep pages long, structured, and useful, with multiple sections per page.

## 2. Codebase Analysis Snapshot

The frontend is a Next.js App Router project for the Automated Driving License Testing System, built with TypeScript, Tailwind CSS, Zustand auth state, Axios API services, and custom English/Amharic i18n dictionaries.

### Current Route Groups

Public routes:

- `/`
- `/about`
- `/guidelines`
- `/contact`
- `/privacy-policy`
- `/login`
- `/forgot-password`
- `/reset-password`
- `/candidate/register`

Candidate portal:

- `/candidate/dashboard`
- `/candidate/booking`
- `/candidate/payments`
- `/candidate/exams`
- `/candidate/exams/[examId]`
- `/candidate/notifications`
- `/candidate/profile`
- `/candidate/settings`

Admin portal:

- `/admin/devices`
- `/admin/active-exams`
- `/admin/candidates`
- `/admin/invitations`
- `/admin/notifications`
- `/admin/reports`
- `/admin/settings`

Institute portal:

- `/institute/dashboard`
- `/institute/requests`
- `/institute/notifications`
- `/institute/profile`
- `/institute/settings`
- `/institution/accept-invitation`
- `/institution/requests` re-exports institute requests

Super admin portal:

- `/super-admin/dashboard`
- `/super-admin/institutions`
- `/super-admin/audits`
- `/super-admin/notifications`
- `/super-admin/profile`
- `/super-admin/settings`

Expert portal:

- `/expert/dashboard`
- `/expert/notifications`
- `/expert/profile`
- `/expert/settings`

Transport authority portal:

- `/transport-authority/dashboard`
- `/transport-authority/notifications`
- `/transport-authority/profile`
- `/transport-authority/settings`

### Product Capabilities Present In The Code

- Candidate registration with OTP verification.
- Unified login with role-based routing.
- Candidate booking request creation.
- Active institution selection from backend.
- Booking states: `Pending`, `Approved`, `Payment Pending`, `Scheduled`, `Rejected`, `Cancelled`, `Completed`, `Expired`.
- Booking lifecycle lockout: a candidate cannot create a second active booking while one is pending, approved, waiting for payment, or scheduled.
- Institute request review, filtering, pagination, approve/reject actions, and candidate detail modal.
- Payment initiation, retry, callback confirmation, Chapa provider metadata, and payment history.
- Candidate exam history, exam details, score breakdown, and hidden results state.
- Admin biometric device overview, active exam monitor, candidates table, staff invitations, and reports.
- Super admin metrics, audit logs, institution invitation, resend, disable, and invitation acceptance.
- Expert appeal/review queue and resolve action.
- Transport authority regional analytics and compliance alerts.
- Notifications, profile, and settings pages across roles.
- Shared UI components for containers, headers, cards, inputs, buttons, badges, alerts, empty states, and auth cards.

### Current Content Gap

The public pages are currently concise and functional but too short for a full civic product presentation. The role portals expose real workflows, but many pages need stronger explanatory hierarchy, richer empty states, more useful contextual copy, and better section planning for a redesign.

The redesign should make ADLTS feel like a serious government-aligned operational platform:

- Clear enough for first-time candidates.
- Dense enough for repeated institutional operations.
- Transparent enough for oversight bodies.
- Trustworthy enough for official testing workflows.
- Modern without sounding like generic SaaS marketing.

## 3. Core Brand And Messaging

### Brand Name

ADLTS

### Full Name

Automated Driving License Testing System

### One-Line Summary

ADLTS is a role-based digital platform for registering candidates, managing driving test bookings, verifying institution readiness, processing payments, administering exams, publishing results, and supporting transport authority oversight.

### Short Public Description

ADLTS modernizes driving license testing by connecting candidates, training institutions, exam operators, experts, administrators, and transport authorities through one transparent workflow.

### Longer Public Description

ADLTS is a bilingual digital testing platform built for Ethiopia's driving license examination workflow. It helps candidates move from account creation to booking, institution verification, payment, scheduling, practical testing, result publication, and follow-up support. It also gives institutes, administrators, experts, super admins, and transport authorities dedicated portals for review, monitoring, reporting, compliance, and account governance.

### Voice Principles

- Clear: Use plain words before technical words.
- Official: Sound reliable and procedural, not playful or casual.
- Human: Candidates should feel guided, not processed.
- Operational: Portal copy should help users act quickly.
- Transparent: Explain statuses, next actions, and why something is unavailable.
- Data-safe: Do not claim live numbers unless the backend provides them.

### Preferred Terms

- Candidate, not applicant, when referring to registered test takers.
- Institute, institution, or driving school, depending on context.
- Booking request, not appointment, until the request is approved and scheduled.
- Exam, test, or practical driving test, depending on context.
- Result, score, breakdown, review status.
- Compliance alert, audit event, system health, active device.
- Role-based portal, not generic dashboard.

### Reusable CTAs

Primary public CTAs:

- Start registration
- Create candidate account
- Book your driving test
- Read platform guidelines
- Contact ADLTS support

Portal CTAs:

- Submit booking request
- View booking status
- Pay now
- Retry payment
- View exam results
- Update profile
- Review request
- Approve request
- Reject request
- Resolve review
- Invite institution
- Resend invitation
- Download report

### Dynamic Tokens For Agents

Use these placeholders when writing dynamic UI copy:

- `{{candidateName}}`
- `{{institutionName}}`
- `{{bookingId}}`
- `{{licenseCategory}}`
- `{{bookingStatus}}`
- `{{paymentAmount}}`
- `{{paymentStatus}}`
- `{{examDate}}`
- `{{examCenter}}`
- `{{score}}`
- `{{roleName}}`
- `{{userEmail}}`
- `{{requestCount}}`
- `{{deviceCount}}`
- `{{auditStatus}}`

## 4. Public Landing Page Content

Route: `/`

Current state: hero, four-step process, trust card, minimal footer links.

Target: long homepage with a first-viewport product signal, a full journey explanation, role sections, trust and governance content, FAQ, and conversion CTAs.

### Landing Page Meta

Title:

ADLTS | Automated Driving License Testing System

Description:

Register, book, pay, complete your practical driving test, and track results through Ethiopia's role-based digital driving license testing platform.

### Section 1: Hero

Eyebrow:

Automated Driving License Testing System

H1 option A:

Driving license testing, coordinated from registration to results.

H1 option B:

One digital workflow for driving test booking, verification, payment, exams, and results.

H1 option C:

A clearer path from candidate registration to license test results.

Lead:

ADLTS brings candidates, driving institutes, exam teams, administrators, experts, and transport authorities into one transparent testing workflow. Register once, track every milestone, and let each responsible role complete its part with clear status updates.

Primary CTA:

Start registration

Secondary CTA:

Read guidelines

Support CTA:

Already have an account? Login

Hero status cards:

- Register: Create your candidate profile and verify your account.
- Book: Choose an active institution, license category, preferred date, and session.
- Pay: Complete the required payment after institution approval.
- Test: Attend the scheduled practical exam and wait for verified results.

Hero credibility strip:

- Role-based access for every participant.
- Transparent booking lifecycle.
- Secure account and session handling.
- Operational dashboards for institutions and authorities.

Visual direction:

Use a real product-oriented composition or generated bitmap visual showing the ADLTS workflow: candidate profile, booking status, institute review, payment, exam result, and authority oversight. Avoid generic car stock imagery as the only visual.

### Section 2: Who The Platform Serves

Heading:

Built for every role in the testing process.

Lead:

Driving license testing requires more than a candidate form. ADLTS gives each participant a focused portal so the whole process can move with fewer manual handoffs and clearer accountability.

Role cards:

Candidates:

Create an account, submit booking requests, complete payment, track exam status, view result history, and update profile details.

Institutes:

Review booking requests assigned to your institution, confirm candidate readiness, approve or reject requests, and manage institution profile details.

Administrators:

Monitor biometric devices, active exams, candidate accounts, staff invitations, reports, and operational notifications.

Experts:

Review flagged exam concerns and resolve appeal or review queues with traceable action.

Super admins:

Manage institution onboarding, monitor system metrics, review audit logs, and keep platform governance visible.

Transport authorities:

Review regional performance indicators and compliance alerts across active test centers.

### Section 3: The Problem ADLTS Solves

Heading:

Testing should not depend on disconnected handoffs.

Lead:

When registration, institution review, payment, scheduling, exam monitoring, and result publication live in separate channels, candidates lose visibility and operators lose time. ADLTS reduces that fragmentation by making the workflow visible, role-based, and easier to audit.

Problem points:

- Candidates need to know what step they are in and what action is required next.
- Institutes need a reliable request queue with candidate details, filters, and approval actions.
- Administrators need visibility into devices, active exams, candidates, reports, and invitations.
- Experts need flagged cases collected into a review queue.
- Transport authorities need compliance and performance signals from official workflows.
- Super admins need account governance, institution onboarding, and audit visibility.

Transition copy:

ADLTS does not remove institutional responsibility. It gives each role a structured place to perform that responsibility.

### Section 4: End-To-End Workflow

Heading:

The complete testing lifecycle in one platform.

Lead:

Every candidate journey follows a visible path. Each step has a responsible role, a clear status, and a next action.

Timeline:

1. Candidate account creation

The candidate registers with identity and contact details, creates a password, and verifies the account when OTP verification is required.

2. Booking request

The candidate selects an active institute, license category, blood type, preferred exam date, session, and optional notes.

3. Institution review

The institute reviews the request and candidate details. Pending requests can be approved or rejected according to workflow rules.

4. Payment

Payment opens after approval. The candidate can initiate or retry payment and then return to the booking page for updated status.

5. Scheduling and examination

Approved and paid requests move toward scheduling. Admin teams can monitor active exams and device readiness where backend data is available.

6. Result publication

Candidates view exam history and score breakdown after results are available. Results can remain hidden while under review.

7. Review and oversight

Experts resolve flagged concerns, super admins review audit activity, and transport authorities monitor compliance alerts.

### Section 5: Candidate Journey

Heading:

A candidate experience designed around next steps.

Lead:

The candidate portal should answer three questions at every moment: where am I, what changed, and what should I do next?

Candidate journey cards:

Create your profile:

Register with name, email, phone number, password, and optional identity details such as Fayda ID, birth date, and gender.

Submit a booking request:

Choose an active institution and license category. Add blood type, preferred date, session, and notes to help the institution review the request.

Wait for review:

A pending booking means the institution is reviewing it. Candidates should not submit duplicate active bookings.

Complete payment:

Payment becomes available after approval. The payment page shows booking reference, amount due, payment status, and retry actions when needed.

Prepare for the test:

Once scheduled, candidates can review the booking and wait for exam instructions from the responsible institution or testing center.

Review results:

The exam history page shows completed tests, pass/fail result, score, center, and breakdown when result visibility is enabled.

Candidate assurance copy:

Each booking has a status. Each status has a next action. If a step is unavailable, ADLTS should explain why.

### Section 6: Institution Workflow

Heading:

Institutions get a clear request queue.

Lead:

Institutes are responsible for reviewing booking requests assigned to them. ADLTS gives them the context they need to act carefully and consistently.

Institution capabilities:

- View recent enrollments and request counts.
- Filter requests by search term, status, and license category.
- Review candidate name, email, phone, license category, preferred date, session, and booking date.
- Open candidate details before approving or rejecting.
- Approve or reject only pending bookings.
- Maintain institution profile details, contact person, phone, address, description, and logo.

Institution copy block:

Institutes can focus on readiness review instead of chasing scattered submissions. Every request is tied to a candidate, a category, a preferred session, and a current status.

### Section 7: Admin Operations

Heading:

Operational monitoring for devices, exams, candidates, and reports.

Lead:

Admin users manage the operational layer of the platform. Their pages should be efficient, scan-friendly, and built for repeated daily use.

Admin capability cards:

Device management:

Track biometric units, status, storage utilization, uptime, battery, signal, latency, and warnings where backend data is available.

Active exams:

Monitor running exams, progress, live score, violations, and status categories such as stable, warning, excellent, or review.

Candidate management:

Search candidates, review contact and testing information, and activate or suspend accounts.

Invitations:

Create, resend, and delete staff invitations for roles such as expert, admin, super admin, institute, and transport authority.

Reports:

Generate and download exam reports by test ID when backend endpoints are available.

### Section 8: Review And Oversight

Heading:

Review queues and authority visibility.

Lead:

Automated systems still need human oversight. ADLTS includes expert review, audit logs, and transport authority views to support accountable decisions.

Expert review:

Experts see pending reviews, completed work, flagged issues, candidate names, exam dates, issue types, statuses, and resolve actions.

Super admin governance:

Super admins monitor system metrics, institution accounts, invitation status, active devices, audit events, and platform health.

Transport authority oversight:

Authority users review licensed driver counts, regional pass rates, active centers, pending violations, and compliance alerts when the endpoints provide data.

### Section 9: Status Transparency

Heading:

Every status should tell users what it means.

Lead:

A status label is not enough. Each status should be paired with a next action and a short explanation.

Status glossary:

Pending:

Your request has been submitted and is waiting for institution review.

Approved:

Your request has been accepted by the institution. Payment is now required unless it has already been completed.

Payment Pending:

Payment is required or in progress before scheduling can continue.

Scheduled:

Your test has been scheduled. Review your booking details and follow official instructions.

Rejected:

The institution rejected the request. Review the reason if provided and submit a new request when ready.

Cancelled:

The booking was cancelled. You can create a new booking after cancellation.

Completed:

The test workflow is complete and results may be available.

Expired:

The request is no longer active. Start a new booking if you still need to test.

### Section 10: Security And Privacy Promise

Heading:

Role-based access for sensitive testing data.

Lead:

ADLTS handles identity, booking, payment, examination, and operational data. The interface should make privacy and role access visible without overwhelming users.

Key points:

- Users sign in through authenticated sessions.
- Role redirects send users to the correct portal.
- Candidate information is shown only where operationally necessary.
- Payment details are linked to booking records.
- Exam details and results can remain hidden while under review.
- Audit logs support system accountability.
- Sensitive support requests should include request IDs, not unnecessary personal details.

### Section 11: Why ADLTS Matters

Heading:

A stronger foundation for modern license testing.

Lead:

Digital testing infrastructure is not only about speed. It is about clearer responsibility, fewer blind spots, better candidate communication, and more reliable operational records.

Benefit list:

- Candidates understand the process before and after they apply.
- Institutes review requests from one queue.
- Admins monitor devices and active exams from dedicated pages.
- Experts resolve flagged cases through a structured review path.
- Authorities review compliance issues from a regional view.
- Super admins govern institutions and audit logs from a system-level portal.

### Section 12: FAQ

Heading:

Common questions before you start.

FAQ items:

Question:

Who can register directly?

Answer:

Candidates can create an account through the registration page. Staff roles such as institute, expert, admin, super admin, and transport authority are invitation-based or managed through authorized onboarding.

Question:

Can I create more than one active booking?

Answer:

No. If you already have a pending, approved, payment pending, or scheduled booking, finish or close that workflow before creating another request.

Question:

When does payment become available?

Answer:

Payment becomes available after the selected institution approves the booking request.

Question:

Where do I see my results?

Answer:

Candidates can view exam history and result breakdowns in the candidate portal after results are available and visible.

Question:

What if my result is not visible?

Answer:

Some results may be under review. The result detail page should explain that the result will be published once approved.

Question:

Who reviews flagged exams?

Answer:

Expert users review flagged exams or appeals through the expert portal.

Question:

How are institutions added?

Answer:

Super admins can invite institutions, resend invitations, and disable institution accounts through the super admin portal.

Question:

Does ADLTS replace institution review?

Answer:

No. ADLTS gives institutions and authorities a structured digital workflow. It does not remove official review responsibilities.

### Section 13: Final CTA

Heading:

Ready to begin your driving test journey?

Lead:

Create your candidate account, submit your booking request, and track every step from review to results.

Primary CTA:

Start registration

Secondary CTA:

Read guidelines

Support link:

Need help? Contact support

## 5. About Page Content

Route: `/about`

Current state: mission card, three value cards, short how-it-works list.

Target: long institutional narrative with mission, stakeholder model, platform responsibilities, operating principles, and modernization goals.

### About Meta

Title:

About ADLTS | Automated Driving License Testing System

Description:

Learn how ADLTS supports transparent candidate registration, institute review, exam operations, result tracking, expert review, and transport authority oversight.

### Section 1: Intro

Eyebrow:

About ADLTS

Heading:

Digital infrastructure for a clearer driving license testing process.

Lead:

ADLTS is a role-based platform for managing the driving license testing lifecycle. It connects candidates, institutes, administrators, experts, super admins, and transport authorities through one accountable workflow.

Body:

The system is designed to reduce uncertainty in the testing process. Candidates can see where they are in the journey. Institutes can review requests assigned to them. Administrators can monitor operational readiness. Experts can resolve flagged concerns. Authorities and super admins can review system-level activity.

### Section 2: Mission

Heading:

Our mission

Body:

ADLTS exists to make driving license testing easier to follow, easier to administer, and easier to oversee. The platform does this by turning scattered tasks into a sequence of authenticated, role-specific actions.

Mission bullets:

- Give candidates a clear path from account creation to results.
- Help institutes review booking requests with the right context.
- Support administrators with monitoring and reporting tools.
- Keep expert review and appeal resolution organized.
- Improve visibility for transport authorities and super admins.

### Section 3: What ADLTS Coordinates

Heading:

What the platform coordinates

Cards:

Registration and identity:

Candidate accounts, contact details, OTP verification, profile updates, password reset, and role-based login.

Booking and readiness:

Institution selection, license category, preferred exam date, session, blood type, notes, and candidate details.

Review and approval:

Institute request queues, filters, candidate details, approve actions, reject actions, and pending-status rules.

Payments:

Payment initiation after approval, retry support, payment status, amount due, booking reference, and payment history.

Testing and results:

Active exam monitoring, exam history, score breakdown, result visibility, and hidden results while under review.

Governance:

Institution invitations, audit logs, review queues, compliance alerts, notifications, and settings.

### Section 4: Stakeholder Model

Heading:

One process, separate responsibilities.

Lead:

Each role has a different responsibility. ADLTS keeps those responsibilities separate while making the full process easier to understand.

Role responsibility table:

Candidate:

Registers, requests booking, pays after approval, tracks exam and results.

Institute:

Reviews candidate requests, approves or rejects pending bookings, manages institution profile.

Admin:

Monitors devices, active exams, candidates, invitations, reports, and notifications.

Expert:

Reviews flagged exam concerns and resolves pending cases.

Super admin:

Manages institutions, invitations, system metrics, audit logs, and governance.

Transport authority:

Monitors regional analytics, compliance alerts, and operational indicators.

### Section 5: Operating Principles

Heading:

Principles behind the system

Principles:

Transparency:

Users should understand what a status means and what action comes next.

Accountability:

Sensitive actions such as approvals, invitations, status changes, and review resolution should be traceable.

Role clarity:

Users should only see the tools and data needed for their role.

Operational reliability:

The interface should show loading, empty, unavailable, and error states honestly.

Accessibility:

The platform should remain usable across devices, languages, and user abilities.

No fake data:

Dashboards should not invent business records or success states when the backend has not returned them.

### Section 6: How It Works

Heading:

How the ADLTS lifecycle works

Steps:

1. A candidate creates an account and signs in.
2. The candidate submits a booking request for an active institute.
3. The institute reviews the request and decides whether it can proceed.
4. Approved requests move to payment.
5. Paid or scheduled requests move toward examination.
6. Exam results become available after completion and review.
7. Experts, administrators, super admins, and authorities monitor the system from their portals.

### Section 7: Modernization Outcomes

Heading:

What improves when the workflow is connected

Benefits:

- Fewer manual follow-ups for candidates.
- Better visibility for institution request queues.
- Faster recognition of device and exam issues.
- More consistent handling of appeals and flagged cases.
- Clearer system audit trail for governance.
- Stronger public confidence in the testing process.

### Section 8: About CTA

Heading:

Start with the right next step.

Lead:

Candidates can register directly. Staff and institutional roles should use authorized onboarding or contact support.

Primary CTA:

Register as candidate

Secondary CTA:

Read guidelines

Support CTA:

Contact ADLTS

## 6. Guidelines Page Content

Route: `/guidelines`

Current state: overview, requirements, booking process, short FAQ.

Target: full operational guide for candidates and institutions.

### Guidelines Meta

Title:

ADLTS Guidelines | Booking, Payment, Exams, Results

Description:

Review the steps, requirements, statuses, and responsibilities for using the Automated Driving License Testing System.

### Section 1: Intro

Eyebrow:

Platform guidelines

Heading:

Know the process before you submit your request.

Lead:

These guidelines explain how ADLTS moves a candidate from registration to booking, institution review, payment, examination, and result tracking.

### Section 2: Before You Begin

Heading:

Before you start registration

Checklist:

- Use an email address you can access.
- Prepare your phone number and personal details.
- Use a strong password with at least 8 characters.
- Have any institution or training records requested by your reviewing institute.
- Confirm that you are selecting the correct license category.
- Keep your booking reference when contacting support.

### Section 3: Candidate Registration Requirements

Heading:

Candidate registration requirements

Required:

- First name.
- Last name.
- Email address.
- Phone number.
- Password.
- Confirmed password.

Optional or contextual:

- Fayda ID.
- Birth date.
- Gender.
- Additional institution-required documents or records.

Instruction copy:

Enter details carefully. The same profile information may be used by institutes, exam teams, and support staff when reviewing your booking or resolving an issue.

### Section 4: Booking Process

Heading:

How booking works

Steps:

1. Sign in to your candidate portal.
2. Open the booking page.
3. Select an active institution.
4. Choose your license category: A, B, C, or D.
5. Add blood type, preferred date, preferred session, and optional notes.
6. Submit the request.
7. Wait for institution review.
8. Pay only after the request is approved.
9. Track scheduling and exam progress from your portal.
10. Review results once they are available.

### Section 5: License Categories

Heading:

License category guide

Category A:

Motorcycle and two-wheel motorized vehicle testing.

Category B:

Light vehicle testing for standard private vehicles and everyday driving.

Category C:

Public service or passenger vehicle testing, depending on local classification.

Category D:

Heavy vehicle testing requiring advanced control.

Note:

Use the category provided by your training institution or transport authority instructions. If unsure, contact your institution before submitting the request.

### Section 6: Institution Review

Heading:

What happens during institution review

Body:

When a booking is pending, the selected institution reviews the request. The institute may check candidate readiness, category, preferred date, contact information, and any required training or document trail.

Possible outcomes:

Approved:

The request can proceed to payment.

Rejected:

The request cannot proceed. The candidate should review any available guidance and submit a new request when ready.

Still pending:

The institution has not completed review yet. Candidates should check the portal instead of submitting duplicate requests.

### Section 7: Payment Guidance

Heading:

Payment opens after approval

Body:

Candidates should not attempt payment before approval. The payment page shows the selected booking, reference ID, exam date, session, amount due, and available payment action.

Payment states:

Pending or initiated:

Payment has started or is waiting for completion.

Succeeded:

Payment is complete. The booking can proceed toward scheduling.

Failed or cancelled:

Use retry payment if available.

Unavailable:

Payment is not available for the current booking status.

### Section 8: Exam Day Guidance

Heading:

Preparing for the practical exam

Candidate reminders:

- Arrive according to institution or testing center instructions.
- Bring any required identity or training documents.
- Review your booking details before the test date.
- Follow the testing center's safety instructions.
- Do not rely on screenshots alone if official staff request live portal verification.

### Section 9: Results And Review

Heading:

Viewing results

Body:

After completion, candidates can check exam history from the candidate portal. A result detail page may show date, score, result, center, and performance breakdown. If a result is under review, the page should explain that publication is pending.

Result visibility copy:

Some results require review before they are shown. If your result is not visible, wait for the official update or contact support with your booking reference.

### Section 10: Booking Status Reference

Heading:

Booking status reference

Pending:

Your request is waiting for institution review.

Approved:

Your request was accepted. Complete payment to continue.

Payment Pending:

Payment is required or in progress.

Scheduled:

Your test has been scheduled.

Rejected:

Your request was not accepted by the institution.

Cancelled:

Your booking was cancelled.

Completed:

The booking cycle is complete.

Expired:

The request is no longer active.

### Section 11: Guidelines FAQ

Question:

Can I change my selected institution?

Answer:

If the booking is still pending, the current interface allows candidates to change institution details from the booking page. If the request has moved beyond pending, contact support or follow institution instructions.

Question:

Why can I not submit another booking?

Answer:

ADLTS prevents duplicate active bookings. Finish, cancel, or close the current workflow before starting a new request.

Question:

What should I do if payment fails?

Answer:

Return to the payment page and use retry payment if it is available. If the problem continues, contact support with your booking reference.

Question:

Who approves my booking?

Answer:

The selected institute reviews and approves or rejects pending booking requests.

Question:

Where can I update my profile?

Answer:

Use the profile page inside the candidate portal after logging in.

Question:

What should institutions check before approving?

Answer:

Institutions should review candidate identity, contact details, license category, preferred date, readiness, and any required training or document records.

### Section 12: Guidelines CTA

Heading:

Ready to continue?

Lead:

Create your account or sign in to manage your booking.

Primary CTA:

Start registration

Secondary CTA:

Login

## 7. Contact Page Content

Route: `/contact`

Current state: email, phone, office cards, message guidance.

Target: support routing page with issue categories, response expectations, form content, and urgent case guidance.

### Contact Meta

Title:

Contact ADLTS Support

Description:

Get help with account access, candidate booking, payment, institution review, exam results, invitations, and platform support.

### Section 1: Intro

Eyebrow:

Contact support

Heading:

Get the right help for your ADLTS workflow.

Lead:

Use this page when you need help with account access, booking status, payment, result visibility, institution onboarding, or operational support.

### Section 2: Support Channels

Cards:

Email support:

support@adlts.et

Use for account access, booking questions, payment issues, result visibility, onboarding, and general support.

Direct line:

+251 11 000 0000

Use for time-sensitive support during official working hours.

Office:

Addis Ababa, Ethiopia

Use for official in-person support when physical verification is required.

### Section 3: Choose Your Issue Type

Heading:

What do you need help with?

Issue cards:

Account access:

Login problems, password reset, OTP verification, locked account, or incorrect role routing.

Candidate booking:

Booking creation, duplicate booking block, institution selection, license category, cancellation, or status questions.

Payment:

Payment not opening, failed checkout, retry payment, missing payment update, or receipt questions.

Exam and results:

Scheduled exam details, missing results, hidden result under review, or result breakdown questions.

Institution support:

Institute request queue, approval or rejection errors, profile updates, or institution onboarding.

Operational support:

Admin device data, active exam monitor, reports, invitations, compliance alerts, or audit visibility.

### Section 4: What To Include In A Message

Heading:

Help support resolve your request faster.

Checklist:

- Your full name.
- Your account email.
- Your role, such as candidate, institute, admin, expert, super admin, or transport authority.
- Booking reference, payment reference, or exam ID when relevant.
- The page where the problem happened.
- The exact status or error message shown.
- A short description of what you expected to happen.

Security note:

Do not send your password. Support should never ask for it.

### Section 5: Message Form Copy

Form heading:

Send ADLTS support a message

Fields:

- Full name
- Email address
- Role
- Issue category
- Booking or exam reference
- Message

Placeholder:

Example: My booking is approved, but the payment button is unavailable. Booking reference: {{bookingId}}.

Submit CTA:

Send message

Success message:

Your message has been received. Keep your reference number available for follow-up.

Error message:

Unable to send your message right now. Check your connection and try again.

### Section 6: Urgent Operational Issues

Heading:

When the issue is urgent

Body:

Contact support immediately if the issue prevents an active exam, blocks approved payment, hides a required result, or affects institution review for multiple candidates.

Urgent examples:

- Locked account before scheduled exam.
- Approved booking with payment unavailable.
- Payment completed but booking did not update.
- Scheduled exam missing from the portal.
- Institution queue not loading.
- Active exam monitor or device status unavailable during operations.

### Section 7: Contact CTA

Heading:

Looking for self-service steps?

Lead:

Many questions are answered in the platform guidelines.

CTA:

Read guidelines

## 8. Privacy Policy Page Content

Route: `/privacy-policy`

Current state: overview, data stored, usage, control, contact.

Target: clear non-legal privacy explainer. This should be reviewed by legal/policy owners before being treated as an official legal policy.

### Privacy Meta

Title:

ADLTS Privacy And Security

Description:

Learn how ADLTS handles account, booking, payment, exam, review, and operational data across role-based portals.

### Section 1: Intro

Eyebrow:

Privacy and security

Heading:

How ADLTS handles role-based testing data.

Lead:

ADLTS uses personal, booking, payment, exam, and operational data to support official driving license testing workflows. The platform should show only the information needed for each authenticated role.

Review note:

This page content is a product privacy explainer and should be reviewed by the responsible legal or policy authority before publication as a binding privacy policy.

### Section 2: Privacy Principles

Principles:

Purpose limitation:

Data should be used to operate the testing workflow, secure accounts, process requests, and support oversight.

Role-based visibility:

Candidates, institutes, administrators, experts, super admins, and authorities should see only the data needed for their tasks.

Transparency:

Users should understand why information is requested and what it supports.

Security:

Authentication, sessions, role routing, and password controls protect access to portal data.

Accuracy:

Profile and booking details should be kept up to date to avoid review and scheduling issues.

### Section 3: What ADLTS Stores

Account data:

Name, email, phone number, role, password credentials, OTP verification state, and session state.

Candidate profile data:

First name, last name, phone, birth date, gender, address, Fayda ID, license category, and test center details when provided.

Booking data:

Institution, license category, blood type, preferred date, preferred session, notes, candidate details, status, and timestamps.

Payment data:

Booking ID, amount, currency, provider, provider reference, checkout URL when returned, status, metadata, and timestamps.

Exam data:

Exam ID, date, type, score, result, center, performance breakdown, notes, and result visibility.

Operational data:

Device status, active exam status, reports, staff invitations, institution accounts, audit logs, review queues, compliance alerts, and notifications.

### Section 4: How ADLTS Uses Data

Uses:

- Authenticate users and route them to the correct portal.
- Let candidates submit and track bookings.
- Let institutes review candidate requests.
- Open payment only after approval.
- Show exam history and result details.
- Help administrators monitor operational readiness.
- Help experts review flagged cases.
- Help transport authorities monitor compliance.
- Help super admins govern institutions and audit activity.
- Send notifications and status updates.
- Support troubleshooting and security review.

### Section 5: Role-Based Access

Heading:

Who can see what?

Candidate:

Own profile, own bookings, own payments, own exams, own notifications and settings.

Institute:

Booking requests assigned to the institute, candidate details needed for review, institute profile, and related notifications.

Admin:

Operational device data, active exam monitor, candidates, invitations, reports, and notifications.

Expert:

Flagged review cases and profile/settings data for the expert account.

Super admin:

System-level metrics, institution accounts, audit logs, invitations, profile, notifications, and settings.

Transport authority:

Regional analytics, compliance alerts, profile, notifications, and settings.

### Section 6: Security Practices In The Product

Practices:

- Login uses authenticated backend sessions.
- Role-based redirects send users to the proper home route.
- Password reset uses token-based reset links.
- Candidate registration may use OTP verification.
- Password changes require current and new password fields.
- Payment actions are tied to a booking ID.
- Result visibility can be restricted while under review.
- Audit logs support oversight of system events.

### Section 7: User Responsibilities

Heading:

How users can protect their accounts

Checklist:

- Use an email account you control.
- Keep your password private.
- Do not share OTP codes or reset links.
- Sign out on shared devices.
- Keep profile and contact details accurate.
- Contact support immediately if you suspect unauthorized access.

### Section 8: Corrections And Support

Heading:

Requesting corrections

Body:

If your profile, booking, payment, or exam information appears incorrect, contact support with your account email and the relevant reference ID. Operational corrections may require review by the responsible institute, admin, expert, or authority role.

CTA:

Contact support

## 9. Authentication And Registration Content

### Login Page

Route: `/login`

Page goal:

Let all roles sign in through one entry point and route them to the correct portal.

Expanded sections:

- Auth card.
- Role explanation panel.
- Help links for password reset and registration.
- Security reminder.

Copy:

Title:

Login to ADLTS

Subtitle:

Use the email and password connected to your ADLTS account. After login, you will be sent to the portal for your role.

Security reminder:

Keep your password private. ADLTS support will never ask for your password.

Role routing helper:

Candidates, institutes, admins, experts, super admins, and transport authority users all use this login page. Your account role controls which portal opens after login.

### Forgot Password Page

Route: `/forgot-password`

Title:

Reset your ADLTS password

Subtitle:

Enter the email connected to your account. If the address is recognized, ADLTS will send reset instructions.

Success:

Password reset instructions have been sent. Check your email and follow the link before it expires.

Helper:

If you no longer have access to your email, contact support with your name, role, and institution if applicable.

### Reset Password Page

Route: `/reset-password`

Title:

Create a new password

Subtitle:

Choose a password with at least 8 characters. Use a password you do not use on shared or public systems.

Missing token error:

This reset link is missing a valid token. Request a new password reset link.

Success:

Your password has been updated. Redirecting you to login.

### Candidate Registration Page

Route: `/candidate/register`

Page goal:

Help a candidate create an account and understand what happens next.

Expanded sections:

- Registration form.
- What you need before registration.
- Why contact details matter.
- OTP verification step.
- Next step after registration.

Copy:

Title:

Create your candidate account

Subtitle:

Register once, verify your account, and use the candidate portal to submit booking requests, track payment, and view exam results.

Before you continue:

- Use your own email address.
- Enter a reachable phone number.
- Choose a secure password.
- Add optional identity details if your institution requires them.

OTP title:

Verify your email

OTP subtitle:

Enter the one-time code sent to your email to finish account setup.

Post-registration next step:

After your account is verified, go to the candidate dashboard and start your booking request.

## 10. Candidate Portal Content

### Candidate Dashboard

Route: `/candidate/dashboard`

Current capability:

Shows candidate greeting, active booking status, institution, booking reference, next action, progress steps, license categories, and quick actions.

Target sections:

- Personal greeting.
- Current journey state.
- Booking progress timeline.
- Next action panel.
- License category cards.
- Quick actions.
- Guidance for no active booking.
- Recent notifications or updates if available.

Page header:

Welcome, `{{candidateName}}`

Description:

Track your booking lifecycle, payments, and exam progress in one place.

No active booking empty state:

Title:

No active booking

Description:

Submit a booking request to begin your testing journey. You will be able to track each stage from institution review to result publication.

CTA:

Start booking request

Next action copy by status:

Pending:

Your request is waiting for institution approval. Check this page for updates before starting any new request.

Approved:

Your request has been approved. Complete payment to continue toward scheduling.

Payment Pending:

Payment is required before scheduling can continue.

Scheduled:

Your exam is scheduled. Review your booking details and follow instructions from your institute or test center.

Completed:

Your booking cycle is complete. Review your exam history when results are available.

Rejected, Cancelled, Expired:

This booking is closed. Start a new request when you are ready.

### Candidate Booking Page

Route: `/candidate/booking`

Current capability:

Candidate can create a booking request, select active institution, choose category, blood type, preferred date/session, notes, view current booking, payment badge, history, cancel pending/approved booking, and change institution while pending.

Target sections:

- Page intro and status explanation.
- Booking form.
- Current booking summary.
- Payment state card.
- Process guide.
- Selected institution detail.
- Booking history.
- Duplicate booking guard copy.
- Cancel confirmation modal.

Page header:

Book your practical driving test

Description:

Select an active institution, license category, preferred date, and session. Your request will be reviewed before payment opens.

Form helper:

If you already have an active booking, finish or close that workflow before creating another request.

Process guide:

1. Submit booking request.
2. Wait for institution review.
3. Complete payment after approval.
4. Attend scheduled practical exam.
5. Review result when published.

Booking lock copy:

You already have an active booking. You can create a new request only after the current booking is rejected, cancelled, completed, or expired.

Cancel modal:

Title:

Cancel booking?

Description:

Your current booking will be marked as cancelled. You can create a new booking after cancellation.

Primary action:

Keep booking

Danger action:

Cancel booking

### Candidate Payments Page

Route: `/candidate/payments`

Current capability:

Finds payable booking, shows payment complete, awaiting approval, no booking, or payment card. Initiates or retries payment.

Target sections:

- Payment page header.
- Booking summary.
- Amount due.
- Payment status.
- Payment action.
- Payment history.
- State explanations.
- Help link.

Page header:

Payment

Description:

Complete payment after your institution approves the booking request.

No booking state:

Submit and receive approval for a booking before payment is available.

Awaiting approval state:

Payment opens after `{{institutionName}}` approves your booking request.

Payment complete state:

Payment is complete for booking `{{bookingId}}`. Return to booking status for scheduling updates.

Payment unavailable state:

Payment is not available for the current booking status: `{{bookingStatus}}`.

### Candidate Exams Page

Route: `/candidate/exams`

Current capability:

Loads exam history, metrics, mobile cards, desktop table, result detail links, empty state.

Target sections:

- Exam summary metrics.
- Exam history table.
- Result visibility explanation.
- Empty state with booking CTA.
- Result legend.

Page header:

Exam history

Description:

Review completed driving tests, scores, results, centers, and available result breakdowns.

Empty state:

Title:

No exam results yet

Description:

Your results will appear here after you complete a test and the result is available.

CTA:

Start a booking first

Hidden result helper:

Some results require review before publication. If a result is hidden, wait for the official update or contact support with your exam ID.

### Candidate Exam Detail Page

Route: `/candidate/exams/[examId]`

Target sections:

- Result header.
- Score and pass/fail summary.
- Performance breakdown.
- Notes.
- Review unavailable state.
- Back link.

Hidden result state:

Title:

Result under review

Description:

This result is being reviewed and will be published once approved.

### Candidate Profile Page

Route: `/candidate/profile`

Target sections:

- Profile summary.
- Photo upload.
- Personal information form.
- Account details.
- Security/password change.
- Success/error alerts.

Profile intro:

Keep your contact and identity details accurate so institutions and support teams can review your booking without delays.

Password helper:

Use a strong password and update it immediately if you think your account has been exposed.

### Candidate Settings Page

Route: `/candidate/settings`

Target sections:

- Language preference.
- Notification preferences.
- Theme preference if active in store.
- Save state.

Settings intro:

Manage how ADLTS appears and which updates you want to receive.

## 11. Admin Portal Content

### Admin Device Management

Route: `/admin/devices`

Current capability:

Shows total, online, warning, offline devices; device cards with status, utilization, uptime, latency/signal/temperature; action buttons.

Target sections:

- Operational summary.
- Device health KPIs.
- Device grid.
- Warning guidance.
- Empty state.
- Register device action.

Page header:

Device management

Description:

Track connected biometric units, status, utilization, connectivity, and operational warnings.

Empty state:

No devices found. Registered biometric units will appear here after the backend returns device data.

Warning guidance:

Warnings should be reviewed before the next exam session. Offline devices may require remote wake, ticket creation, or local inspection.

### Admin Active Exams

Route: `/admin/active-exams`

Target sections:

- Live monitor header.
- KPI cards for active, warnings, reviews, excellent.
- Active exam cards.
- Polling/refresh helper.
- Empty state.

Page header:

Active exams monitor

Description:

Review running exams, progress, live score, violations, and status indicators.

Empty state:

No active exams are currently running.

### Admin Candidates

Route: `/admin/candidates`

Target sections:

- Candidate management summary.
- Active/suspended/total metrics.
- Search.
- Candidate table.
- Status toggle action.
- Empty and error states.

Page header:

Candidate management

Description:

Search candidates, review account details, and manage active or suspended status.

Toggle helper:

Use status changes carefully. Suspended candidates may be blocked from normal workflow actions.

### Admin Invitations

Route: `/admin/invitations`

Target sections:

- Invitation summary.
- Create invitation form.
- Role selector explanation.
- Invitations table.
- Resend/delete actions.
- Empty state.

Page header:

Invitation management

Description:

Create, resend, and track staff invitations from the backend.

Role helper:

Choose the role that matches the user's responsibility. Staff roles should not be created through candidate registration.

### Admin Reports

Route: `/admin/reports`

Target sections:

- Report generation form.
- Analytics availability state.
- Download PDF action.
- Backend unavailable explanation.

Page header:

Reports and analytics

Description:

Generate exam reports and download PDFs when backend report endpoints are available.

Backend-blocked state:

Analytics dashboards are not available from the connected backend yet. Report generation can still run when a valid test ID is provided.

## 12. Institute Portal Content

### Institute Dashboard

Route: `/institute/dashboard`

Current capability:

Institute overview, active students, upcoming exams, pass rate, request counts, recent enrollment table, approve/reject actions, candidate details modal.

Target sections:

- Institute overview header.
- KPI row.
- Request status row.
- Recent enrollments table.
- Candidate details modal.
- Review rules reminder.

Page header:

Institute dashboard

Description:

Review your driving school candidates, booking queue, and upcoming testing activity.

Review rule:

Only pending bookings can be approved or rejected. Closed or advanced bookings cannot be changed from this queue.

Empty state:

No recent requests. New booking requests assigned to your institution will appear here.

### Institute Requests

Route: `/institute/requests`

Current capability:

Filter by search, status, license category; paginated request table; candidate modal; approve/reject.

Target sections:

- Filter panel.
- Request table.
- Pagination.
- Detail modal.
- Bulk summary if data supports it.
- Empty state.

Page header:

Booking requests

Description:

Review booking requests assigned to your institution and act on pending requests.

Empty state:

No booking requests found. Requests for your institution will appear here.

### Institute Profile

Route: `/institute/profile`

Current capability:

Logo upload, institution details, contact person, phone, address, description, email, institution ID, password change.

Target sections:

- Institution identity.
- Logo upload.
- Contact and location details.
- Description.
- Read-only account references.
- Security section.

Page header:

Institute profile

Description:

Update institution identity details used by candidates and coordinators.

### Institution Invitation Acceptance

Route: `/institution/accept-invitation`

Target sections:

- Invitation status.
- Password setup form.
- Success state.
- Continue to login.

Page title:

Accept institution invitation

Subtitle:

Set a password to activate the institution account.

Success:

Institution account activated. Continue to login.

Missing token:

Invitation token is missing. Ask the sender to resend the institution invitation.

## 13. Super Admin Portal Content

### Super Admin Dashboard

Route: `/super-admin/dashboard`

Current capability:

System metrics, recent audit table, generate report button.

Target sections:

- System oversight summary.
- Metric cards.
- System health explanation.
- Recent audits.
- Links to institutions and audit logs.

Page header:

Super admin portal

Description:

Monitor system-level activity, institution onboarding, audit events, and operational health.

Unavailable metrics:

Super admin metrics endpoint did not return data. Check backend availability before assuming zero activity.

### Super Admin Institutions

Route: `/super-admin/institutions`

Current capability:

Invite institutions, list counts, show invitation link, copy, resend invitation, disable.

Target sections:

- Institution onboarding summary.
- Counts for total, invited, active, disabled.
- Invite form.
- Latest invitation link.
- Institution accounts table.
- Disable/resend action guidance.

Page header:

Institutions

Description:

Invite institutions, resend onboarding emails, and manage account status.

Disable warning:

Disabling an institution may prevent account access and operational actions. Confirm this action with the responsible authority before proceeding.

### Super Admin Audits

Route: `/super-admin/audits`

Target sections:

- Audit log header.
- Filter/search if implemented.
- Audit table.
- Empty state.
- Refresh action.

Page header:

System audit logs

Description:

Review recent system events captured during platform operations.

Empty state:

No audit events found.

## 14. Expert Portal Content

### Expert Dashboard

Route: `/expert/dashboard`

Current capability:

Review metrics, flagged candidate queue, resolve action.

Target sections:

- Review workload summary.
- Metrics: pending reviews, completed today, flagged issues.
- Review queue.
- Resolve action.
- Empty state.

Page header:

Expert review portal

Description:

Review flagged appeals and resolve exam concerns.

Empty state:

All caught up. No pending reviews.

Resolve helper:

Resolve only after reviewing the available exam context and issue type.

### Expert Profile And Settings

Routes:

- `/expert/profile`
- `/expert/settings`

Content goals:

- Profile identity and photo upload.
- Account details.
- Notification preferences.
- Security copy.

Profile intro:

Keep your expert profile accurate so review actions can be associated with the correct account.

## 15. Transport Authority Portal Content

### Transport Authority Dashboard

Route: `/transport-authority/dashboard`

Current capability:

Regional analytics, licensed drivers, pass rate, active centers, pending violations, compliance alerts.

Target sections:

- Regional authority overview.
- Analytics cards.
- Data unavailable alert.
- Compliance alert table.
- Severity glossary.

Page header:

Regional authority portal

Description:

Monitor regional compliance and performance indicators.

Data unavailable state:

Transport authority analytics endpoint is unavailable. Refresh later or confirm backend access.

Compliance empty state:

No active compliance issues.

Severity glossary:

High:

Requires urgent operational review.

Medium:

Requires follow-up and monitoring.

Low:

Informational or low-risk issue.

## 16. Notifications, Profiles, And Settings Across Roles

### Notifications Page

Target sections:

- Notification list.
- Unread count.
- Mark all as read.
- Individual mark as read.
- Empty state.

Empty state:

No notifications yet. Important account, booking, payment, exam, and review updates will appear here.

### Role Profile Pages

Content pattern:

- Role label.
- Name.
- Email.
- Role.
- Photo upload where supported.
- Account information.
- Security guidance.

Profile helper:

Profile details help ADLTS show the correct identity and contact information across role-based workflows.

### Settings Pages

Content pattern:

- Language.
- Notifications.
- Theme if supported.
- Save action.
- Success/error feedback.

Settings helper:

Choose the preferences that make daily ADLTS work easier to follow.

## 17. Empty, Loading, And Error State Library

Use honest state copy. Do not show fake success when backend data is unavailable.

### Loading

General:

Loading latest data...

Bookings:

Loading your booking history...

Institutions:

Loading active institutions...

Devices:

Loading device status...

Exams:

Loading exam history...

Audits:

Loading audit events...

### Empty States

No bookings:

No bookings yet. Submitted requests will appear here.

No active booking:

No active booking. Submit a booking request to begin your testing journey.

No institutions:

No active institutions found. Try again later or contact support.

No payments:

No payment history for this booking yet.

No exams:

No exam results yet. Results appear here after your test is complete and published.

No devices:

No devices found. Registered devices will appear here after backend data is available.

No active exams:

No active exams are currently running.

No candidates:

No candidates found for this search.

No invitations:

No invitations found.

No audits:

No audit events found.

No compliance alerts:

No active compliance issues.

No reviews:

All caught up. No pending reviews.

### Error States

General:

Unable to load this data right now. Refresh the page or contact support if the issue continues.

Session required:

This view requires a valid backend session. Login again to continue.

Role mismatch:

Your account role does not have access to this portal.

Booking submit failed:

Unable to submit booking request. Review the form and try again.

Booking status blocked:

Only pending bookings can be approved or rejected.

Payment failed:

Payment could not be completed. Retry payment or contact support with your booking reference.

Report unavailable:

Report generation is not available for this test ID right now.

Invitation failed:

Unable to send invitation. Check the email address and role, then try again.

Backend unavailable:

The connected backend did not return data for this page.

## 18. Footer Content

The current public footer already has useful groups. Expand it with concise descriptions.

### Footer Brand Block

ADLTS

Automated Driving License Testing System. Official digital workflow for candidate registration, booking, institution review, payment, examination, results, and oversight.

### Footer Candidates

- Register
- Book a test
- View results
- Candidate guidelines

### Footer Institutions

- Institute login
- Admin login
- Request access
- Review guidelines

### Footer Oversight

- Expert review
- Transport authority
- Super admin
- Compliance support

### Footer Resources

- About ADLTS
- Guidelines
- Privacy and security
- Contact support

## 19. Page Inventory And Expansion Targets

| Route | Current Content Level | Expansion Target |
| --- | --- | --- |
| `/` | Short hero and feature cards | Full landing page with lifecycle, roles, trust, FAQ, CTA |
| `/about` | Short mission and values | Mission, stakeholders, workflow, operating principles, modernization outcomes |
| `/guidelines` | Short overview and FAQ | Complete candidate and institution operating guide |
| `/contact` | Contact cards | Support routing, issue categories, form guidance, urgent issue rules |
| `/privacy-policy` | Short explainer | Full privacy and role-based data handling explainer |
| `/login` | Auth card only | Auth card plus role routing and security context |
| `/forgot-password` | Auth card | Reset guidance and support fallback |
| `/reset-password` | Auth card | Stronger password guidance and token states |
| `/candidate/register` | Form and OTP | Registration guide, requirements, next steps |
| `/candidate/dashboard` | Useful but compact | Journey overview, status education, next action, richer guidance |
| `/candidate/booking` | Functional | Long booking workflow, status copy, help panels, history |
| `/candidate/payments` | Functional | Payment education, state explanations, history |
| `/candidate/exams` | Functional | Result education, metrics, visibility explanation |
| `/admin/devices` | Dashboard | Operational guidance and stronger states |
| `/admin/active-exams` | Dashboard | Monitoring context and status glossary |
| `/admin/candidates` | Table | Candidate governance context |
| `/admin/invitations` | Form/table | Role onboarding guidance |
| `/admin/reports` | Report action | Report state and backend availability guidance |
| `/institute/dashboard` | Dashboard | Review rules, enrollment queue context |
| `/institute/requests` | Table/filter | Full request management workflow |
| `/institute/profile` | Profile form | Institution identity and security context |
| `/super-admin/dashboard` | Metrics/audits | System governance overview |
| `/super-admin/institutions` | Invite/manage | Onboarding lifecycle content |
| `/super-admin/audits` | Table | Audit explanation and empty states |
| `/expert/dashboard` | Review queue | Review process, resolution guidance |
| `/transport-authority/dashboard` | Analytics/alerts | Compliance context and severity education |

## 20. Redesign Agent Instructions

Give this section to UI agents with the design inspiration file.

### Content Rules

- Expand page depth using the sections in this document.
- Preserve existing routes and role destinations.
- Keep current service calls and backend contracts unchanged.
- Do not invent dashboard records or numbers.
- For public marketing sections, use static explanatory copy from this document.
- For portal metrics, only render numbers from service data.
- If data is missing, show unavailable, empty, loading, or error states.
- Keep all status explanations near the status UI.
- Make next actions obvious.
- Keep copy concise inside tables and dense dashboards.
- Use longer prose only in public pages, guides, help panels, and empty states.

### Layout Rules

- Public pages should be long and sectioned.
- Portal pages should be dense, scan-friendly, and operational.
- Avoid nested cards.
- Use full-width bands or unframed sections for public storytelling.
- Use cards for repeated items, metrics, modals, and framed tools.
- Use timelines for lifecycle content.
- Use accordions for FAQ and guidelines.
- Use tables for operational queues.
- Use status badges for lifecycle and severity states.
- Use side panels for help content when a workflow is form-heavy.

### Data Safety Rules

Do not write:

- "12,000 candidates registered" unless the backend provides it.
- "99.9 percent uptime" unless there is a verified source.
- "Real-time LIDAR/radar active" as a live claim unless connected data supports it.
- "Payment successful" unless the payment status is succeeded.
- "Report ready" unless the report endpoint returns a report.

Safer alternatives:

- "Track registered candidates from the connected backend."
- "Monitor active devices when data is available."
- "Review telemetry and exam indicators where supported by the testing setup."
- "Payment becomes available after approval."
- "Report generation is available when the backend returns a report."

### Suggested Redesign Phases

Phase 1:

Expand public pages: landing, about, guidelines, contact, privacy.

Phase 2:

Improve auth and candidate journey pages: registration, dashboard, booking, payments, exams, profile, settings.

Phase 3:

Improve institution and admin operational pages.

Phase 4:

Improve super admin, expert, and transport authority oversight pages.

Phase 5:

Unify empty/loading/error states and i18n keys.

### Required Verification

After redesign work, run:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1 NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK=false npm run build
npm test
git diff --check
```

## 21. Suggested Public Page Section Counts

Landing page:

12 to 14 sections.

About page:

8 to 10 sections.

Guidelines page:

10 to 12 sections.

Contact page:

6 to 8 sections.

Privacy page:

8 to 10 sections.

Candidate registration:

4 to 6 sections including the form.

Portal dashboards:

5 to 8 operational sections, depending on data availability.

## 22. Final Content Direction

ADLTS should feel like a civic operations platform, not a thin marketing site. The landing page should explain the whole testing journey. The public pages should answer common questions before users log in. The portals should help users act quickly after they log in.

The redesign should make the product feel larger because the workflow is larger: registration, booking, review, payment, testing, results, appeals, audits, institution onboarding, and authority oversight all belong to the same story.
