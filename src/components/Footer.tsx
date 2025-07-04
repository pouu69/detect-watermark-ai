import "../styles/Footer.scss";

interface FooterProps {}

function Footer({}: FooterProps) {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer" role="contentinfo">
      <div className="container">
        <div className="footer-left">
          <p className="copyright">© {currentYear} GPT 워터마크 탐지기</p>
          <p className="description">
            텍스트에 숨겨진 워터마크를 감지하여 AI 생성 콘텐츠를 정확하게
            식별하는 고급 분석 도구입니다.
          </p>
          <div className="footer-links">
            <a href="/privacy" className="footer-link">개인정보처리방침</a>
            <a href="/terms" className="footer-link">이용약관</a>
          </div>
        </div>

        <div className="footer-right">
          <h3 className="contact-title">제작 및 문의</h3>
          <p className="contact-email">
            개발: <a href="mailto:pouu69@gmail.com" className="email-link">pouu69@gmail.com</a>
          </p>
          <div className="keywords" aria-hidden="true">
            <span className="keyword">AI 텍스트 감지</span>
            <span className="keyword">워터마크 탐지</span>
            <span className="keyword">ChatGPT 감지</span>
            <span className="keyword">AI 콘텐츠 식별</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
