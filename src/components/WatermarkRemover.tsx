import { useState } from "react";
import { removeWatermarks } from "../utils/watermarkUtils";
import "../styles/WatermarkRemover.scss";

interface WatermarkRemoverProps {
  inputText: string;
  onInputChange: (text: string) => void;
  onRemovalResult: (cleanedText: string) => void;
}

function WatermarkRemover({
  inputText,
  onInputChange,
  onRemovalResult,
}: WatermarkRemoverProps) {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
  };

  const handleRemove = () => {
    if (!inputText.trim()) {
      alert("텍스트를 입력해주세요.");
      return;
    }

    setIsLoading(true);

    // 워터마크 제거 처리 (비동기 처리를 시뮬레이션)
    setTimeout(() => {
      try {
        const cleanedText = removeWatermarks(inputText);
        onRemovalResult(cleanedText);
      } catch (error) {
        console.error("워터마크 제거 중 오류 발생:", error);
        alert("워터마크 제거 중 오류가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    }, 800); // 0.8초 지연으로 처리 시간 시뮬레이션
  };

  return (
    <div className="watermark-remover">
      <div className="text-area-container">
        <label htmlFor="input-text-remove">워터마크 제거할 텍스트 붙여넣기</label>
        <textarea
          id="input-text-remove"
          value={inputText}
          onChange={handleInputChange}
          placeholder="AI 생성 텍스트의 워터마크를 제거하려면 여기에 붙여넣으세요."
        />
      </div>

      <div className="button-group">
        <button
          className="btn btn-primary"
          onClick={handleRemove}
          disabled={isLoading || !inputText.trim()}
        >
          {isLoading ? "처리 중..." : "워터마크 제거하기"}
        </button>
      </div>
    </div>
  );
}

export default WatermarkRemover;
