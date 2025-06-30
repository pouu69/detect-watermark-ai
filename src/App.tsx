import { useState, useEffect } from "react";
import WatermarkDetector from "./components/WatermarkDetector";
import WatermarkRemover from "./components/WatermarkRemover";
import ResultDisplay from "./components/ResultDisplay";
import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.scss";

function App() {
  const [inputText, setInputText] = useState<string>("");
  const [detectionResult, setDetectionResult] = useState<any>(null);
  const [cleanedText, setCleanedText] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"detect" | "remove">("detect");
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // 다크 모드 설정 불러오기
  useEffect(() => {
    const savedDarkMode = localStorage.getItem("darkMode") === "true";
    setDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.body.classList.add("dark-mode");
    }
  }, []);

  // 다크 모드 토글
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("darkMode", String(newDarkMode));

    if (newDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  };

  const handleInputChange = (text: string) => {
    console.log("입력 텍스트 변경:", text.substring(0, 50) + "...");
    setInputText(text);
    // 결과 초기화
    if (detectionResult) setDetectionResult(null);
    if (cleanedText) setCleanedText("");
  };
  
  // 디버깅을 위한 상태 변화 감지
  useEffect(() => {
    if (detectionResult) {
      console.log("App: 감지 결과 업데이트됨", detectionResult);
    }
  }, [detectionResult]);
  
  useEffect(() => {
    if (cleanedText) {
      console.log("App: 정리된 텍스트 업데이트됨", cleanedText.substring(0, 50) + "...");
    }
  }, [cleanedText]);

  return (
    <div className={`app-container ${darkMode ? "dark-mode" : ""}`}>
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} />

      <main className="main-content">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "detect" ? "active" : ""}`}
            onClick={() => setActiveTab("detect")}
          >
            워터마크 감지
          </button>
          <button
            className={`tab ${activeTab === "remove" ? "active" : ""}`}
            onClick={() => setActiveTab("remove")}
          >
            워터마크 제거
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "detect" ? (
            <WatermarkDetector
              inputText={inputText}
              onInputChange={handleInputChange}
              onDetectionResult={setDetectionResult}
            />
          ) : (
            <WatermarkRemover
              inputText={inputText}
              onInputChange={handleInputChange}
              onRemovalResult={setCleanedText}
            />
          )}
        </div>

        <ResultDisplay
          detectionResult={detectionResult}
          cleanedText={cleanedText}
          originalText={inputText}
          activeTab={activeTab}
        />
      </main>

      <Footer />
    </div>
  );
}

export default App;
