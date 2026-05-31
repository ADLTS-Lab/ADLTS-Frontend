"use client";

import { useCallback } from "react";
import { useLanguage } from "@/providers/LanguageProvider";
import en from "./en";
import am from "./am";

type Lang = "en" | "am";

const DICTS: Record<Lang, Record<string, string>> = {
  en,
  am,
};

export function useI18n() {
  const { lang, setLang } = useLanguage();

  const t = useCallback(
    (key: string) => {
      const current = DICTS[lang] ?? DICTS.en;
      return current[key] ?? DICTS.en[key] ?? key;
    },
    [lang]
  );

  return { lang, setLang, t };
}

export default useI18n;
