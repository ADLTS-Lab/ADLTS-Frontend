import api from '@/lib/api';

import { ApiListResponse, ApiResponse, extractApiError, extractList } from './api-utils';

export interface SlotRecord {
  id: string;
  instituteId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
  bookedCount: number;
  available: number;
}

export interface CreateSlotRequest {
  instituteId: string;
  startsAt: string;
  endsAt: string;
  capacity: number;
}

function toStr(value: unknown, fallback = '') {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function toNum(value: unknown, fallback = 0) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeSlot(raw: unknown): SlotRecord | null {
  if (!raw || typeof raw !== 'object') return null;
  const item = raw as Record<string, unknown>;
  const id = toStr(item.id ?? item.slot_id).trim();
  if (!id) return null;

  return {
    id,
    instituteId: toStr(item.institute_id ?? item.instituteId),
    startsAt: toStr(item.starts_at ?? item.startsAt),
    endsAt: toStr(item.ends_at ?? item.endsAt),
    capacity: toNum(item.capacity, 1),
    bookedCount: toNum(item.booked_count ?? item.bookedCount),
    available: toNum(item.available),
  };
}

export async function listSlots(instituteId: string): Promise<SlotRecord[]> {
  try {
    const response = await api.get<ApiListResponse<unknown>>('/slots', {
      params: {
        institute_id: instituteId,
        page: 1,
      },
    });
    return extractList<unknown>(response.data).map(normalizeSlot).filter((item): item is SlotRecord => Boolean(item));
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load slots.'));
  }
}

export async function getSlot(slotId: string): Promise<SlotRecord | null> {
  try {
    const response = await api.get<ApiResponse<unknown>>(`/slots/${encodeURIComponent(slotId)}`);
    return normalizeSlot(response.data?.data ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to load slot.'));
  }
}

export async function createSlot(payload: CreateSlotRequest): Promise<SlotRecord | null> {
  try {
    const response = await api.post<ApiResponse<unknown>>('/slots', {
      institute_id: payload.instituteId,
      starts_at: payload.startsAt,
      ends_at: payload.endsAt,
      capacity: payload.capacity,
    });
    return normalizeSlot(response.data?.data ?? response.data);
  } catch (err) {
    throw new Error(extractApiError(err, 'Unable to create slot.'));
  }
}
