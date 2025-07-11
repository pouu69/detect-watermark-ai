import "../styles/Footer.scss";
import { useTranslation } from "react-i18next";

interface FooterProps {}

function Footer({}: FooterProps) {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();
  
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-left">
          <p className="copyright">© {currentYear} {t("header.title")}</p>
          <p className="description">
            {t("footer.description")}
          </p>
          <div className="footer-links">
            <a href="/privacy.html" className="footer-link">{t("footer.privacy")}</a>
            <a href="/terms.html" className="footer-link">{t("footer.terms")}</a>
          </div>
        </div>

        <div className="footer-right">
          <h3 className="contact-title">{t("footer.contact")}</h3>
          <p className="contact-email">
            {t("footer.developer")}: <a href="mailto:pouu69@gmail.com" className="email-link">pouu69@gmail.com</a>
          </p>
          <div className="keywords" aria-hidden="true">
            <span className="keyword">{t("footer.keyword1")}</span>
            <span className="keyword">{t("footer.keyword2")}</span>
            <span className="keyword">{t("footer.keyword3")}</span>
            <span className="keyword">{t("footer.keyword4")}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
