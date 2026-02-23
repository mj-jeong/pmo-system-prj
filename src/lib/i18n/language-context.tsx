"use client";

import * as React from "react";
import {
  type Language,
  SUPPORTED_LANGUAGES,
  translations,
  getNestedValue,
} from "./translations";

const STORAGE_KEY = "pmo-language";

interface LanguageContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = React.createContext<LanguageContextValue>({
  language: "ko",
  setLanguage: () => undefined,
  t: (key) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>("ko");

  React.useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
    if (stored && SUPPORTED_LANGUAGES.includes(stored)) {
      setLanguageState(stored);
      document.documentElement.setAttribute("lang", stored);
    }
  }, []);

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute("lang", lang);
  }, []);

  const t = React.useCallback(
    (key: string): string =>
      getNestedValue(translations[language], key) ?? key,
    [language],
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  return React.useContext(LanguageContext);
}
