import "../styles/Footer.scss";

interface FooterProps {}

function Footer({}: FooterProps) {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-left">
          <p className="copyright">
            © 2025 AI 텍스트 워터마크 감지 및 제거 도구
          </p>
          <p className="description">
            텍스트에 숨겨진 워터마크를 감지하여 AI 생성 콘텐츠를 정확하게 식별하는 
            고급 분석 도구입니다.
          </p>
        </div>
        
        <div className="footer-right">
          <p className="contact-title">제작 및 문의</p>
          <p className="contact-email">개발: pouu69@gmail.com</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
