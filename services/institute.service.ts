import api from '@/lib/api';

import { BookingRequest, getRecentInstitutionRequests, getLoggedInInstitutionId } from './institution.service';
import { getBookingPage } from './booking.service';
import { ApiResponse, extractApiError, extractData } from './api-utils';

export type InstituteOverview = {
  activeStudents: number;
  upcomingExams: number;
  passRate: number; // percentage
};

export async function getInstituteOverview(): Promise<ApiResponse<InstituteOverview>> {
  const institutionId = getLoggedInInstitutionId();
  const requestResult = await getBookingPage({ institutionId, page: 1, pageSize: 1000 });

  const now = new Date();
  const activeStudents = requestResult.items.filter((booking) => booking.status === 'Approved').length;
  const upcomingExams = requestResult.items.filter(
    (booking) => booking.status === 'Approved' && new Date(booking.preferredDate).getTime() >= now.getTime(),
  ).length;

  const completedExams = requestResult.items.filter((booking) => booking.status === 'Completed');
  const passed = completedExams.filter((booking) => booking.status === 'Completed').length;

  return {
    success: true,
    data: {
      activeStudents,
      upcomingExams,
      passRate: completedExams.length ? Number(((passed / completedExams.length) * 100).toFixed(1)) : 0,
    },
  };
}

export async function getRecentEnrollments(): Promise<ApiResponse<BookingRequest[]>> {
  const data = await getRecentInstitutionRequests(5);
  return {
    success: true,
    data,
  };
}

export type InstituteProfile = {
  institutionName: string;
  contactPerson: string;
  phone: string;
  address: string;
  description: string;
  email: string;
  institutionId: string;
  logoUrl?: string;
};

function normalizeInstituteProfile(payload: unknown): InstituteProfile | null {
  if (!payload || typeof payload !== 'object') return null;

  const data = payload as Record<string, unknown>;

  const institutionName = toStr(data.institutionName ?? data.name ?? data.institution_name);
  const contactPerson = toStr(data.contactPerson ?? data.contact_person ?? data.contact_person_name);
  const phone = toStr(data.phone ?? data.phone_number ?? data.contact_phone);
  const address = toStr(data.address ?? data.location ?? data.office_address);
  const description = toStr(data.description ?? data.bio ?? data.about, '');
  const email = toStr(data.email ?? data.contactEmail ?? data.contact_email);
  const institutionId = toStr(data.institutionId ?? data.institution_id ?? data.id, '');
  const logoUrl = toStr(data.logoUrl ?? data.logo_url ?? data.logo, '', '');

  if (!institutionName && !contactPerson && !phone && !address && !email && !institutionId) {
    return null;
  }

  return {
    institutionName: institutionName || 'Unknown Institute',
    contactPerson,
    phone,
    address,
    description,
    email,
    institutionId,
    logoUrl,
  };
}

function toStr(value: unknown, fallback = ''): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

/** Institute profile — GET /institutes/me */
export async function getInstituteProfile(): Promise<ApiResponse<InstituteProfile>> {
  try {
    const response = await api.get<ApiResponse<unknown>>('/institutes/me');
    const profile = normalizeInstituteProfile(response.data?.data ?? response.data);

    if (!profile) {
      throw new Error('Invalid institute profile payload.');
    }

    return {
      success: true,
      data: profile,
      message: response.data?.message,
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load institute profile.'));
  }
}

/** Institute profile update — PATCH /institutes/me */
export async function updateInstituteProfile(updates: Partial<InstituteProfile>): Promise<ApiResponse<InstituteProfile>> {
  try {
    const sanitized = {
      institutionName: updates.institutionName,
      contactPerson: updates.contactPerson,
      phone: updates.phone,
      address: updates.address,
      description: updates.description,
    };

    Object.keys(sanitized).forEach((key) => {
      const value = (sanitized as Record<string, unknown>)[key];
      if (value === undefined) {
        delete (sanitized as Record<string, unknown>)[key];
      }
    });

    const response = await api.patch<ApiResponse<unknown>>('/institutes/me', sanitized);
    const updated = normalizeInstituteProfile(response.data?.data ?? response.data);

    if (!updated) {
      throw new Error('Failed to parse updated profile.');
    }

    return {
      success: !!response.data?.success,
      data: updated,
      message: response.data?.message,
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to update profile.'));
  }
}

/** Institute logo upload — PATCH /institutes/me/logo with field `file` */
export async function uploadInstituteLogo(file: File): Promise<ApiResponse<Pick<InstituteProfile, 'logoUrl'>>> {
  try {
    const form = new FormData();
    form.append('file', file);

    const response = await api.patch<ApiResponse<unknown>>('/institutes/me/logo', form);
    const payload = extractData<unknown>(response.data) ?? response.data?.data;

    const logoUrl =
      (payload && typeof payload === 'object' ? (payload as Record<string, unknown>).logo_url ?? (payload as Record<string, unknown>).logoUrl : undefined)
      ||
      (response.data && typeof response.data === 'object'
        ? (response.data as Record<string, unknown>).logo_url || (response.data as Record<string, unknown>).logoUrl
        : undefined);

    return {
      success: !!response.data?.success,
      data: {
        logoUrl: typeof logoUrl === 'string' ? logoUrl : '',
      },
      message: response.data?.message,
    };
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to upload logo.'));
  }
}
