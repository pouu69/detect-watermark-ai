import { useState } from "react";
import { detectWatermarks, DetectionResult, generateWatermarkedText } from "../utils/watermarkUtils";
import "../styles/WatermarkDetector.scss";

interface WatermarkDetectorProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onDetectionResult: (result: DetectionResult | null) => void;
}

function WatermarkDetector({
  inputText,
  onInputChange,
  onDetectionResult,
}: WatermarkDetectorProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  const handleDetect = () => {
    if (!inputText.trim()) {
      alert("텍스트를 입력해주세요.");
      return;
    }

    console.log("분석 시작:", inputText);
    setIsLoading(true);

    // 워터마크 감지 처리 (비동기 처리를 시뮬레이션)
    setTimeout(() => {
      try {
        const result = detectWatermarks(inputText);
        console.log("감지 결과:", result);

        // 워터마크 감지율 계산 (mark.ai.kr 스타일)
        // 텍스트 길이에 따라 워터마크 수를 정규화하여 백분율 계산
        if (result.hasWatermarks) {
          const textLength = inputText.length;
          const normalizedCount = Math.min(
            result.totalCount / (textLength * 0.01),
            100
          );
          const detectionRate = Math.max(
            Math.min(Math.round(normalizedCount * 100), 98),
            70
          );
          result.detectionRate = detectionRate;
          console.log("감지율:", detectionRate);
        } else {
          result.detectionRate = 0;
          console.log("워터마크 없음");
        }

        onDetectionResult(result);
        console.log("결과 전달 완료");
      } catch (error) {
        console.error("워터마크 감지 중 오류 발생:", error);
        alert("워터마크 감지 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }, 800); // 0.8초 지연으로 처리 시간 시뮬레이션
  };

  return (
    <div className="watermark-detector">
      <div className="text-area-container">
        <label htmlFor="input-text">분석할 텍스트 붙여넣기</label>
        <textarea
          id="input-text"
          value={inputText}
          onChange={handleInputChange}
          placeholder="GPT 모델로 생성된 텍스트인지 확인하려면 여기에 붙여넣으세요."
        />
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleDetect}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? "분석 중..." : "텍스트 분석하기"}
        </button>
        
        <button
          className="btn btn-secondary"
          onClick={() => {
            if (inputText.trim()) {
              const watermarkedText = generateWatermarkedText(inputText);
              console.log("워터마크 추가됨:", watermarkedText);
              onInputChange(watermarkedText);
              
              // 워터마크 추가 후 자동으로 감지 실행
              setTimeout(() => {
                try {
                  console.log("워터마크 감지 시작");
                  const result = detectWatermarks(watermarkedText);
                  console.log("자동 감지 결과:", result);
                  
                  if (result.hasWatermarks) {
                    const textLength = watermarkedText.length;
                    const normalizedCount = Math.min(
                      result.totalCount / (textLength * 0.01),
                      100
                    );
                    const detectionRate = Math.max(
                      Math.min(Math.round(normalizedCount * 100), 98),
                      70
                    );
                    result.detectionRate = detectionRate;
                    console.log("감지율 계산:", detectionRate);
                  } else {
                    result.detectionRate = 0;
                    console.log("워터마크 없음");
                  }
                  
                  console.log("결과 전달 직전:", result);
                  onDetectionResult(result);
                  console.log("결과 전달 완료");
                  
                  // 강제로 UI 업데이트 트리거
                  setTimeout(() => {
                    console.log("UI 업데이트 트리거");
                    const event = new Event('resize');
                    window.dispatchEvent(event);
                  }, 100);
                } catch (error) {
                  console.error("워터마크 감지 중 오류 발생:", error);
                }
              }, 500);
            } else {
              alert("텍스트를 먼저 입력해주세요.");
            }
          }}
          disabled={isLoading || !inputText.trim()}
        >
          테스트용 워터마크 추가
        </button>
      </div>
    </div>
  );
}

export default WatermarkDetector;
