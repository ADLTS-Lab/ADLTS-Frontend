# Booking Lifecycle Smoke Tests

Use this checklist after changes to booking creation, institute moderation, or payment state rendering.

## Preconditions

- Sign in as a candidate.
- Sign in as an institute user.
- Have at least one candidate booking available in the mock store.

## Candidate Creation Rules

- Create a booking while no active booking exists.
  - Expected: request succeeds.
- Try to create a second booking while the latest booking is `Pending`, `Approved`, `Payment Pending`, or `Scheduled`.
  - Expected: request is rejected.
- Cancel or complete the active booking, then create a new one.
  - Expected: request succeeds.

## Institution Moderation Rules

- Approve a `Pending` booking.
  - Expected: request succeeds and the booking moves to `Approved`.
- Reject a `Pending` booking.
  - Expected: request succeeds and the booking moves to `Rejected`.
- Attempt to approve or reject a booking that is already `Rejected`, `Cancelled`, `Completed`, or `Expired`.
  - Expected: request is rejected.

## UI Consistency Checks

- Candidate dashboard.
  - Expected: only one booking state is shown at a time.
- Candidate booking page.
  - Expected: active booking blocks new booking creation.
- Candidate payment page.
  - Expected: state labels do not conflict, and completed payments are not shown as requiring payment.
- Institution requests page.
  - Expected: only pending rows expose approve/reject actions.

## Postman Mapping

- `Bookings -> Create Booking`
- `Bookings -> Verify Booking (Approve)`
- `Bookings -> Verify Booking (Reject)`
- `Bookings -> Schedule Booking`
- `Payments -> Initiate Payment`
- `Payments -> Retry Payment`
- `Payments -> Get Payments for Booking`

For invalid transition checks, reuse the verify request with a booking that is already in a terminal state and confirm the API returns a validation error.
