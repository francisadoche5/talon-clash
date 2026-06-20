import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import translations, { LANGUAGES } from './translations';

const STORAGE_KEY = 'talon_clash_lang';
const LanguageContext = createContext(null);

function detectInitialLanguage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && translations[saved]) return saved;
  } catch {}

  // Telegram tells us the user's app language before they ever touch our UI.
  const tgLang = window?.Telegram?.WebApp?.initDataUnsafe?.user?.language_code;
  if (tgLang && translations[tgLang]) return tgLang;

  const browserLang = (navigator.language || 'en').slice(0, 2);
  if (translations[browserLang]) return browserLang;

  return 'en';
}

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(detectInitialLanguage);

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, language); } catch {}
  }, [language]);

  const setLanguage = useCallback((code) => {
    if (translations[code]) setLanguageState(code);
  }, []);

  // Falls back to English, then to the raw key, so a missing translation
  // never breaks the UI — it just shows in English instead.
  const t = useCallback((key) => {
    return translations[language]?.[key] ?? translations.en[key] ?? key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within a LanguageProvider');
  return ctx;
}
