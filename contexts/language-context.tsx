"use client";

import { createContext, useContext } from "react";

import { useStorage } from "@/hooks/use-storage";
import { Language, Translations, translations } from "@/lib/i18n";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  setLanguage: () => {},
  t: translations.en
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useStorage<Language>("lang", "en", "local");

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
