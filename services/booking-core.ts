import api from '@/lib/api';
import { extractApiError } from './api-utils';

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

export interface BookingInstitution {
  id: string;
  name: string;
}

export interface BookingCandidateDetails {
  candidateId?: string;
  name: string;
  email: string;
  phone?: string;
  fayidaId?: string;
  gender?: string;
}

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

interface RawBookingResponse {
  page?: number;
  current_page?: number;
  per_page?: number;
  limit?: number;
  total?: number;
  total_items?: number;
  totalPages?: number;
  total_pages?: number;
  items?: unknown[];
  data?: unknown;
}

const bookingListeners = new Set<() => void>();

let cachedBookings: BookingRequest[] = [];

function extractArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;

  if (value && typeof value === 'object') {
    const record = value as Record<string, unknown>;
    const candidates = [
      record.data,
      record.items,
      record.bookings,
      record.result,
      record.results,
      record.payload,
      record.records,
      record.collection,
      typeof record.data === 'object' && record.data !== null ? (record.data as Record<string, unknown>).items : undefined,
      typeof record.data === 'object' && record.data !== null ? (record.data as Record<string, unknown>).bookings : undefined,
      typeof record.data === 'object' && record.data !== null ? (record.data as Record<string, unknown>).data : undefined,
    ];

    for (const candidate of candidates) {
      if (Array.isArray(candidate)) {
        return candidate;
      }
    }
  }

  return [];
}

function extractMeta(value: unknown): { page: number; pageSize: number; total: number; totalPages: number } {
  const fallback = { page: 1, pageSize: 10, total: 0, totalPages: 1 };
  if (!value || typeof value !== 'object') return fallback;

  const normalized = value as RawBookingResponse & Record<string, unknown>;
  const fromData = typeof normalized.data === 'object' && normalized.data !== null ? (normalized.data as Record<string, unknown>) : null;

  const page = Number(normalized.page ?? fromData?.page ?? normalized.current_page ?? fromData?.current_page ?? 1);
  const pageSize = Number(
    normalized.limit ??
      normalized.per_page ??
      fromData?.limit ??
      fromData?.per_page ??
      fromData?.page_size ??
      10,
  );
  const fromMeta = fromData && typeof fromData === "object" ? Reflect.get(fromData, "meta") : null;
  const metaTotal = typeof fromMeta === "object" && fromMeta !== null && "total" in fromMeta ? (fromMeta as { total?: unknown }).total : undefined;

  const totalCandidate =
    normalized.total ??
    normalized.total_items ??
    fromData?.total ??
    fromData?.total_items ??
    metaTotal ??
    0;
  const providedTotal = Math.max(0, Number(totalCandidate));
  const totalPages = Number(
    normalized.totalPages ??
      normalized.total_pages ??
      fromData?.totalPages ??
      fromData?.total_pages ??
      (providedTotal ? Math.max(1, Math.ceil(providedTotal / (Math.max(1, pageSize)))) : 1),
  );

  return {
    page: Number.isFinite(page) && page > 0 ? page : fallback.page,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : fallback.pageSize,
    total: Number.isFinite(providedTotal) ? providedTotal : fallback.total,
    totalPages: Number.isFinite(totalPages) && totalPages > 0 ? totalPages : fallback.totalPages,
  };
}

function parseStatus(value: unknown): BookingStatus {
  const statusValue = typeof value === 'string' ? value : 'Pending';
  return statusValue === 'Approved' ||
    statusValue === 'Payment Pending' ||
    statusValue === 'Scheduled' ||
    statusValue === 'Rejected' ||
    statusValue === 'Cancelled' ||
    statusValue === 'Completed' ||
    statusValue === 'Expired'
    ? statusValue
    : 'Pending';
}

function normalizeBooking(raw: unknown): BookingRequest | null {
  if (!raw || typeof raw !== 'object') {
    return null;
  }

  const data = raw as Record<string, unknown>;
  const institutionId =
    typeof data.institutionId === 'string'
      ? data.institutionId
      : typeof data.institution_id === 'string'
        ? data.institution_id
        : typeof data.institute_id === 'string'
          ? data.institute_id
          : '';
  const institutionName =
    typeof data.institutionName === 'string'
      ? data.institutionName
      : typeof data.institution === 'string'
        ? data.institution
        : typeof data.institution_name === 'string'
          ? data.institution_name
          : '';

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

  const candidateDetailsRaw = data.candidate_details ?? data.candidateDetails;
  const idRaw = data.id ?? data.booking_id ?? data.bookingId;
  const bookingId = typeof idRaw === 'string' || typeof idRaw === 'number' ? String(idRaw).trim() : '';
  if (!bookingId) {
    return null;
  }

  return {
    id: bookingId,
    institutionId,
    institution: institutionName || String(institutionId || 'Unknown Institute'),
    institutionName: institutionName || String(institutionId || 'Unknown Institute'),
    candidateId:
      typeof data.candidateId === 'string'
        ? data.candidateId
        : typeof data.candidate_id === 'string'
          ? data.candidate_id
          : typeof candidateDetailsRaw === 'object' && candidateDetailsRaw !== null && typeof (candidateDetailsRaw as Record<string, unknown>).candidateId === 'string'
            ? String((candidateDetailsRaw as Record<string, unknown>).candidateId)
            : undefined,
    licenseCategory:
      String(
        typeof data.license_category === 'string'
          ? data.license_category
          : typeof data.licenseCategory === 'string'
            ? data.licenseCategory
            : 'B',
      ).toUpperCase() as LicenseCategory,
    bloodType:
      typeof data.bloodType === 'string'
        ? data.bloodType
        : typeof data.blood_type === 'string'
          ? data.blood_type
          : 'A+',
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
          : 'Morning',
    additionalNotes:
      typeof data.additionalNotes === 'string'
        ? data.additionalNotes
        : typeof data.additional_notes === 'string'
          ? data.additional_notes
          : undefined,
    candidateDetails: normalizeCandidateDetails(candidateDetailsRaw),
    status: parseStatus(data.status),
    createdAt,
    updatedAt,
  };
}

