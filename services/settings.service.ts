export interface CandidateSettings {
  language: "en" | "am";
  theme: "light" | "dark" | "system";
  notifications: {
    email: boolean;
    sms: boolean;
    examReminders: boolean;
  };
}

const DEFAULT_SETTINGS: CandidateSettings = {
  language: "en",
  theme: "system",
  notifications: {
    email: true,
    sms: false,
    examReminders: true,
  },
};

const SETTINGS_STORAGE_KEY = "adlts-candidate-settings";

export async function getCandidateSettings(): Promise<CandidateSettings> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (typeof window === "undefined") return DEFAULT_SETTINGS;

  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function updateCandidateSettings(settings: Partial<CandidateSettings>): Promise<CandidateSettings> {
  // Mock API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const current = await getCandidateSettings();
  const updated = {
    ...current,
    ...settings,
    notifications: {
      ...current.notifications,
      ...(settings.notifications || {})
    }
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  }

  return updated;
}

export interface InstituteSettings {
  language: "en" | "am";
  theme: "light" | "dark" | "system";
  notifications: {
    bookingUpdates: boolean;
    examResults: boolean;
    institutionMessages: boolean;
  };
}

const DEFAULT_INSTITUTE_SETTINGS: InstituteSettings = {
  language: "en",
  theme: "system",
  notifications: {
    bookingUpdates: true,
    examResults: true,
    institutionMessages: true,
  },
};

const INSTITUTE_SETTINGS_STORAGE_KEY = "adlts-institute-settings";

export async function getInstituteSettings(): Promise<InstituteSettings> {
  await new Promise(resolve => setTimeout(resolve, 300));
  
  if (typeof window === "undefined") return DEFAULT_INSTITUTE_SETTINGS;

  try {
    const raw = localStorage.getItem(INSTITUTE_SETTINGS_STORAGE_KEY);
    if (!raw) return DEFAULT_INSTITUTE_SETTINGS;
    
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_INSTITUTE_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_INSTITUTE_SETTINGS;
  }
}

export async function updateInstituteSettings(settings: Partial<InstituteSettings>): Promise<InstituteSettings> {
  await new Promise(resolve => setTimeout(resolve, 500));

  const current = await getInstituteSettings();
  const updated = {
    ...current,
    ...settings,
    notifications: {
      ...current.notifications,
      ...(settings.notifications || {})
    }
  };

  if (typeof window !== "undefined") {
    localStorage.setItem(INSTITUTE_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
  }

  return updated;
}
