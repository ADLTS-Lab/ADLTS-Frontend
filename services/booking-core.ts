import api from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { extractApiError, shouldUseLocalFallback } from './api-utils';

export type BookingStatus = 'Pending' | 'Approved' | 'Payment Pending' | 'Scheduled' | 'Rejected' | 'Cancelled' | 'Completed' | 'Expired';

export const ACTIVE_BOOKING_STATUSES = ['Pending', 'Approved', 'Payment Pending', 'Scheduled'] as const;
export const TERMINAL_BOOKING_STATUSES = ['Rejected', 'Cancelled', 'Completed', 'Expired'] as const;

export function isTerminalBookingStatus(status?: BookingStatus | null): boolean {
  return !!status && TERMINAL_BOOKING_STATUSES.includes(status as (typeof TERMINAL_BOOKING_STATUSES)[number]);
}

export function canTransitionBookingStatus(currentStatus?: BookingStatus | null, nextStatus?: BookingStatus | null): boolean {
  return currentStatus === 'Pending' && (nextStatus === 'Approved' || nextStatus === 'Rejected');
}

export function canCancelBookingStatus(currentStatus?: BookingStatus | null): boolean {
  return currentStatus === 'Pending' || currentStatus === 'Approved';
}

export function getBookingTransitionBlockMessage(currentStatus?: BookingStatus | null, nextStatus?: BookingStatus | null): string {
  if (!currentStatus) {
    return 'Only pending bookings can be approved or rejected.';
  }

  if (canTransitionBookingStatus(currentStatus, nextStatus)) {
    return '';
  }

  if (isTerminalBookingStatus(currentStatus)) {
    return `A ${currentStatus.toLowerCase()} booking cannot be changed.`;
  }

  return 'Only pending bookings can be approved or rejected.';
}

export function isActiveBookingStatus(status?: BookingStatus | null): boolean {
  return !!status && ACTIVE_BOOKING_STATUSES.includes(status as (typeof ACTIVE_BOOKING_STATUSES)[number]);
}

export function getBookingBlockMessage(status?: BookingStatus | null): string {
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
      return 'You already have an active booking. You can book again only after it is Rejected, Cancelled, or Completed.';
  }
}

export type LicenseCategory = 'A' | 'B' | 'C' | 'D';

export type BookingInstitution = {
  id: string;
  name: string;
  aliases?: string[];
};

export const MOCK_BOOKING_INSTITUTIONS: BookingInstitution[] = [
  { id: 'kality-driving-school', name: 'Kality Driving School' },
  { id: 'adey-ababa-driving-center', name: 'Adey Ababa Driving Center' },
  { id: 'bole-driving-institute', name: 'Bole Driving Institute' },
  { id: 'lideta-driving-school', name: 'Lideta Driving School' },
  { id: 'yeka-driving-academy', name: 'Yeka Driving Academy' },
  { id: 'nifas-silk-driving-center', name: 'Nifas Silk Driving Center' },
  { id: 'aau-driving-school', name: 'AAU Driving School' },
];

export type BookingCandidateDetails = {
  candidateId?: string;
  name: string;
  email: string;
  phone?: string;
  fayidaId?: string;
  gender?: string;
};

export interface BookingRequest {
  id: string;
  institutionId: string;
  institution: string;
  institutionName: string;
  candidateId?: string;
  licenseCategory: LicenseCategory;
  bloodType: string;
  preferredDate: string;
  preferredSession: string;
  additionalNotes?: string;
  candidateDetails?: BookingCandidateDetails;
  status: BookingStatus;
  createdAt: string;
  updatedAt: string;
}

export interface BookingSubmission {
  institutionId: string;
  institutionName?: string;
  licenseCategory: LicenseCategory;
  bloodType: string;
  preferredDate: string;
  preferredSession: string;
  additionalNotes?: string;
  candidateDetails?: BookingCandidateDetails;
}

export interface BookingQueryParams {
  institutionId?: string;
  search?: string;
  status?: BookingStatus;
  licenseCategory?: LicenseCategory;
  page?: number;
  pageSize?: number;
}

