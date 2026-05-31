import { randomUUID } from 'crypto';

import type { NextRequest } from 'next/server';

import type { MockUser } from './_mock-auth';

export type MockBookingStatus = 'Pending' | 'Approved' | 'Payment Pending' | 'Scheduled' | 'Rejected' | 'Cancelled' | 'Completed' | 'Expired';

const ACTIVE_BOOKING_STATUSES = new Set<MockBookingStatus>(['Pending', 'Approved', 'Payment Pending', 'Scheduled']);
const TERMINAL_BOOKING_STATUSES = new Set<MockBookingStatus>(['Rejected', 'Cancelled', 'Completed', 'Expired']);

function isActiveBookingStatus(status: MockBookingStatus): boolean {
  return ACTIVE_BOOKING_STATUSES.has(status);
}

function canTransitionBookingStatus(currentStatus: MockBookingStatus, nextStatus: MockBookingStatus): boolean {
  return currentStatus === 'Pending' && (nextStatus === 'Approved' || nextStatus === 'Rejected');
}

function canCancelBookingStatus(currentStatus: MockBookingStatus): boolean {
  return currentStatus === 'Pending' || currentStatus === 'Approved';
}

function getBookingBlockMessage(status?: MockBookingStatus): string {
  switch (status) {
    case 'Pending':
      return 'You already have a pending booking. Cancel it first before creating a new one.';
    case 'Approved':
      return 'You already have an approved booking. Finish the current workflow before booking again.';
    case 'Payment Pending':
      return 'You already have a booking that is waiting for payment. Complete that payment before booking again.';
    case 'Scheduled':
      return 'You already have a scheduled booking. You can book again once it is completed.';
    default:
      return 'You already have an active booking. You can book again only after it is Rejected, Cancelled, Completed, or Expired.';
  }
}

export type MockBooking = {
  id: string;
  institutionId: string;
  institutionName: string;
  licenseCategory: 'A' | 'B' | 'C' | 'D';
  bloodType: string;
  preferredDate: string;
  preferredSession: string;
  additionalNotes?: string;
  candidateDetails?: {
    name: string;
    email: string;
    phone?: string;
    fayidaId?: string;
    gender?: string;
  };
  status: MockBookingStatus;
  createdAt: string;
  updatedAt: string;
};

type MockBookingState = {
  bookings: Map<string, MockBooking>;
};

declare global {
  var __adltsMockBookingState: MockBookingState | undefined;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function seedBookings(): MockBooking[] {
  const now = Date.now();
  return [
    // Bole Driving Institute bookings
    {
      id: 'mock-booking-1',
      institutionId: 'bole-driving-institute',
      institutionName: 'Bole Driving Institute',
      licenseCategory: 'B',
      bloodType: 'O+',
      preferredDate: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10),
      preferredSession: 'Morning',
      candidateDetails: { name: 'Abebe Tesfaye', email: 'abebe.tesfaye@example.com', phone: '+251912345678' },
      status: 'Pending',
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'mock-booking-2',
      institutionId: 'bole-driving-institute',
      institutionName: 'Bole Driving Institute',
      licenseCategory: 'B',
      bloodType: 'A+',
      preferredDate: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      preferredSession: 'Afternoon',
      candidateDetails: { name: 'Marta Girma', email: 'marta@example.com', phone: '+251913456789' },
      status: 'Approved',
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'mock-booking-3',
      institutionId: 'bole-driving-institute',
      institutionName: 'Bole Driving Institute',
      licenseCategory: 'C',
      bloodType: 'B-',
      preferredDate: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
      preferredSession: 'Morning',
      candidateDetails: { name: 'John Smith', email: 'john@example.com', phone: '+251914567890' },
      status: 'Pending',
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    },
    // AAU Driving School bookings
    {
      id: 'mock-booking-4',
      institutionId: 'aau-driving-school',
      institutionName: 'AAU Driving School',
      licenseCategory: 'B',
      bloodType: 'AB+',
      preferredDate: new Date(now + 1000 * 60 * 60 * 24 * 4).toISOString().slice(0, 10),
      preferredSession: 'Morning',
      candidateDetails: { name: 'Kebebew Assefa', email: 'kebebew@example.com', phone: '+251915678901' },
      status: 'Pending',
      createdAt: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
    },
    // Kality Driving School bookings
    {
      id: 'mock-booking-5',
      institutionId: 'kality-driving-school',
      institutionName: 'Kality Driving School',
      licenseCategory: 'A',
      bloodType: 'O-',
      preferredDate: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
      preferredSession: 'Morning',
      candidateDetails: { name: 'Liya Getnet', email: 'liya@example.com', phone: '+251916789012' },
      status: 'Pending',
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    },
  ];
}

const state: MockBookingState = globalThis.__adltsMockBookingState ?? {
  bookings: new Map<string, MockBooking>(seedBookings().map((booking) => [booking.id, booking])),
};

globalThis.__adltsMockBookingState = state;

