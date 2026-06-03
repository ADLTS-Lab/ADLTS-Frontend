import api from "@/lib/api";

import { ApiListResponse, extractApiError, extractList } from "./api-utils";

export type ExpertStatus = "active" | "inactive" | "suspended" | string;

export interface ExpertRecord {
  id: string;
  email: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  name: string;
  phone?: string;
  employee_id?: string;
  status: ExpertStatus;
  created_at?: string;
  updated_at?: string;
}

export interface ListExpertsParams {
  search?: string;
  status?: string;
  page?: number;
}

function toStr(value: unknown, fallback = ""): string {
  if (value === null || value === undefined) return fallback;
  return String(value);
}

function normalizeExpert(raw: unknown): ExpertRecord | null {
  if (!raw || typeof raw !== "object") return null;
  const data = raw as Record<string, unknown>;
  const firstName = toStr(data.first_name ?? data.firstName);
  const middleName = toStr(data.middle_name ?? data.middleName);
  const lastName = toStr(data.last_name ?? data.lastName);
  const name = toStr(data.name, [firstName, middleName, lastName].filter(Boolean).join(" "));
  const id = toStr(data.id ?? data.expert_id);
  const email = toStr(data.email);

  if (!id || !email) return null;

  return {
    id,
    email,
    first_name: firstName,
    middle_name: middleName,
    last_name: lastName,
    name: name || email,
    phone: toStr(data.phone),
    employee_id: toStr(data.employee_id ?? data.employeeId),
    status: toStr(data.status, "active"),
    created_at: toStr(data.created_at ?? data.createdAt),
    updated_at: toStr(data.updated_at ?? data.updatedAt),
  };
}

/** SuperAdmin — GET /experts */
export async function listExperts(params?: ListExpertsParams): Promise<ExpertRecord[]> {
  try {
    const response = await api.get<ApiListResponse<unknown>>("/experts", {
      params: {
        ...(params?.search ? { search: params.search } : {}),
        ...(params?.status ? { status: params.status } : {}),
        ...(params?.page ? { page: params.page } : {}),
      },
    });

    return extractList<unknown>(response.data)
      .map(normalizeExpert)
      .filter((expert): expert is ExpertRecord => Boolean(expert));
  } catch (err) {
    throw new Error(extractApiError(err, "Unable to load experts."));
  }
}

/** SuperAdmin — PATCH /experts/:id/status */
export async function updateExpertStatus(id: string, status: ExpertStatus): Promise<void> {
  try {
    await api.patch(`/experts/${encodeURIComponent(id)}/status`, { status });
  } catch (err) {
    throw new Error(extractApiError(err, "Unable to update expert status."));
  }
}
