import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type UILanguage = "en" | "am";
export type AppTheme = "light";

export type NotificationPreferences = {
  bookingUpdates: boolean;
  examUpdates: boolean;
  resultNotifications: boolean;
  licensePickupNotifications: boolean;
};

export type AppPreferences = {
  language: UILanguage;
  theme: AppTheme;
  notifications: NotificationPreferences;
};

export type AppSettings = {
  language: UILanguage;
  theme: AppTheme;
  notifications: NotificationPreferences;
};

type PreferencesState = AppPreferences & {
  setLanguage: (language: UILanguage) => void;
  setTheme: (theme: AppTheme) => void;
  setNotifications: (notifications: Partial<NotificationPreferences>) => void;
  setSettings: (settings: Partial<AppSettings>) => void;
};

const DEFAULT_PREFERENCES: AppPreferences = {
  language: "en",
  theme: "light",
  notifications: {
    bookingUpdates: true,
    examUpdates: true,
    resultNotifications: true,
    licensePickupNotifications: true,
  },
};

export const PREFERENCES_STORAGE_KEY = "adlts-app-preferences";

const normalizeLanguage = (value: unknown): UILanguage => {
  return value === "am" ? "am" : "en";
};

const normalizeTheme = (value: unknown): AppTheme => {
  return value === "light" ? value : "light";
};

const normalizeNotification = (value: unknown) => {
  if (typeof value !== "object" || value === null) {
    return DEFAULT_PREFERENCES.notifications;
  }

  const typed = value as Partial<NotificationPreferences>;

  return {
    bookingUpdates:
      typeof typed.bookingUpdates === "boolean"
        ? typed.bookingUpdates
        : DEFAULT_PREFERENCES.notifications.bookingUpdates,
    examUpdates:
      typeof typed.examUpdates === "boolean"
        ? typed.examUpdates
        : DEFAULT_PREFERENCES.notifications.examUpdates,
    resultNotifications:
      typeof typed.resultNotifications === "boolean"
        ? typed.resultNotifications
        : DEFAULT_PREFERENCES.notifications.resultNotifications,
    licensePickupNotifications:
      typeof typed.licensePickupNotifications === "boolean"
        ? typed.licensePickupNotifications
        : DEFAULT_PREFERENCES.notifications.licensePickupNotifications,
  };
};

const normalizeSettings = (incoming: Partial<AppPreferences> = {}): AppPreferences => ({
  language: normalizeLanguage(incoming.language),
  theme: normalizeTheme(incoming.theme),
  notifications: normalizeNotification(incoming.notifications),
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
      setNotifications: (notifications: Partial<NotificationPreferences>) =>
        set((state) => ({
          notifications: {
            ...state.notifications,
            ...notifications,
          },
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
          setNotifications: currentState.setNotifications,
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
