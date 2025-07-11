import "../styles/Header.scss";
import { useTranslation } from "react-i18next";
import { useLanguage } from "../i18n/LanguageContext";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  const { t } = useTranslation();
  const { language, changeLanguage } = useLanguage();

  const toggleLanguage = () => {
    const newLang = language === "ko" ? "en" : "ko";
    changeLanguage(newLang);
    
    // Update URL with language parameter
    const url = new URL(window.location.href);
    url.searchParams.set('lang', newLang);
    window.history.replaceState({}, '', url.toString());
  };

  return (
    <header className="header" role="banner">
      <div className="container">
        <div className="header-top">
          <h1 className="logo">
            <span className="visually-hidden">{t("header.title")}</span>
            <a
              href="/"
              title={t("header.title")}
              aria-label={t("header.title")}
            >
              {t("header.title")}
            </a>
          </h1>
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            title={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {darkMode ? (
              <span className="light-icon" aria-hidden="true">
                ☀️
              </span>
            ) : (
              <span className="dark-icon" aria-hidden="true">
                🌙
              </span>
            )}
          </button>
          <button
            className="lang-toggle"
            onClick={toggleLanguage}
            aria-label={language === "ko" ? "Switch to English" : "한국어로 전환"}
            title={language === "ko" ? "Switch to English" : "한국어로 전환"}
          >
            {language === "ko" ? "EN" : "KO"}
          </button>
        </div>
        <h2 className="description">
          {t("header.subtitle")}
        </h2>
        <p className="seo-text">
          {t("header.description")}
        </p>
      </div>
    </header>
  );
}

export default Header;
