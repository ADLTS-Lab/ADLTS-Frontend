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

  // On mount, hydrate language from localStorage to avoid SSR/client mismatch
  useEffect(() => {
    try {
      const stored = localStorage.getItem("lang") as Lang | null;
      if (stored && (stored === "en" || stored === "am")) {
        setLang(stored);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("lang", lang);
    } catch {}
  }, [lang]);

  const t = (key: string) => {
    return DICTS[lang][key] ?? DICTS["en"][key] ?? key;
  };

  return { lang, setLang, t } as const;
}

export default useI18n;
