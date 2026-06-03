import {
  AppSettings as SharedSettings,
  usePreferencesStore,
} from "@/store/preferencesStore";

export type CandidateSettings = SharedSettings;
export type InstituteSettings = SharedSettings;

export async function getAppSettings(): Promise<SharedSettings> {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const state = usePreferencesStore.getState();
  return {
    language: state.language,
    theme: state.theme,
  };
}

export async function updateAppSettings(
  settings: Partial<SharedSettings>
): Promise<SharedSettings> {
  await new Promise((resolve) => setTimeout(resolve, 250));
  const current = usePreferencesStore.getState();

  if (settings.language) {
    current.setLanguage(settings.language);
  }

  if (settings.theme) {
    current.setTheme(settings.theme);
  }

  const updated = usePreferencesStore.getState();

  return {
    language: updated.language,
    theme: updated.theme,
  };
}

export async function getCandidateSettings(): Promise<CandidateSettings> {
  return getAppSettings();
}

export async function updateCandidateSettings(
  settings: Partial<CandidateSettings>
): Promise<CandidateSettings> {
  return updateAppSettings(settings);
}

export async function getInstituteSettings(): Promise<InstituteSettings> {
  return getAppSettings();
}

export async function updateInstituteSettings(
  settings: Partial<InstituteSettings>
): Promise<InstituteSettings> {
  return updateAppSettings(settings);
}
