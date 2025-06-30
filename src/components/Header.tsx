import "../styles/Header.scss";

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
}

function Header({ darkMode, toggleDarkMode }: HeaderProps) {
  return (
    <header className="header">
      <div className="container">
        <div className="header-top">
          <h1 className="logo">GPT 워터마크 탐지기</h1>
          <button 
            className="theme-toggle" 
            onClick={toggleDarkMode}
            aria-label={darkMode ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {darkMode ? (
              <span className="light-icon">☀️</span>
            ) : (
              <span className="dark-icon">🌙</span>
            )}
          </button>
        </div>
        <p className="description">
          텍스트에 숨겨진 워터마크를 감지하여 AI 생성 콘텐츠를 정확하게 식별합니다
        </p>
      </div>
    </header>
  );
}

export default Header;