function institutionIdForUser(user: MockUser): string | undefined {
  return (
    user.institutionId ||
    (user.institutionName ? slugify(user.institutionName) : undefined) ||
    (user.name ? slugify(user.name) : undefined)
  );
}

function bookingMatchesInstitution(booking: MockBooking, institutionFilter?: string): boolean {
  if (!institutionFilter) return true;
  const normalized = slugify(institutionFilter);
  return (
    slugify(booking.institutionId) === normalized || slugify(booking.institutionName) === normalized
  );
}

function userCanAccessBooking(user: MockUser, booking: MockBooking): boolean {
  if (user.role === 'super_admin' || user.role === 'admin') return true;

  if (user.role === 'institute') {
    const institutionId = institutionIdForUser(user);
    return institutionId ? bookingMatchesInstitution(booking, institutionId) : false;
  }

  if (user.role === 'candidate') {
    const email = user.email.toLowerCase();
    return booking.candidateDetails?.email?.toLowerCase() === email;
  }

  return false;
}

function userCanVerifyBooking(user: MockUser, booking: MockBooking): boolean {
  if (user.role === 'super_admin' || user.role === 'admin') return true;

  if (user.role === 'institute') {
    return userCanAccessBooking(user, booking);
  }

  return false;
}

function userCanCancelBooking(user: MockUser, booking: MockBooking): boolean {
  if (user.role === 'super_admin' || user.role === 'admin') return true;

  if (user.role === 'candidate') {
    const email = user.email.toLowerCase();
    return booking.candidateDetails?.email?.toLowerCase() === email;
  }

  return false;
}

function userCanDeleteBooking(user: MockUser, booking: MockBooking): boolean {
  if (user.role === 'super_admin' || user.role === 'admin') return true;

  if (user.role === 'institute') {
    return userCanAccessBooking(user, booking);
  }

  return false;
}

function toApiBooking(booking: MockBooking) {
  return {
    id: booking.id,
    institutionId: booking.institutionId,
    institution_id: booking.institutionId,
    institute_id: booking.institutionId,
    institution: booking.institutionName,
    institutionName: booking.institutionName,
    institution_name: booking.institutionName,
    licenseCategory: booking.licenseCategory,
    license_category: booking.licenseCategory,
    bloodType: booking.bloodType,
    blood_type: booking.bloodType,
    preferredDate: booking.preferredDate,
    preferred_exam_date: booking.preferredDate,
    preferredSession: booking.preferredSession,
    preferred_session: booking.preferredSession,
    additionalNotes: booking.additionalNotes,
    additional_notes: booking.additionalNotes,
    candidateDetails: booking.candidateDetails,
    candidate_details: booking.candidateDetails,
    status: booking.status,
    createdAt: booking.createdAt,
    created_at: booking.createdAt,
    updatedAt: booking.updatedAt,
    updated_at: booking.updatedAt,
  };
}

export type BookingListQuery = {
  institutionId?: string;
  search?: string;
  status?: MockBookingStatus;
  licenseCategory?: MockBooking['licenseCategory'];
  page?: number;
  pageSize?: number;
};

