import { ApiSuccess } from './api-utils';
import { BookingRequest, getRecentInstitutionRequests, getBookingPage, getLoggedInInstitutionId } from './institution.service';

type CompletedExamMock = {
  institutionId: string;
  passed: boolean;
  completedAt: string;
};

const MOCK_COMPLETED_EXAMS: CompletedExamMock[] = [
  { institutionId: 'bole-driving-institute', passed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString() },
  { institutionId: 'bole-driving-institute', passed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString() },
  { institutionId: 'bole-driving-institute', passed: false, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 12).toISOString() },
  { institutionId: 'kality-driving-school', passed: true, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 9).toISOString() },
  { institutionId: 'kality-driving-school', passed: false, completedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
];

export type InstituteOverview = {
  activeStudents: number;
  upcomingExams: number;
  passRate: number; // percentage
};

export async function getInstituteOverview(): Promise<ApiSuccess<InstituteOverview>> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  const institutionId = getLoggedInInstitutionId();
  const result = await getBookingPage({ institutionId, page: 1, pageSize: 1000 });
  const now = new Date();

  const activeStudents = result.items.filter((booking) => booking.status === 'Approved').length;
  const upcomingExams = result.items.filter((booking) => booking.status === 'Approved' && new Date(booking.preferredDate).getTime() >= now.getTime()).length;

  const completedExams = MOCK_COMPLETED_EXAMS.filter((exam) => !institutionId || exam.institutionId === institutionId);
  const passRate = completedExams.length
    ? Number(((completedExams.filter((exam) => exam.passed).length / completedExams.length) * 100).toFixed(1))
    : 0;

  return {
    success: true,
    data: {
      activeStudents,
      upcomingExams,
      passRate,
    },
  };
}

export async function getRecentEnrollments(): Promise<ApiSuccess<BookingRequest[]>> {
  await new Promise((resolve) => setTimeout(resolve, 750));

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
};

const DEFAULT_PROFILE: InstituteProfile = {
  institutionName: "Bole Driving Institute",
  contactPerson: "Abebe Kebede",
  phone: "0911234567",
  address: "Bole, Addis Ababa",
  description: "Premier driving school providing quality training.",
  email: "contact@boledriving.com",
  institutionId: "INST-10293",
};

const INSTITUTE_PROFILE_STORAGE_KEY = "adlts-institute-profile";

export async function getInstituteProfile(): Promise<ApiSuccess<InstituteProfile>> {
  await new Promise(resolve => setTimeout(resolve, 400));
  
  if (typeof window === "undefined") {
    return { success: true, data: DEFAULT_PROFILE };
  }

  try {
    const raw = localStorage.getItem(INSTITUTE_PROFILE_STORAGE_KEY);
    if (!raw) return { success: true, data: DEFAULT_PROFILE };
    
    return { success: true, data: { ...DEFAULT_PROFILE, ...JSON.parse(raw) } };
  } catch {
    return { success: true, data: DEFAULT_PROFILE };
  }
}

export async function updateInstituteProfile(updates: Partial<InstituteProfile>): Promise<ApiSuccess<InstituteProfile>> {
  await new Promise(resolve => setTimeout(resolve, 600));

  const currentRes = await getInstituteProfile();
  const current = currentRes.data;
  
  // Exclude read-only fields from updates
  const { email, institutionId, ...allowedUpdates } = updates as InstituteProfile;
  
  const updated = {
    ...current,
    ...allowedUpdates,
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(INSTITUTE_PROFILE_STORAGE_KEY, JSON.stringify(updated));
  }

  return { success: true, data: updated };
}