export interface BookingPageResult {
  items: BookingRequest[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

const BOOKING_STORAGE_KEY = 'adlts-booking-requests';
const LEGACY_BOOKING_STORAGE_KEY = 'adlts-candidate-bookings';
const ALLOW_LOCAL_FALLBACK =
  typeof process !== 'undefined' ? process.env.NEXT_PUBLIC_ALLOW_LOCAL_FALLBACK !== 'false' : true;

const BOOKING_INSTITUTION_LOOKUP = new Map(MOCK_BOOKING_INSTITUTIONS.map((institution) => [institution.id, institution]));
const bookingListeners = new Set<() => void>();

let storageListenerAttached = false;

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getInstitutionNameById(institutionId: string): string {
  return BOOKING_INSTITUTION_LOOKUP.get(institutionId)?.name ?? institutionId;
}

function resolveInstitutionDetails(input: string | undefined): BookingInstitution {
  const normalized = String(input || '').trim();
  const matchedById = BOOKING_INSTITUTION_LOOKUP.get(normalized);
  if (matchedById) return matchedById;

  const matchedByName = MOCK_BOOKING_INSTITUTIONS.find((institution) => {
    const aliases = institution.aliases ?? [];
    return institution.name === normalized || aliases.includes(normalized);
  });

  if (matchedByName) return matchedByName;

  const id = slugify(normalized || 'institution');
  return {
    id,
    name: normalized || getInstitutionNameById(id),
  };
}

function normalizeCandidateDetails(raw: unknown): BookingCandidateDetails | undefined {
  if (!raw || typeof raw !== 'object') return undefined;

  const candidate = raw as Record<string, unknown>;
  const name = typeof candidate.name === 'string' ? candidate.name : '';
  const email = typeof candidate.email === 'string' ? candidate.email : '';

  if (!name && !email) return undefined;

  return {
    candidateId: typeof candidate.candidateId === 'string' ? candidate.candidateId : typeof candidate.candidate_id === 'string' ? candidate.candidate_id : undefined,
    name,
    email,
    phone: typeof candidate.phone === 'string' ? candidate.phone : undefined,
    fayidaId: typeof candidate.fayidaId === 'string' ? candidate.fayidaId : typeof candidate.fayida_id === 'string' ? candidate.fayida_id : undefined,
    gender: typeof candidate.gender === 'string' ? candidate.gender : undefined,
  };
}

function normalizeLicenseCategory(value: unknown): LicenseCategory {
  const category = String(value || '').trim().toUpperCase();
  return category === 'A' || category === 'B' || category === 'C' || category === 'D' ? category : 'B';
}

function normalizeBooking(raw: unknown): BookingRequest | null {
  if (!raw || typeof raw !== 'object') return null;

  const data = raw as Record<string, unknown>;
  const rawInstitution =
    typeof data.institutionName === 'string'
      ? data.institutionName
      : typeof data.institution === 'string'
        ? data.institution
        : typeof data.institution_id === 'string'
          ? data.institution_id
          : typeof data.institute_id === 'string'
            ? data.institute_id
            : '';

  const institutionDetails = resolveInstitutionDetails(rawInstitution);
  const institutionId =
    typeof data.institutionId === 'string'
      ? data.institutionId
      : typeof data.institution_id === 'string'
        ? data.institution_id
        : typeof data.institute_id === 'string'
          ? data.institute_id
          : institutionDetails.id;

  const statusValue = typeof data.status === 'string' ? data.status : 'Pending';
  const status: BookingStatus =
    statusValue === 'Approved' ||
    statusValue === 'Payment Pending' ||
    statusValue === 'Scheduled' ||
    statusValue === 'Rejected' ||
    statusValue === 'Cancelled' ||
    statusValue === 'Completed' ||
    statusValue === 'Expired'
      ? statusValue
      : 'Pending';
  const createdAt =
    typeof data.createdAt === 'string'
      ? data.createdAt
      : typeof data.created_at === 'string'
        ? data.created_at
        : new Date().toISOString();
  const updatedAt =
    typeof data.updatedAt === 'string'
      ? data.updatedAt
      : typeof data.updated_at === 'string'
        ? data.updated_at
        : createdAt;

  return {
    id: typeof data.id === 'string' ? data.id : `booking-${Date.now()}`,
    institutionId,
    institution: institutionDetails.name,
    institutionName: institutionDetails.name,
    candidateId:
      typeof data.candidateId === 'string'
        ? data.candidateId
        : typeof data.candidate_id === 'string'
          ? data.candidate_id
          : typeof data.candidateDetails === 'object' && data.candidateDetails && typeof (data.candidateDetails as Record<string, unknown>).candidateId === 'string'
            ? String((data.candidateDetails as Record<string, unknown>).candidateId)
            : typeof data.candidate_details === 'object' && data.candidate_details && typeof (data.candidate_details as Record<string, unknown>).candidateId === 'string'
              ? String((data.candidate_details as Record<string, unknown>).candidateId)
              : undefined,
    licenseCategory: normalizeLicenseCategory(data.licenseCategory || data.license_category),
    bloodType: typeof data.bloodType === 'string' ? data.bloodType : typeof data.blood_type === 'string' ? data.blood_type : '',
    preferredDate:
      typeof data.preferredDate === 'string'
        ? data.preferredDate
        : typeof data.preferred_exam_date === 'string'
          ? data.preferred_exam_date
          : '',
    preferredSession:
      typeof data.preferredSession === 'string'
        ? data.preferredSession
        : typeof data.preferred_session === 'string'
          ? data.preferred_session
          : '',
    additionalNotes:
      typeof data.additionalNotes === 'string'
        ? data.additionalNotes
        : typeof data.additional_notes === 'string'
          ? data.additional_notes
          : undefined,
    candidateDetails: normalizeCandidateDetails(data.candidateDetails ?? data.candidate_details),
    status,
    createdAt,
    updatedAt,
  };
}

function normalizeBookingCollection(value: unknown): BookingRequest[] {
  const collection = Array.isArray(value)
    ? value
    : Array.isArray((value as { data?: unknown } | null)?.data)
      ? ((value as { data: unknown[] }).data)
      : Array.isArray((value as { bookings?: unknown } | null)?.bookings)
        ? ((value as { bookings: unknown[] }).bookings)
        : Array.isArray((value as { items?: unknown } | null)?.items)
          ? ((value as { items: unknown[] }).items)
          : [];

  return collection.map(normalizeBooking).filter((booking): booking is BookingRequest => !!booking);
}

function sortBookings(bookings: BookingRequest[]): BookingRequest[] {
  return [...bookings].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function ensureStorageListener() {
  if (typeof window === 'undefined' || storageListenerAttached) return;

  window.addEventListener('storage', (event) => {
    if (event.key === BOOKING_STORAGE_KEY) {
      bookingListeners.forEach((listener) => listener());
    }
  });

  storageListenerAttached = true;
}

function emitBookingStoreChange() {
  bookingListeners.forEach((listener) => listener());
}

function readStoredBookings(): BookingRequest[] {
  if (typeof window === 'undefined') return [];

  ensureStorageListener();

  try {
    const raw = localStorage.getItem(BOOKING_STORAGE_KEY) ?? localStorage.getItem(LEGACY_BOOKING_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const normalizedBookings = sortBookings(parsed.map(normalizeBooking).filter((booking): booking is BookingRequest => !!booking));
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(normalizedBookings));
      return normalizedBookings;
    }

    return [];
  } catch {
    return [];
  }
}

function writeStoredBookings(bookings: BookingRequest[]): BookingRequest[] {
  const sortedBookings = sortBookings(bookings);

  if (typeof window !== 'undefined') {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(sortedBookings));
  }

  emitBookingStoreChange();
  return sortedBookings;
}

function matchesInstitution(booking: BookingRequest, institutionId?: string): boolean {
  if (!institutionId) return true;

  const normalizedInstitutionId = slugify(institutionId);
  return slugify(booking.institutionId) === normalizedInstitutionId || slugify(booking.institutionName) === normalizedInstitutionId;
}

function matchesSearch(booking: BookingRequest, search?: string): boolean {
  const normalizedSearch = String(search || '').trim().toLowerCase();
  if (!normalizedSearch) return true;

  const haystack = [
    booking.candidateDetails?.name,
    booking.candidateDetails?.email,
    booking.candidateDetails?.phone,
    booking.institution,
    booking.institutionName,
    booking.licenseCategory,
    booking.status,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();

  return haystack.includes(normalizedSearch);
}

function bookingMatchesFilters(booking: BookingRequest, query: BookingQueryParams): boolean {
  return (
    matchesInstitution(booking, query.institutionId) &&
    matchesSearch(booking, query.search) &&
    (!query.status || booking.status === query.status) &&
    (!query.licenseCategory || booking.licenseCategory === query.licenseCategory)
  );
}

function paginateBookings(bookings: BookingRequest[], page = 1, pageSize = 10): BookingPageResult {
  const safePageSize = Math.max(1, pageSize || 10);
  const total = bookings.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
  const safePage = Math.min(Math.max(1, page || 1), totalPages);
  const start = (safePage - 1) * safePageSize;

  return {
    items: bookings.slice(start, start + safePageSize),
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPreviousPage: safePage > 1,
  };
}

function backendParams(query: BookingQueryParams): Record<string, string | number> {
  const params: Record<string, string | number> = {};

  if (query.institutionId) {
    params.institute_id = query.institutionId;
    params.institution_id = query.institutionId;
  }

  if (query.search) params.search = query.search;
  if (query.status) params.status = query.status;
  if (query.licenseCategory) params.license_category = query.licenseCategory;
  if (query.page) params.page = query.page;
  if (query.pageSize) {
    params.limit = query.pageSize;
    params.page_size = query.pageSize;
  }

  return params;
}

function buildBackendSubmissionPayload(submission: BookingSubmission) {
  return {
    institute_id: submission.institutionId,
    institution_id: submission.institutionId,
    institution_name: submission.institutionName,
    candidate_id: submission.candidateDetails?.candidateId,
    license_category: submission.licenseCategory,
    bloodType: submission.bloodType,
    blood_type: submission.bloodType,
    preferred_exam_date: submission.preferredDate,
    preferred_session: submission.preferredSession,
    additional_notes: submission.additionalNotes,
    candidate_details: submission.candidateDetails,
    candidate_name: submission.candidateDetails?.name,
    candidate_email: submission.candidateDetails?.email,
    candidate_phone: submission.candidateDetails?.phone,
  };
}

function buildLocalBooking(submission: BookingSubmission): BookingRequest {
  const institutionDetails = resolveInstitutionDetails(submission.institutionName || submission.institutionId);
  const now = new Date().toISOString();

  return {
    id: `booking-${Date.now()}`,
    institutionId: submission.institutionId || institutionDetails.id,
    institution: institutionDetails.name,
    institutionName: institutionDetails.name,
    candidateId: submission.candidateDetails?.candidateId,
    licenseCategory: submission.licenseCategory,
    bloodType: submission.bloodType,
    preferredDate: submission.preferredDate,
    preferredSession: submission.preferredSession,
    additionalNotes: submission.additionalNotes,
    candidateDetails: submission.candidateDetails,
    status: 'Pending',
    createdAt: now,
    updatedAt: now,
  };
}

function getSubmissionCandidateEmail(submission: BookingSubmission): string {
  const submissionEmail = String(submission.candidateDetails?.email || '').trim().toLowerCase();
  if (submissionEmail) return submissionEmail;

  return String(useAuthStore.getState().user?.email || '').trim().toLowerCase();
}

function getDefaultMockBookings(): BookingRequest[] {
  const now = Date.now();
  return [
    {
      id: 'mock-booking-1',
      institutionId: 'bole-driving-institute',
      institution: 'Bole Driving Institute',
      institutionName: 'Bole Driving Institute',
      licenseCategory: 'B',
      bloodType: 'O+',
      preferredDate: new Date(now + 1000 * 60 * 60 * 24 * 3).toISOString().slice(0, 10),
      preferredSession: 'Morning',
      candidateDetails: { name: 'Abebe Kebede', email: 'abebe@example.com', phone: '+251911223344' },
      status: 'Pending',
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: 'mock-booking-2',
      institutionId: 'bole-driving-institute',
      institution: 'Bole Driving Institute',
      institutionName: 'Bole Driving Institute',
      licenseCategory: 'C',
      bloodType: 'A+',
      preferredDate: new Date(now + 1000 * 60 * 60 * 24 * 7).toISOString().slice(0, 10),
      preferredSession: 'Afternoon',
      candidateDetails: { name: 'Sara Tadesse', email: 'sara@example.com', phone: '+251922334455' },
      status: 'Approved',
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: 'mock-booking-3',
      institutionId: 'kality-driving-school',
      institution: 'Kality Driving School',
      institutionName: 'Kality Driving School',
      licenseCategory: 'A',
      bloodType: 'B+',
      preferredDate: new Date(now + 1000 * 60 * 60 * 24 * 5).toISOString().slice(0, 10),
      preferredSession: 'Morning',
      candidateDetails: { name: 'Daniel Haile', email: 'daniel@example.com' },
      status: 'Pending',
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    },
  ];
}

function readBookingsWithMockFallback(): BookingRequest[] {
  const stored = readStoredBookings();
  return stored.length > 0 ? stored : getDefaultMockBookings();
}

export function findBookingById(id: string): BookingRequest | null {
  const stored = readStoredBookings().find((booking) => booking.id === id);
  if (stored) return stored;
  return getDefaultMockBookings().find((booking) => booking.id === id) ?? null;
}

export function bookingBelongsToInstitution(booking: BookingRequest, institutionId?: string): boolean {
  return matchesInstitution(booking, institutionId);
}

function updateLocalBookingStatus(id: string, status: BookingStatus): BookingRequest | null {
  const bookings = readStoredBookings();
  const index = bookings.findIndex((bookingItem) => bookingItem.id === id);
  if (index === -1) return null;

  const currentStatus = bookings[index].status;
  if (!canTransitionBookingStatus(currentStatus, status) && !(status === 'Cancelled' && canCancelBookingStatus(currentStatus))) {
    return null;
  }

  bookings[index] = {
    ...bookings[index],
    status,
    updatedAt: new Date().toISOString(),
  };

  writeStoredBookings(bookings);
  return bookings[index];
}

async function loadBookingsFromApi(query: BookingQueryParams): Promise<BookingRequest[]> {
  const response = await api.get('/bookings', { params: backendParams(query) });
  return normalizeBookingCollection(response.data);
}

export function subscribeToBookingChanges(listener: () => void): () => void {
  ensureStorageListener();
  bookingListeners.add(listener);

  return () => {
    bookingListeners.delete(listener);
  };
}

export async function getBookingPage(query: BookingQueryParams = {}): Promise<BookingPageResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;

  try {
    const bookings = await loadBookingsFromApi(query);
    return paginateBookings(sortBookings(bookings).filter((booking) => bookingMatchesFilters(booking, query)), page, pageSize);
  } catch (error) {
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const bookings = readStoredBookings().filter((booking) => bookingMatchesFilters(booking, query));
      return paginateBookings(bookings, page, pageSize);
    }

    const bookings = readBookingsWithMockFallback().filter((booking) => bookingMatchesFilters(booking, query));
    return paginateBookings(bookings, page, pageSize);
  }
}

