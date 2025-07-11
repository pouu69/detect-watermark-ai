import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  DetectionResult,
  getWatermarkTypeName,
  formatWatermarkInfo,
  generateDiffHtml,
} from "../utils/watermarkUtils";
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Pie, Bar } from "react-chartjs-2";
import "../styles/ResultDisplay.scss";

// Chart.js 컴포넌트 등록
ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Title,
  Tooltip,
  Legend
);

interface ResultDisplayProps {
  detectionResult: DetectionResult | null;
  cleanedText: string;
  originalText: string;
  activeTab: "detect" | "remove";
}

function ResultDisplay({
  detectionResult,
  cleanedText,
  originalText,
  activeTab,
}: ResultDisplayProps) {
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [resultTab, setResultTab] = useState<"basic" | "detailed">("basic");
  const [isWatermarkDetailsOpen, setIsWatermarkDetailsOpen] =
    useState<boolean>(false);
  const [isScrolling, setIsScrolling] = useState<boolean>(false);
  const { t } = useTranslation();

  // 텍스트 패널에 대한 ref 생성
  const originalTextRef = useRef<HTMLDivElement>(null);
  const cleanedTextRef = useRef<HTMLDivElement>(null);

  // 디버깅을 위한 props 변화 감지
  useEffect(() => {
    console.log("ResultDisplay: detectionResult 변경됨", detectionResult);
  }, [detectionResult]);

  useEffect(() => {
    console.log(
      "ResultDisplay: cleanedText 변경됨",
      cleanedText ? cleanedText.substring(0, 50) + "..." : null
    );
  }, [cleanedText]);

  useEffect(() => {
    console.log("ResultDisplay: activeTab 변경됨", activeTab);
  }, [activeTab]);

  // 스크롤 동기화를 위한 useEffect
  useEffect(() => {
    const originalTextElement = originalTextRef.current;
    const cleanedTextElement = cleanedTextRef.current;

    if (!originalTextElement || !cleanedTextElement) return;

    const handleOriginalScroll = () => {
      if (isScrolling) return;

      setIsScrolling(true);
      const scrollTop = originalTextElement.scrollTop;
      const scrollHeight = originalTextElement.scrollHeight;
      const clientHeight = originalTextElement.clientHeight;

      // 스크롤 위치의 비율 계산
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);

      // 정리된 텍스트의 스크롤 위치 설정
      const cleanedScrollHeight = cleanedTextElement.scrollHeight;
      const cleanedClientHeight = cleanedTextElement.clientHeight;
      cleanedTextElement.scrollTop =
        scrollRatio * (cleanedScrollHeight - cleanedClientHeight);

      setTimeout(() => setIsScrolling(false), 50);
    };

    const handleCleanedScroll = () => {
      if (isScrolling) return;

      setIsScrolling(true);
      const scrollTop = cleanedTextElement.scrollTop;
      const scrollHeight = cleanedTextElement.scrollHeight;
      const clientHeight = cleanedTextElement.clientHeight;

      // 스크롤 위치의 비율 계산
      const scrollRatio = scrollTop / (scrollHeight - clientHeight);

      // 원본 텍스트의 스크롤 위치 설정
      const originalScrollHeight = originalTextElement.scrollHeight;
      const originalClientHeight = originalTextElement.clientHeight;
      originalTextElement.scrollTop =
        scrollRatio * (originalScrollHeight - originalClientHeight);

      setTimeout(() => setIsScrolling(false), 50);
    };

    // 스크롤 이벤트 리스너 등록
    originalTextElement.addEventListener("scroll", handleOriginalScroll);
    cleanedTextElement.addEventListener("scroll", handleCleanedScroll);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      originalTextElement.removeEventListener("scroll", handleOriginalScroll);
      cleanedTextElement.removeEventListener("scroll", handleCleanedScroll);
    };
  }, [isScrolling, activeTab]);

  // 텍스트 복사 함수
  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopiedText(type);
        setTimeout(() => setCopiedText(null), 2000); // 2초 후 복사 메시지 숨김
      },
      (err) => {
        console.error("텍스트 복사 실패:", err);
        alert("텍스트 복사에 실패했습니다.");
      }
    );
  };

  // 감지 결과가 없고 제거 결과도 없으면 아무것도 표시하지 않음
  if (!detectionResult && !cleanedText) {
    return null;
  }

  // 감지 탭에서 결과 표시
  if (activeTab === "detect" && detectionResult) {
    const {
      hasWatermarks,
      totalCount,
      watermarks,
      highlightedText,
      detectionRate,
    } = detectionResult;

    return (
      <div className="result-section">
        <h2>{t("result.title")}</h2>

        <div className="result-card">
          <div className="result-header">
            <h3>
              {hasWatermarks ? (
                <span className="detection-result">
                  <span className="detection-label">
                    {t("result.detected")}:
                  </span>
                  <span
                    className={`detection-rate ${
                      detectionRate && detectionRate > 50 ? "high" : "low"
                    }`}
                  >
                    {detectionRate}%
                  </span>
                </span>
              ) : (
                t("result.notDetected")
              )}
            </h3>
            <button
              className="copy-button"
              onClick={() => copyToClipboard(originalText, "original")}
            >
              {copiedText === "original"
                ? t("result.copied")
                : t("detector.copyButton")}
            </button>
          </div>

          {hasWatermarks && (
            <div className="result-content">
              {/* 결과 탭 메뉴 */}
              <div className="result-tabs">
                <button
                  className={`result-tab ${
                    resultTab === "basic" ? "active" : ""
                  }`}
                  onClick={() => setResultTab("basic")}
                >
                  {t("result.basicTab")}
                </button>
                <button
                  className={`result-tab ${
                    resultTab === "detailed" ? "active" : ""
                  }`}
                  onClick={() => setResultTab("detailed")}
                >
                  {t("result.detailedTab")}
                </button>
              </div>

              {/* 분석 결과 탭 */}
              {resultTab === "basic" && (
                <>
                  {/* 통계 정보 섹션 */}
                  <div className="analysis-section">
                    <h4>{t("result.analysisResult")}</h4>
                    <div className="stats-grid">
                      <div className="stat-box">
                        <div className="stat-title">
                          {t("result.totalCharCount")}
                        </div>
                        <div className="stat-value">
                          {detectionResult.statistics.totalCharCount.toLocaleString()}
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-title">
                          {t("result.watermarkCount")}
                        </div>
                        <div className="stat-value">
                          {detectionResult.statistics.watermarkCount}개
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-title">
                          {t("result.emojiCount")}
                        </div>
                        <div className="stat-value">
                          {detectionResult.statistics.emojiCount}개
                        </div>
                      </div>
                      <div className="stat-box">
                        <div className="stat-title">{t("result.gptScore")}</div>
                        <div className="stat-value">
                          {detectionResult.statistics.gptScore}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 워터마크 상세 정보 (표 형태) */}
                  <div className="analysis-section">
                    <h4
                      className="collapsible-header"
                      onClick={() =>
                        setIsWatermarkDetailsOpen(!isWatermarkDetailsOpen)
                      }
                    >
                      {t("result.watermarkDetails")}
                      <span
                        className={`collapse-icon ${
                          isWatermarkDetailsOpen ? "open" : ""
                        }`}
                      >
                        {isWatermarkDetailsOpen ? "▼" : "▶"}
                      </span>
                    </h4>
                    <div
                      className={`watermark-details ${
                        isWatermarkDetailsOpen ? "open" : ""
                      }`}
                    >
                      <div className="watermark-table-container">
                        <table className="watermark-table">
                          <thead>
                            <tr>
                              <th>{t("result.character")}</th>
                              <th>{t("result.unicode")}</th>
                              <th>{t("result.name")}</th>
                              <th>{t("result.position")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* 제로 너비 문자 */}
                            {watermarks.zeroWidth.map((info, index) => (
                              <tr key={`zero-${index}`}>
                                <td className="char-cell">{info.char}</td>
                                <td>{info.unicode}</td>
                                <td>{info.description}</td>
                                <td>{info.position}</td>
                              </tr>
                            ))}

                            {/* 특수 공백 문자 */}
                            {watermarks.specialSpace.map((info, index) => (
                              <tr key={`space-${index}`}>
                                <td className="char-cell">{info.char}</td>
                                <td>{info.unicode}</td>
                                <td>{info.description}</td>
                                <td>{info.position}</td>
                              </tr>
                            ))}

                            {/* 이모지 변형 선택자 */}
                            {watermarks.emojiVariant.map((info, index) => (
                              <tr key={`emoji-${index}`}>
                                <td className="char-cell">{info.char}</td>
                                <td>{info.unicode}</td>
                                <td>{info.description}</td>
                                <td>{info.position}</td>
                              </tr>
                            ))}

                            {/* 워터마크가 없는 경우 */}
                            {totalCount === 0 && (
                              <tr>
                                <td colSpan={4} className="no-data">
                                  {t("result.noWatermarkDetected")}
                                </td>
                              </tr>
                            )}
                          </tbody>
                          <tfoot>
                            <tr>
                              <td colSpan={3} className="total-label">
                                {t("result.totalWatermarkCount")}
                              </td>
                              <td className="total-value">{totalCount}개</td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 하이라이트된 텍스트 표시 */}
                  <div className="highlighted-text">
                    <h4>{t("result.watermarkPositionDisplay")}</h4>
                    <p>
                      <span
                        dangerouslySetInnerHTML={{ __html: highlightedText }}
                      ></span>
                    </p>
                  </div>
                </>
              )}

              {/* 유형 분석 탭 */}
              {resultTab === "detailed" && (
                <>
                  {/* 워터마크 유형 분석 */}
                  <div className="analysis-section">
                    <h4>{t("result.watermarkTypeAnalysis")}</h4>
                    <div className="analysis-grid">
                      {/* 차트 */}
                      <div className="chart-container">
                        <div className="chart-wrapper">
                          <Pie
                            data={{
                              labels: [
                                t("result.unicodeWatermark"),
                                t("result.htmlEntity"),
                                t("result.specialPattern"),
                              ],
                              datasets: [
                                {
                                  data: [
                                    detectionResult.watermarkTypes
                                      .unicodeWatermarks,
                                    detectionResult.watermarkTypes.htmlEntities,
                                    detectionResult.watermarkTypes
                                      .specialPatterns,
                                  ],
                                  backgroundColor: [
                                    "rgba(255, 99, 132, 0.7)",
                                    "rgba(54, 162, 235, 0.7)",
                                    "rgba(255, 206, 86, 0.7)",
                                  ],
                                  borderColor: [
                                    "rgba(255, 99, 132, 1)",
                                    "rgba(54, 162, 235, 1)",
                                    "rgba(255, 206, 86, 1)",
                                  ],
                                  borderWidth: 1,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  position: "bottom",
                                },
                                title: {
                                  display: true,
                                  text: t("result.watermarkTypeAnalysis"),
                                },
                              },
                            }}
                          />
                        </div>
                      </div>

                      {/* 표 */}
                      <div className="data-table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>{t("result.watermarkType")}</th>
                              <th>{t("result.count")}</th>
                              <th>{t("result.ratio")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td>{t("result.unicodeWatermark")}</td>
                              <td>
                                {
                                  detectionResult.watermarkTypes
                                    .unicodeWatermarks
                                }
                                개
                              </td>
                              <td>
                                {totalCount > 0
                                  ? Math.round(
                                      (detectionResult.watermarkTypes
                                        .unicodeWatermarks /
                                        totalCount) *
                                        100
                                    )
                                  : 0}
                                %
                              </td>
                            </tr>
                            <tr>
                              <td>{t("result.htmlEntity")}</td>
                              <td>
                                {detectionResult.watermarkTypes.htmlEntities}개
                              </td>
                              <td>
                                {totalCount > 0
                                  ? Math.round(
                                      (detectionResult.watermarkTypes
                                        .htmlEntities /
                                        totalCount) *
                                        100
                                    )
                                  : 0}
                                %
                              </td>
                            </tr>
                            <tr>
                              <td>{t("result.specialPattern")}</td>
                              <td>
                                {detectionResult.watermarkTypes.specialPatterns}
                                개
                              </td>
                              <td>
                                {totalCount > 0
                                  ? Math.round(
                                      (detectionResult.watermarkTypes
                                        .specialPatterns /
                                        totalCount) *
                                        100
                                    )
                                  : 0}
                                %
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* 워터마크 유형별 상세 정보 */}
                    <div className="watermark-types">
                      {watermarks.zeroWidth.length > 0 && (
                        <div className="watermark-info">
                          <span className="watermark-type">
                            {getWatermarkTypeName("zeroWidth")}:
                          </span>
                          <span className="watermark-count">
                            {watermarks.zeroWidth.length}개
                          </span>
                        </div>
                      )}

                      {watermarks.specialSpace.length > 0 && (
                        <div className="watermark-info">
                          <span className="watermark-type">
                            {getWatermarkTypeName("specialSpace")}:
                          </span>
                          <span className="watermark-count">
                            {watermarks.specialSpace.length}개
                          </span>
                        </div>
                      )}

                      {watermarks.emojiVariant.length > 0 && (
                        <div className="watermark-info">
                          <span className="watermark-type">
                            {getWatermarkTypeName("emojiVariant")}:
                          </span>
                          <span className="watermark-count">
                            {watermarks.emojiVariant.length}개
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 단어 빈도 분석 */}
                  <div className="analysis-section">
                    <h4>{t("result.wordFrequencyAnalysis")}</h4>
                    <div className="analysis-grid">
                      {/* 차트 */}
                      <div className="chart-container">
                        <div className="chart-wrapper">
                          <Bar
                            data={{
                              labels: Object.keys(
                                detectionResult.textAnalysis.wordFrequency
                              ),
                              datasets: [
                                {
                                  label: t("result.frequency"),
                                  data: Object.values(
                                    detectionResult.textAnalysis.wordFrequency
                                  ),
                                  backgroundColor: "rgba(75, 192, 192, 0.7)",
                                  borderColor: "rgba(75, 192, 192, 1)",
                                  borderWidth: 1,
                                },
                              ],
                            }}
                            options={{
                              responsive: true,
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  ticks: {
                                    precision: 0,
                                  },
                                },
                              },
                              plugins: {
                                legend: {
                                  display: false,
                                },
                                title: {
                                  display: true,
                                  text: t("result.wordFrequencyAnalysis"),
                                },
                              },
                            }}
                          />
                        </div>
                      </div>

                      {/* 표 */}
                      <div className="data-table-container">
                        <table className="data-table">
                          <thead>
                            <tr>
                              <th>{t("result.word")}</th>
                              <th>{t("result.frequency")}</th>
                              <th>{t("result.ratio")}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {Object.entries(
                              detectionResult.textAnalysis.wordFrequency
                            ).map(([word, count], index) => {
                              // 총 단어 수 계산
                              const totalWordCount = Object.values(
                                detectionResult.textAnalysis.wordFrequency
                              ).reduce((sum, count) => sum + count, 0);

                              return (
                                <tr key={index}>
                                  <td>{word}</td>
                                  <td>{count}</td>
                                  <td>
                                    {totalWordCount > 0
                                      ? Math.round(
                                          (count / totalWordCount) * 100
                                        )
                                      : 0}
                                    %
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* 문장 시작 패턴 */}
                  <div className="analysis-section">
                    <h4>{t("result.sentenceStartPattern")}</h4>
                    <div className="sentence-patterns">
                      {Object.entries(
                        detectionResult.textAnalysis.sentencePatterns
                      ).map(([pattern, count], index) => (
                        <div key={index} className="pattern-item">
                          <div className="pattern-text">"{pattern}"</div>
                          <div className="pattern-count">{count}회</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 제거 탭에서 결과 표시
  if (activeTab === "remove" && cleanedText) {
    const isDifferent = originalText !== cleanedText;

    return (
      <div className="result-section">
        <h2>{t("result.title")}</h2>

        <div className="result-card">
          <div className="result-header">
            <h3>
              {isDifferent
                ? t("result.watermarkRemoved")
                : t("result.noWatermarkToRemove")}
            </h3>
            <button
              className="copy-button"
              onClick={() => copyToClipboard(cleanedText, "cleaned")}
            >
              {copiedText === "cleaned"
                ? t("result.copied")
                : t("remover.copyButton")}
            </button>
          </div>

          <div className="result-content">
            <div className="text-comparison">
              <div className="text-panel">
                <h4>{t("result.originalText")}</h4>
                <div
                  ref={originalTextRef}
                  className="text-content diff-view"
                  dangerouslySetInnerHTML={{
                    __html: generateDiffHtml(originalText),
                  }}
                ></div>
              </div>
              <div className="text-panel">
                <h4>{t("result.cleanedText")}</h4>
                <div ref={cleanedTextRef} className="text-content">
                  {cleanedText}
                </div>
              </div>
            </div>

            {isDifferent && (
              <div className="diff-legend">
                <div className="diff-item">
                  <span className="removed-watermark-sample"></span>
                  <span>{t("result.removedWatermark")}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default ResultDisplay;
