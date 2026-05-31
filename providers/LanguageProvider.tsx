"use client";

import { createContext, useContext, useEffect } from "react";
import { type PropsWithChildren } from "react";
import { usePreferencesStore, type UILanguage } from "@/store/preferencesStore";

type LanguageContextValue = {
  lang: UILanguage;
  setLang: (lang: UILanguage) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: PropsWithChildren) {
  const lang = usePreferencesStore((state) => state.language);
  const setLang = usePreferencesStore((state) => state.setLanguage);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("data-language", lang);
  }, [lang]);

  return <LanguageContext.Provider value={{ lang, setLang }}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  return (
    useContext(LanguageContext) ?? {
      lang: "en" as UILanguage,
      setLang: () => {},
    }
  );
}