export async function getAllBookings(institutionFilter?: string): Promise<BookingRequest[]> {
  const result = await getBookingPage({ institutionId: institutionFilter, page: 1, pageSize: 1000 });
  return result.items;
}

export async function submitBookingRequest(submission: BookingSubmission): Promise<BookingRequest> {
  const candidateEmail = getSubmissionCandidateEmail(submission);
  let blockedMessage: string | null = null;

  if (candidateEmail) {
    try {
      const existingBookings = await getAllBookings();
      const activeBooking = existingBookings.find(
        (booking) => booking.candidateDetails?.email?.toLowerCase() === candidateEmail && isActiveBookingStatus(booking.status),
      );

      if (activeBooking) {
        blockedMessage = getBookingBlockMessage(activeBooking.status);
      }
    } catch {
      // Ignore validation lookup failures and fall through to the API request.
    }
  }

  if (blockedMessage) {
    throw new Error(blockedMessage);
  }

  try {
    const response = await api.post('/bookings', buildBackendSubmissionPayload(submission));
    const booking = normalizeBooking(response.data?.data ?? response.data?.booking ?? response.data);
    if (booking) return booking;

    return buildLocalBooking(submission);
  } catch (error) {
    const responseStatus = (error as { response?: { status?: number } } | undefined)?.response?.status;

    // If the server explicitly rejected the request (authentication/authorization),
    // surface the error to the user instead of creating local client state.
    if (responseStatus === 401 || responseStatus === 403 || responseStatus === 409) {
      throw new Error(extractApiError(error, 'Failed to submit booking request.'));
    }

    // Only allow local fallback for network/unavailable/endpoint-missing errors
    // (404/405 or network errors) — `shouldUseLocalFallback` encodes this policy.
    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const bookings = readStoredBookings();
      const booking = buildLocalBooking(submission);
      bookings.push(booking);
      writeStoredBookings(bookings);
      return booking;
    }

    throw new Error(extractApiError(error, 'Failed to submit booking request.'));
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingRequest | null> {
  const currentBooking = findBookingById(id);
  if (currentBooking && !canTransitionBookingStatus(currentBooking.status, status)) {
    throw new Error(getBookingTransitionBlockMessage(currentBooking.status, status));
  }

  try {
    const payload = { action: status === 'Approved' ? 'approve' : 'reject' };
    const response = await api.patch(`/bookings/${id}/verify`, payload);
    const booking = normalizeBooking(response.data?.data ?? response.data?.booking ?? response.data);
    if (booking) return booking;

    // If server responded but did not return a booking object, do not silently
    // mutate local client state when the response indicates an auth/permission
    // problem. Only perform local fallback for network/unavailable-type errors
    // (handled in catch below).
    const respStatus = (response && typeof response.status === 'number') ? response.status : undefined;
    if (respStatus === 401 || respStatus === 403) {
      throw new Error('Failed to update booking status.');
    }

    // Otherwise, cautiously update local cached booking if present.
    const stored = readStoredBookings();
    const index = stored.findIndex((bookingItem) => bookingItem.id === id);
    if (index === -1) return null;

    stored[index] = {
      ...stored[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    writeStoredBookings(stored);
    return stored[index];
  } catch (error) {
    const responseStatus = (error as { response?: { status?: number } } | undefined)?.response?.status;

    // If the error is an explicit auth/permission rejection, do not update local state.
    if (responseStatus === 401 || responseStatus === 403) {
      throw new Error(extractApiError(error, 'Failed to update booking status.'));
    }

    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      return updateLocalBookingStatus(id, status);
    }

    throw new Error(extractApiError(error, 'Failed to update booking status.'));
  }
}

export async function cancelBookingRequest(id: string): Promise<BookingRequest | null> {
  const currentBooking = findBookingById(id);
  if (currentBooking && !canCancelBookingStatus(currentBooking.status)) {
    throw new Error(`A ${currentBooking.status.toLowerCase()} booking cannot be canceled.`);
  }

  try {
    const response = await api.patch(`/bookings/${id}/cancel`);
    const booking = normalizeBooking(response.data?.data ?? response.data?.booking ?? response.data);
    if (booking) return booking;

    const stored = readStoredBookings();
    const index = stored.findIndex((bookingItem) => bookingItem.id === id);
    if (index === -1) return null;

    stored[index] = {
      ...stored[index],
      status: 'Cancelled',
      updatedAt: new Date().toISOString(),
    };

    writeStoredBookings(stored);
    return stored[index];
  } catch (error) {
    const responseStatus = (error as { response?: { status?: number } } | undefined)?.response?.status;

    if (responseStatus === 401 || responseStatus === 403) {
      throw new Error(extractApiError(error, 'Failed to cancel booking request.'));
    }

    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      return updateLocalBookingStatus(id, 'Cancelled');
    }

    throw new Error(extractApiError(error, 'Failed to cancel booking request.'));
  }
}

export async function deleteBookingRequest(id: string): Promise<boolean> {
  try {
    await api.delete(`/bookings/${id}`);
    return true;
  } catch (error) {
    const responseStatus = (error as { response?: { status?: number } } | undefined)?.response?.status;

    if (responseStatus === 401 || responseStatus === 403) {
      throw new Error(extractApiError(error, 'Failed to delete booking request.'));
    }

    if (ALLOW_LOCAL_FALLBACK && shouldUseLocalFallback(error)) {
      const stored = readStoredBookings().filter((booking) => booking.id !== id);
      writeStoredBookings(stored);
      return true;
    }

    throw new Error(extractApiError(error, 'Failed to delete booking request.'));
  }
}

export function getStoredBookingSnapshot(): BookingRequest[] {
  return readStoredBookings();
}