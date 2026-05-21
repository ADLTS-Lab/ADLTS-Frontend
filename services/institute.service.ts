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
