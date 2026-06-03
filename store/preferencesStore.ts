import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UILanguage = "en" | "am";
export type AppTheme = "light";

export type AppPreferences = {
  language: UILanguage;
  theme: AppTheme;
};

export type AppSettings = {
  language: UILanguage;
  theme: AppTheme;
};

type PreferencesState = AppPreferences & {
  setLanguage: (language: UILanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
};

const DEFAULT_PREFERENCES: AppPreferences = {
  language: "en",
  theme: "light",
};

export const PREFERENCES_STORAGE_KEY = "adlts-app-preferences";

const normalizeLanguage = (value: unknown): UILanguage => {
  return value === "am" ? "am" : "en";
};

const normalizeTheme = (value: unknown): AppTheme => {
  return value === "light" ? value : "light";
};

const normalizeSettings = (incoming: Partial<AppPreferences> = {}): AppPreferences => ({
  language: normalizeLanguage(incoming.language),
  theme: normalizeTheme(incoming.theme),
});

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      ...DEFAULT_PREFERENCES,
      setLanguage: (language: UILanguage) =>
        set(() => ({
          language,
        })),
      setTheme: (theme: AppTheme) =>
        set(() => ({
          theme,
        })),
      setSettings: (settings: Partial<AppSettings>) =>
        set((state) => ({
          ...state,
          ...normalizeSettings({
            ...state,
            ...settings,
          }),
        })),
    }),
    {
      name: PREFERENCES_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      merge: (persistedState: unknown, currentState) => {
        const typed = persistedState as Partial<PreferencesState>;
        return {
          ...currentState,
          ...normalizeSettings(typed as Partial<AppPreferences>),
          setLanguage: currentState.setLanguage,
          setTheme: currentState.setTheme,
          setSettings: currentState.setSettings,
        };
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        if (typeof window === "undefined") return;

        const legacyLang = window.localStorage.getItem("lang");
        if (legacyLang === "en" || legacyLang === "am") {
          state.setLanguage(legacyLang);
        }
      },
    }
  )
);
