import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import koTranslation from "./locales/ko.json";
import enTranslation from "./locales/en.json";

// the translations
const resources = {
  ko: {
    translation: koTranslation,
  },
  en: {
    translation: enTranslation,
  },
};

// Get saved language preference from localStorage or use default
const savedLanguage = localStorage.getItem('i18nextLng') || "ko";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: savedLanguage, // use saved language or default to Korean
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    // Add localStorage caching
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

// Save language changes to localStorage
i18n.on('languageChanged', (lng) => {
  localStorage.setItem('i18nextLng', lng);
});

export default i18n;
