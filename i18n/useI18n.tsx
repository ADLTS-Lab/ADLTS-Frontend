"use client";

import { useEffect, useState } from "react";
import en from "./en";
import am from "./am";

type Lang = "en" | "am";

const DICTS: Record<Lang, Record<string, string>> = {
  en,
  am,
};

export function useI18n() {
  const [lang, setLang] = useState<Lang>("en");

  const syncLangFromStorage = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = localStorage.getItem("lang") as Lang | null;
      if (stored && (stored === "en" || stored === "am")) {
        setLang(stored);
      }
    } catch {}
  };

  // On mount, hydrate language from localStorage to avoid SSR/client mismatch
  useEffect(() => {
    syncLangFromStorage();
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
      window.dispatchEvent(new Event("adlts-lang-change"));
    } catch {}
  }, [lang]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key === "lang") {
        syncLangFromStorage();
      }
    };

    const handleLanguageChange = () => {
      syncLangFromStorage();
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("adlts-lang-change", handleLanguageChange as EventListener);

    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("adlts-lang-change", handleLanguageChange as EventListener);
    };
  }, []);

  const t = (key: string) => {
    return DICTS[lang][key] ?? DICTS["en"][key] ?? key;
  };

  return { lang, setLang, t } as const;
}

export default useI18n;