function normalizeCandidateDetails(raw: unknown): BookingCandidateDetails | undefined {
  if (!raw || typeof raw !== 'object') return undefined;

  const candidate = raw as Record<string, unknown>;
  const name = typeof candidate.name === 'string' ? candidate.name : '';
  const email = typeof candidate.email === 'string' ? candidate.email : '';

  if (!name && !email) {
    return undefined;
  }

  return {
    candidateId:
      typeof candidate.candidateId === 'string'
        ? candidate.candidateId
        : typeof candidate.candidate_id === 'string'
          ? candidate.candidate_id
          : undefined,
    name,
    email,
    phone: typeof candidate.phone === 'string' ? candidate.phone : undefined,
    fayidaId:
      typeof candidate.fayidaId === 'string'
        ? candidate.fayidaId
        : typeof candidate.fayida_id === 'string'
          ? candidate.fayida_id
          : undefined,
    gender: typeof candidate.gender === 'string' ? candidate.gender : undefined,
  };
}

function normalizeBookingCollection(value: unknown): BookingRequest[] {
  return extractArray(value)
    .map(normalizeBooking)
    .filter((booking): booking is BookingRequest => booking !== null);
}

function sortBookings(bookings: BookingRequest[]): BookingRequest[] {
  return [...bookings].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
}

