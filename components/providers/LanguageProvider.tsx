'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import messagesEs from '@/messages/es.json';
import messagesEn from '@/messages/en.json';

type Locale = 'es' | 'en';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MESSAGES: Record<Locale, any> = { es: messagesEs, en: messagesEn };

interface LanguageContextType {
  locale: Locale;
  setLocale: (l: Locale) => void;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: 'es',
  setLocale: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('es');

  useEffect(() => {
    const saved = localStorage.getItem('qh-locale') as Locale;
    if (saved === 'es' || saved === 'en') {
      setLocaleState(saved);
      document.documentElement.lang = saved;
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem('qh-locale', l);
    document.documentElement.lang = l;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale }}>
      <NextIntlClientProvider locale={locale} messages={MESSAGES[locale]} timeZone="Europe/Madrid">
        {children}
      </NextIntlClientProvider>
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
