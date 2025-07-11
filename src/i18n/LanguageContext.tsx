import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';

type LanguageContextType = {
  language: string;
  changeLanguage: (lang: string) => void;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Helper function to get cookie
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

// Helper function to set cookie
const setCookie = (name: string, value: string, days: number = 365): void => {
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const expires = `; expires=${date.toUTCString()}`;
  document.cookie = `${name}=${value}${expires}; path=/; SameSite=Lax`;
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Try to get language from URL parameter, then cookie, then localStorage, then default to i18n language
  const getInitialLanguage = (): string => {
    try {
      // Check URL parameter first
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && (urlLang === 'en' || urlLang === 'ko')) return urlLang;
      
      // Then check cookie
      const cookieLang = getCookie('userLanguage');
      if (cookieLang) return cookieLang;
      
      // Then check localStorage
      const localStorageLang = localStorage.getItem('userLanguage');
      if (localStorageLang) return localStorageLang;
      
      return i18n.language;
    } catch (e) {
      // In case of any errors (e.g., localStorage not available)
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
    
    // Save to both cookie and localStorage for redundancy
    try {
      setCookie('userLanguage', lang);
      localStorage.setItem('userLanguage', lang);
    } catch (e) {
      console.error('Error saving language preference:', e);
    }
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
