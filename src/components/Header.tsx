import "../styles/Header.scss";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="header" role="banner">
      <div className="container">
        <div className="header-top">
          <h1 className="logo">
            <span className="visually-hidden">GPT 워터마크 탐지기</span>
            <a href="/" title="GPT 워터마크 탐지기 홈페이지" aria-label="홈페이지로 이동">
              GPT 워터마크 탐지기
            </a>
          </h1>
          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode}
            aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
            title={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {darkMode ? (
              <span className="light-icon" aria-hidden="true">☀️</span>
            ) : (
              <span className="dark-icon" aria-hidden="true">🌙</span>
            )}
          </button>
        </div>
        <h2 className="description">
          텍스트에 숨겨진 워터마크를 감지하여 AI 생성 콘텐츠를 정확하게 식별합니다
        </h2>
        <p className="seo-text">
          <strong>GPT 워터마크 탐지기</strong>는 ChatGPT, Bard 등 AI 모델이 생성한 텍스트에 
          숨겨진 워터마크를 감지하는 무료 온라인 도구입니다. 
          텍스트를 입력하면 AI 생성 여부를 빠르게 확인할 수 있으며, 
          워터마크가 있는 경우 이를 제거하는 기능도 제공합니다.
        </p>
      </div>
    </header>
  );
}

export default Header;
