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

// Default language (will be overridden by LanguageContext)
const defaultLanguage = "ko";

i18n
  .use(initReactI18next) // passes i18n down to react-i18next
  .init({
    resources,
    lng: defaultLanguage, // will be overridden by LanguageContext
    fallbackLng: "ko",
    interpolation: {
      escapeValue: false, // react already safes from xss
    },
    // No caching or detection - handled by LanguageContext
  });

// No need to save language changes

export default i18n;
