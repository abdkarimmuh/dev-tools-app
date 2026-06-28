"use client"

import { createContext, useContext, useState } from "react"

import { Language, Translations, translations } from "@/lib/i18n"

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType>({
  language: "id",
  setLanguage: () => {},
  t: translations.id,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "id"
    const stored = localStorage.getItem("lang") as Language | null
    return stored === "en" || stored === "id" ? stored : "id"
  })

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("lang", lang)
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage: handleSetLanguage, t: translations[language] }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => useContext(LanguageContext)
