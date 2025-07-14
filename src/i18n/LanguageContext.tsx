import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to detect if language is Korean
const isKoreanLanguage = (lang: string | null): boolean => {
  if (!lang) return false;
  return lang.toLowerCase().startsWith('ko');
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to get language from URL parameter, then browser language, then default to i18n language
  const getInitialLanguage = (): string => {
    try {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && (urlLang === 'en' || urlLang === 'ko')) return urlLang;
      
      // Then check browser language
      const browserLang = window.navigator.language || (window.navigator as any).userLanguage;
      
      // Return 'ko' if browser language is Korean, otherwise 'en'
      if (isKoreanLanguage(browserLang)) {
        return 'ko';
      } else {
        return 'en';
      }
    } catch (e) {
      // In case of any errors
      return i18n.language;
    }
  };
  
  const [language, setLanguage] = useState(getInitialLanguage());
  
  // Initialize with saved language
  useEffect(() => {
    i18n.changeLanguage(language);
  }, [language]);
  
  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
