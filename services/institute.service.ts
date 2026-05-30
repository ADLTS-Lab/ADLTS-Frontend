import { ApiSuccess } from './api-utils';

export type InstituteOverview = {
  activeStudents: number;
  upcomingExams: number;
  passRate: number; // percentage
};

export type Enrollment = {
  id: string;
  candidateName: string;
  enrollmentDate: string;
  licenseCategory: string;
  status: 'Enrolled' | 'In Training' | 'Ready for Exam';
};

export async function getInstituteOverview(): Promise<ApiSuccess<InstituteOverview>> {
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    success: true,
    data: {
      activeStudents: 145,
      upcomingExams: 22,
      passRate: 82.5,
    },
  };
}

export async function getRecentEnrollments(): Promise<ApiSuccess<Enrollment[]>> {
  await new Promise((resolve) => setTimeout(resolve, 750));

  return {
    success: true,
    data: [
      {
        id: 'enr-1',
        candidateName: 'John Doe',
        enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
        licenseCategory: 'Auto (B)',
        status: 'Enrolled',
      },
      {
        id: 'enr-2',
        candidateName: 'Jane Smith',
        enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        licenseCategory: 'Motorcycle (A)',
        status: 'In Training',
      },
      {
        id: 'enr-3',
        candidateName: 'Mary Johnson',
        enrollmentDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
        licenseCategory: 'Commercial (C)',
        status: 'Ready for Exam',
      },
    ],
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