function paginateBookings(bookings: BookingRequest[], page = 1, pageSize = 10): BookingPageResult {
  const safePage = Math.max(1, page);
  const safePageSize = Math.max(1, pageSize);
  const total = bookings.length;
  const totalPages = Math.max(1, Math.ceil(total / safePageSize));
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
    params.institution_id = query.institutionId;
  }

  if (query.search) params.search = query.search;
  if (query.status) params.status = query.status;
  if (query.licenseCategory) params.license_category = query.licenseCategory;
  if (query.page) params.page = query.page;
  if (query.pageSize) {
    params.limit = query.pageSize;
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

function normalizeInstitution(raw: unknown): BookingInstitution {
  if (!raw || typeof raw !== 'object') {
    return { id: '', name: '' };
  }

  const data = raw as Record<string, unknown>;

  const id =
    typeof data.id === 'string' ? data.id :
    typeof data.institute_id === 'string' ? data.institute_id :
    typeof data.institution_id === 'string' ? data.institution_id :
    `institution-${Date.now()}`;
  const name =
    typeof data.name === 'string' ? data.name :
    typeof data.institution_name === 'string' ? data.institution_name :
    'Institute';

  return { id, name };
}

function upsertCache(items: BookingRequest[]) {
  const unique = new Map<string, BookingRequest>();
  for (const booking of items) {
    unique.set(booking.id, booking);
  }

  for (const existing of cachedBookings) {
    if (!unique.has(existing.id)) {
      unique.set(existing.id, existing);
    }
  }

  cachedBookings = sortBookings(Array.from(unique.values()));
}

function emitBookingStoreChange() {
  bookingListeners.forEach((listener) => listener());
}

function recordBookings(items: BookingRequest[]) {
  upsertCache(items);
  emitBookingStoreChange();
}

export function notifyBookingChanges() {
  emitBookingStoreChange();
}

function readCachedBookings(): BookingRequest[] {
  return cachedBookings;
}

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getSubmissionCandidateEmail(submission: BookingSubmission): string {
  const submissionEmail = String(submission.candidateDetails?.email || '').trim().toLowerCase();
  return submissionEmail;
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

function parseSingleBooking(raw: unknown): BookingRequest | null {
  if (!raw || typeof raw !== 'object') return null;

  if ('booking' in (raw as Record<string, unknown>)) {
    const nested = (raw as Record<string, unknown>).booking;
    const booking = normalizeBooking(nested);
    if (booking) return booking;
  }

  return normalizeBooking(raw);
}

export async function listActiveInstitutes(page = 1, limit = 20): Promise<BookingInstitution[]> {
  try {
    const response = await api.get('/institutes/active', {
      params: {
        page,
        limit,
      },
    });

    const list = extractArray(response.data?.data ?? response.data)
      .map(normalizeInstitution)
      .filter((item) => item.id && item.name);

    return list;
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to load institutions.'));
  }
}

export function subscribeToBookingChanges(listener: () => void): () => void {
  bookingListeners.add(listener);

  return () => {
    bookingListeners.delete(listener);
  };
}

export async function getBookingById(id: string): Promise<BookingRequest | null> {
  try {
    const response = await api.get(`/bookings/${id}`);
    const booking = parseSingleBooking(response.data?.data ?? response.data);
    if (booking) {
      recordBookings([booking]);
      return booking;
    }

    throw new Error('Booking not found.');
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to load booking.'));
  }
}

export function findBookingById(id: string): BookingRequest | null {
  return readCachedBookings().find((booking) => booking.id === id) || null;
}

export function bookingBelongsToInstitution(booking: BookingRequest, institutionId?: string): boolean {
  return matchesInstitution(booking, institutionId);
}

export async function getBookingPage(query: BookingQueryParams = {}): Promise<BookingPageResult> {
  const page = query.page ?? 1;
  const pageSize = query.pageSize ?? 10;

  try {
    const response = await api.get('/bookings', { params: backendParams(query) });
    const bookings = normalizeBookingCollection(response.data?.data ?? response.data?.bookings ?? response.data);
    const normalized = sortBookings(bookings).filter((booking) => bookingMatchesFilters(booking, query));
    const responseMeta = extractMeta(response.data?.meta ?? response.data);
    const result = paginateBookings(normalized, responseMeta.page || page, responseMeta.pageSize || pageSize);
    recordBookings(normalized);

    const total = responseMeta.total > 0 ? responseMeta.total : result.total;
    const totalPages = Math.max(responseMeta.totalPages, result.totalPages);

    return {
      ...result,
      page: responseMeta.page || result.page,
      pageSize: responseMeta.pageSize || result.pageSize,
      total: total,
      totalPages,
      hasNextPage: totalPages > (responseMeta.page || page),
      hasPreviousPage: responseMeta.page ? responseMeta.page > 1 : result.hasPreviousPage,
    };
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to load bookings.'));
  }
}

export async function getAllBookings(institutionFilter?: string): Promise<BookingRequest[]> {
  const result = await getBookingPage({ institutionId: institutionFilter, page: 1, pageSize: 1000 });
  return result.items;
}

export async function getActiveBookingInstitutions(page = 1, limit = 20): Promise<BookingInstitution[]> {
  return listActiveInstitutes(page, limit);
}

export async function submitBookingRequest(submission: BookingSubmission): Promise<BookingRequest> {
  const candidateEmail = getSubmissionCandidateEmail(submission);
  const existingBookings = await getAllBookings();
  const activeBooking = existingBookings.find(
    (booking) =>
      (booking.candidateDetails?.email?.toLowerCase() === candidateEmail || booking.candidateId === submission.candidateDetails?.candidateId) &&
      isActiveBookingStatus(booking.status),
  );

  if (activeBooking) {
    throw new Error(getBookingBlockMessage(activeBooking.status));
  }

  try {
    const response = await api.post('/bookings', buildBackendSubmissionPayload(submission));
    const booking = parseSingleBooking(response.data?.data ?? response.data);

    if (!booking) {
      throw new Error('Booking response is invalid.');
    }

    recordBookings([booking]);
    return booking;
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to submit booking request.'));
  }
}

export async function updateBookingStatus(id: string, status: BookingStatus): Promise<BookingRequest | null> {
  const payload = { action: status === 'Approved' ? 'approve' : 'reject' };

  try {
    const response = await api.patch(`/bookings/${id}/verify`, payload);
    const booking = parseSingleBooking(response.data?.data ?? response.data);
    if (!booking) {
      const current = findBookingById(id);
      if (current) return current;
      throw new Error('Booking update failed.');
    }

    recordBookings([booking]);
    return booking;
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to update booking status.'));
  }
}

export async function cancelBookingRequest(id: string): Promise<BookingRequest | null> {
  try {
    const response = await api.patch(`/bookings/${id}/cancel`);
    const booking = parseSingleBooking(response.data?.data ?? response.data);
    if (!booking) {
      const current = findBookingById(id);
      return current;
    }

    recordBookings([booking]);
    return booking;
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to cancel booking request.'));
  }
}

export async function deleteBookingRequest(id: string): Promise<boolean> {
  try {
    await api.delete(`/bookings/${id}`);
    cachedBookings = cachedBookings.filter((booking) => booking.id !== id);
    emitBookingStoreChange();
    return true;
  } catch (error) {
    throw new Error(extractApiError(error, 'Failed to delete booking request.'));
  }
}

export function getStoredBookingSnapshot(): BookingRequest[] {
  return [...cachedBookings];
}
