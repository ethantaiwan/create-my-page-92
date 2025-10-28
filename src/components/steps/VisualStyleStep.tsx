import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import realisticPhotoImg from "@/assets/style-realistic-photo-new.png";
import animation3dImg from "@/assets/style-3d-animation.jpg";
import japaneseHanddrawnImg from "@/assets/style-japanese-handdrawn.jpg";
import clayAnimationImg from "@/assets/style-clay-animation.jpg";
import paperCutImg from "@/assets/style-paper-cut.jpg";

interface VisualStyleStepProps {
  selectedStyle: string;
  selectedTechnique: string;
  selectedAspectRatio: string;
  onStyleChange: (value: string) => void;
  onTechniqueChange: (value: string) => void;
  onAspectRatioChange: (value: string) => void;
  onPrev: () => void;

  brand: string;
  topic: string;
  videoType: string;
  platform: string;

  // 成功後，由父元件 (Index) 提供的跳轉和數據儲存函數
  onScriptGenerated: (scriptContent: string) => void;
}

const videoTechniques = [
  { id: "realistic-photo", label: "寫實照片風格", image: realisticPhotoImg },
  { id: "3d-animation", label: "3D動畫風格", image: animation3dImg },
  { id: "japanese-handdrawn", label: "日式手繪風格", image: japaneseHanddrawnImg },
  { id: "clay-animation", label: "立體黏土風格", image: clayAnimationImg },
  { id: "paper-cut", label: "剪紙風格", image: paperCutImg },
];

const aspectRatios = [
  { id: "9:16", label: "9:16" },
  { id: "16:9", label: "16:9" },
  { id: "1:1", label: "1:1" },
  { id: "3:4", label: "3:4" },
  { id: "4:3", label: "4:3" },
];

const VisualStyleStep = ({ 
  selectedStyle, 
  selectedTechnique,
  selectedAspectRatio,
  onStyleChange, 
  onTechniqueChange,
  onAspectRatioChange,
  onPrev,
  brand, 
  topic, 
  videoType, 
  platform, 
  onScriptGenerated, // 成功後的跳轉函數
}: VisualStyleStepProps) => {

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 確保 visualStyleLabel 的計算不會在元件頂層引起副作用
  const selectedVisual = videoTechniques.find((tech) => tech.id === selectedTechnique);
  const visualStyleLabel = selectedVisual ? selectedVisual.label : selectedTechnique;

  // <-- 處理腳本生成服務的呼叫
  const handleGenerateScript = async () => {
    // 檢查是否有選取風格和尺寸
    if (!selectedTechnique || !selectedAspectRatio) {
      setError("請務必選擇視覺風格與影片尺寸。");
      return;
    }

    // 檢查 API 呼叫需要的核心參數是否為空 (安全檢查)
    if (!brand || !topic || !videoType || !platform) {
      setError("缺少品牌、主題或平台資訊，請返回上一步。");
      return;
    }

    setIsGenerating(true);
    setError(null);

    const payload = {
      brand: brand, 
      topic: topic,
      video_type: videoType,
      platform: platform,
      aspect_ratio: selectedAspectRatio,
      visual_style: visualStyleLabel,
      tone: "自然、溫暖、貼近日常口語", // 固定參數
    };
    
    console.log("--- 最終 API Payload 準備傳送 ---");
    console.log(payload);
    console.log("--------------------------------");
    
    const API_URL = "https://dyscriptgenerator.onrender.com/generate-script";

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        let errorDetail = `狀態碼: ${response.status}`;
        try {
          const errorData = await response.json();
          if (errorData && errorData.detail) {
            errorDetail += ` (詳情: ${JSON.stringify(errorData.detail)})`;
          }
        } catch (e) {
          console.error("無法解析錯誤響應體:", e);
        }

        throw new Error(`HTTP 錯誤! ${errorDetail}`);
      }

      const data = await response.json();
      
      console.log("API 成功回傳的 data.result 內容:", data.result);
      
      // ----------------------------------------------------
      // 格式修正：只從 data.result 獲取字串內容並檢查
      // ----------------------------------------------------
      const scriptContent = data && data.result;

      if (typeof scriptContent === 'string' && scriptContent.trim() !== '') {
        // 成功獲取腳本內容後，呼叫父元件的跳轉函數
        onScriptGenerated(scriptContent); // 👈 觸發跳轉
      } else {
        throw new Error("API 回應未包含預期的腳本內容（result 鍵為空）。");
      }

    } catch (e: any) {
      // 執行錯誤修正：安全地處理錯誤物件
      const errorMessage = (e instanceof Error) ? e.message : String(e);
      console.error("腳本生成失敗:", e);
      setError(`腳本生成失敗: ${errorMessage}。請檢查網路或稍後再試。`);
    } finally {
      // 將 finally 放在最外層，確保無論如何都會執行
      setIsGenerating(false);
    }
  };

  return (
    <Card className="max-w-6xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-primary mb-6 text-center">
          Q3. 請選擇希望影片呈現的風格與影像手法？
        </h2>
        
        {/* 新增: 錯誤訊息顯示 */}
        {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
                {error}
            </div>
        )}
        
        <div className="space-y-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">視覺風格</h3>
            <div className="grid grid-cols-5 gap-4">
              {videoTechniques.map((technique) => (
                <button
                  key={technique.id}
                  onClick={() => onTechniqueChange(technique.id)}
                  className={`aspect-[3/2] rounded-lg overflow-hidden relative transition-all ${
                    selectedTechnique === technique.id
                      ? "ring-4 ring-primary scale-105"
                      : "hover:scale-102 hover:ring-2 hover:ring-primary/50"
                  }`}
                >
                  <img 
                    src={technique.image} 
                    alt={technique.label}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <span className="text-sm font-medium text-white">{technique.label}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">生成影片尺寸</h3>
            <div className="flex justify-center gap-4">
              {aspectRatios.map((ratio) => (
                <button
                  key={ratio.id}
                  onClick={() => onAspectRatioChange(ratio.id)}
                  className={`px-8 py-3 rounded-full border-2 transition-all duration-300 font-medium ${
                    selectedAspectRatio === ratio.id
                      ? "border-primary bg-primary text-primary-foreground shadow-lg scale-105"
                      : "border-primary/30 bg-card/60 text-foreground hover:border-primary/50 hover:bg-primary/5 hover:scale-105"
                  }`}
                >
                  {ratio.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button 
              variant="outline"
              onClick={onPrev}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
            >
              ← 上一步
            </Button>
            <Button 
              onClick={handleGenerateScript} // 點擊按鈕執行 API 呼叫
              disabled={isGenerating || !selectedTechnique || !selectedAspectRatio} // 確保填寫完整才可點擊
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
            >
              {isGenerating ? "生成中..." : "生成腳本"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { VisualStyleStep };