export function listBookings(user: MockUser, query: BookingListQuery = {}) {
  const page = Math.max(1, query.page ?? 1);
  const pageSize = Math.max(1, query.pageSize ?? 10);
  const search = String(query.search || '').trim().toLowerCase();

  let items = Array.from(state.bookings.values()).filter((booking) => userCanAccessBooking(user, booking));

  if (user.role === 'institute') {
    const institutionId = institutionIdForUser(user);
    items = items.filter((booking) => bookingMatchesInstitution(booking, institutionId));
  } else if (query.institutionId) {
    items = items.filter((booking) => bookingMatchesInstitution(booking, query.institutionId));
  }

  if (query.status) {
    items = items.filter((booking) => booking.status === query.status);
  }

  if (query.licenseCategory) {
    items = items.filter((booking) => booking.licenseCategory === query.licenseCategory);
  }

  if (search) {
    items = items.filter((booking) => {
      const haystack = [
        booking.candidateDetails?.name,
        booking.candidateDetails?.email,
        booking.candidateDetails?.phone,
        booking.institutionName,
        booking.licenseCategory,
        booking.status,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(search);
    });
  }

  items.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());

  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * pageSize;

  return {
    items: items.slice(start, start + pageSize).map(toApiBooking),
    page: safePage,
    pageSize,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

export function createBooking(user: MockUser, body: Record<string, unknown>) {
  if (user.role !== 'candidate') {
    return { error: 'Only candidates can submit booking requests.', status: 403 as const };
  }

  const existingActiveBooking = Array.from(state.bookings.values()).find((booking) => {
    if (!isActiveBookingStatus(booking.status)) return false;
    const email = booking.candidateDetails?.email?.toLowerCase();
    return email === user.email.toLowerCase();
  });

  if (existingActiveBooking) {
    return {
      error: getBookingBlockMessage(existingActiveBooking.status),
      status: 409 as const,
    };
  }

  const institutionId = String(body.institute_id ?? body.institution_id ?? body.institutionId ?? '').trim();
  const institutionName = String(body.institution_name ?? body.institutionName ?? institutionId).trim();
  const licenseCategory = String(body.license_category ?? body.licenseCategory ?? 'B').trim().toUpperCase();
  const now = new Date().toISOString();

  const booking: MockBooking = {
    id: `booking-${randomUUID()}`,
    institutionId: institutionId || slugify(institutionName),
    institutionName: institutionName || institutionId,
    licenseCategory: (['A', 'B', 'C', 'D'].includes(licenseCategory) ? licenseCategory : 'B') as MockBooking['licenseCategory'],
    bloodType: String(body.blood_type ?? body.bloodType ?? ''),
    preferredDate: String(body.preferred_exam_date ?? body.preferredDate ?? ''),
    preferredSession: String(body.preferred_session ?? body.preferredSession ?? ''),
    additionalNotes: String(body.additional_notes ?? body.additionalNotes ?? '') || undefined,
    candidateDetails: {
      name: String(body.candidate_name ?? user.first_name ?? user.name ?? 'Candidate'),
      email: user.email,
      phone: String(body.candidate_phone ?? user.phone ?? user.phone_number ?? ''),
    },
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  };

  state.bookings.set(booking.id, booking);
  return { data: toApiBooking(booking) };
}

export function verifyBooking(user: MockUser, bookingId: string, action: string) {
  const booking = state.bookings.get(bookingId);
  if (!booking) {
    return { error: 'Booking not found.', status: 404 as const };
  }

  if (!userCanVerifyBooking(user, booking)) {
    return { error: 'Forbidden.', status: 403 as const };
  }

  const normalizedAction = String(action || '').trim().toLowerCase();
  if (normalizedAction !== 'approve' && normalizedAction !== 'reject') {
    return { error: "Action must be 'approve' or 'reject'.", status: 400 as const };
  }

  const nextStatus: MockBookingStatus = normalizedAction === 'approve' ? 'Approved' : 'Rejected';
  if (!canTransitionBookingStatus(booking.status, nextStatus)) {
    if (TERMINAL_BOOKING_STATUSES.has(booking.status)) {
      return { error: `A ${booking.status.toLowerCase()} booking cannot be changed.`, status: 409 as const };
    }

    return { error: 'Only pending bookings can be approved or rejected.', status: 409 as const };
  }

  const updated: MockBooking = {
    ...booking,
    status: nextStatus,
    updatedAt: new Date().toISOString(),
  };

  state.bookings.set(bookingId, updated);
  return { data: toApiBooking(updated) };
}

export function cancelBooking(user: MockUser, bookingId: string) {
  const booking = state.bookings.get(bookingId);
  if (!booking) {
    return { error: 'Booking not found.', status: 404 as const };
  }

  if (!userCanCancelBooking(user, booking)) {
    return { error: 'Forbidden.', status: 403 as const };
  }

  if (!canCancelBookingStatus(booking.status)) {
    return { error: 'Only pending or approved booking requests can be canceled.', status: 409 as const };
  }

  const updated: MockBooking = {
    ...booking,
    status: 'Cancelled',
    updatedAt: new Date().toISOString(),
  };

  state.bookings.set(bookingId, updated);
  return { data: toApiBooking(updated) };
}

export function deleteBooking(user: MockUser, bookingId: string) {
  const booking = state.bookings.get(bookingId);
  if (!booking) {
    return { error: 'Booking not found.', status: 404 as const };
  }

  if (!userCanDeleteBooking(user, booking)) {
    return { error: 'Forbidden.', status: 403 as const };
  }

  state.bookings.delete(bookingId);
  return { data: toApiBooking(booking) };
}

export function parseBookingListQuery(request: NextRequest): BookingListQuery {
  const { searchParams } = new URL(request.url);
  const page = Number(searchParams.get('page') || 1);
  const pageSize = Number(
    searchParams.get('page_size') || searchParams.get('limit') || searchParams.get('pageSize') || 10,
  );
  const institutionId =
    searchParams.get('institute_id') ||
    searchParams.get('institution_id') ||
    searchParams.get('institutionId') ||
    undefined;
  const status = searchParams.get('status') as MockBookingStatus | null;
  const licenseCategory = searchParams.get('license_category') as MockBooking['licenseCategory'] | null;

  return {
    institutionId: institutionId || undefined,
    search: searchParams.get('search') || undefined,
    status: status && ['Pending', 'Approved', 'Payment Pending', 'Scheduled', 'Rejected', 'Cancelled', 'Completed', 'Expired'].includes(status) ? status : undefined,
    licenseCategory:
      licenseCategory && ['A', 'B', 'C', 'D'].includes(licenseCategory) ? licenseCategory : undefined,
    page: Number.isFinite(page) ? page : 1,
    pageSize: Number.isFinite(pageSize) ? pageSize : 10,
  };
}
