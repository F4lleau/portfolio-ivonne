import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Locale, Text } from '@/types';
import type es from '../../public/locales/es.json';
let dictionaries: Record<Locale, typeof es>;
export async function loadTranslations() {
  const [spanish, english] = await Promise.all(
    ['/locales/es.json', '/locales/en.json'].map(async (url) => {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Could not load translations');
      return response.json() as Promise<typeof es>;
    }),
  );
  dictionaries = { es: spanish, en: english };
}
type Context = {
  locale: Locale;
  setLocale: (v: Locale) => void;
  theme: string;
  toggleTheme: () => void;
  t: (key: keyof typeof es) => string;
  tx: (value: Text | undefined) => string;
  fm: (value: string) => string;
};
const SettingsContext = createContext<Context | null>(null);
export function SettingsProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() =>
    localStorage.getItem('locale') === 'en' ? 'en' : 'es',
  );
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    localStorage.setItem('locale', locale);
    document.documentElement.lang = locale;
  }, [locale]);
  useEffect(() => {
    localStorage.setItem('theme', theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  return (
    <SettingsContext.Provider
      value={{
        locale,
        setLocale,
        theme,
        toggleTheme: () => setTheme((v) => (v === 'dark' ? 'light' : 'dark')),
        t: (key) => dictionaries[locale][key],
        tx: (value) => value?.[locale] || value?.es || '',
        fm: (value) =>
          locale === 'en'
            ? value
                .replace('Actualidad', 'Present')
                .replace('Nativo / Native', 'Native')
                .replace('Nativo', 'Native')
            : value.replace('Nativo / Native', 'Nativo'),
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}
export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('SettingsProvider missing');
  return value;
}
