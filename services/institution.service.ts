import { useAuthStore } from '@/store/authStore';

import {
  BookingPageResult,
  BookingQueryParams,
  BookingRequest,
  BookingStatus,
  bookingBelongsToInstitution,
  findBookingById,
  getBookingPage,
  updateBookingStatus,
} from './booking.service';

export type InstitutionBookingFilters = Omit<BookingQueryParams, 'institutionId'> & {
  institutionId?: string;
};

function getCurrentInstitutionId(): string | undefined {
  const user = useAuthStore.getState().user;
  if (!user) return undefined;

  if (user.role === 'super_admin' || user.role === 'admin') return undefined;

  return (
    user.institutionId ||
    (user as { institution_id?: string }).institution_id ||
    user.institutionName ||
    user.name ||
    undefined
  );
}

function assertCanModifyInstitutionBooking(id: string): void {
  const user = useAuthStore.getState().user;
  if (!user) {
    throw new Error('You do not have permission to perform this action.');
  }

  if (user.role === 'super_admin' || user.role === 'admin') {
    return;
  }

  if (user.role !== 'institute') {
    throw new Error('You do not have permission to perform this action.');
  }

  const institutionId = getCurrentInstitutionId();
  const booking = findBookingById(id);
  // Server bookings are authorized by the API; only enforce locally when cached.
  if (!booking) return;

  if (!bookingBelongsToInstitution(booking, institutionId)) {
    throw new Error('You do not have permission to perform this action.');
  }
}

function resolveFilters(filters: InstitutionBookingFilters = {}): BookingQueryParams {
  const currentInstitutionId = filters.institutionId ?? getCurrentInstitutionId();

  return {
    ...filters,
    institutionId: currentInstitutionId,
    page: filters.page ?? 1,
    pageSize: filters.pageSize ?? 10,
  };
}

export async function getInstitutionRequests(filters: InstitutionBookingFilters = {}): Promise<BookingPageResult> {
  return getBookingPage(resolveFilters(filters));
}

export async function getRecentInstitutionRequests(limit = 5): Promise<BookingRequest[]> {
  const result = await getInstitutionRequests({ page: 1, pageSize: limit });
  return result.items;
}

export async function approveInstitutionRequest(id: string): Promise<BookingRequest | null> {
  assertCanModifyInstitutionBooking(id);
  return updateBookingStatus(id, 'Approved');
}

export async function rejectInstitutionRequest(id: string): Promise<BookingRequest | null> {
  assertCanModifyInstitutionBooking(id);
  return updateBookingStatus(id, 'Rejected');
}

export function getLoggedInInstitutionId(): string | undefined {
  return getCurrentInstitutionId();
}

export type { BookingRequest, BookingStatus };
