"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { Locale, messages } from "@/lib/messages";
const Context = createContext<{
  locale: Locale;
  setLocale: (v: Locale) => void;
}>({ locale: "en", setLocale: () => {} });
export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("open24-locale");
    } catch {}
    if (stored === "uz" || stored === "ru" || stored === "en")
      setLocale(stored);
  }, []);
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);
  function update(v: Locale) {
    setLocale(v);
    try {
      localStorage.setItem("open24-locale", v);
    } catch {}
  }
  return (
    <Context.Provider value={{ locale, setLocale: update }}>
      {children}
    </Context.Provider>
  );
}
export function useT() {
  const { locale, setLocale } = useContext(Context);
  return { locale, setLocale, t: messages[locale] };
}
