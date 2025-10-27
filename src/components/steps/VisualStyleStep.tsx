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

  // ✅ 改成由父層處理 API 與跳轉
  onGenerateScript: (payload: {
    brand: string;
    topic: string;
    video_type: string;
    platform: string;
    aspect_ratio: string;
    visual_style: string;
    tone: string;
  }) => void;

  // ✅ 由父層告知目前是否在呼叫 API
  isGenerating: boolean;
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
  onGenerateScript,   // ✅ 用這個
  isGenerating,       // ✅ 父層控制 loading
}: VisualStyleStepProps) => {
  const [error, setError] = useState<string | null>(null);

  const selectedVisual = videoTechniques.find((t) => t.id === selectedTechnique);
  const visualStyleLabel = selectedVisual ? selectedVisual.label : selectedTechnique;

  const handleGenerateScript = () => {
    if (!selectedTechnique || !selectedAspectRatio) {
      setError("請務必選擇視覺風格與影片尺寸。");
      return;
    }
    setError(null);

    const payload = {
      brand,
      topic,
      video_type: videoType,
      platform,
      aspect_ratio: selectedAspectRatio,
      visual_style: visualStyleLabel,
      tone: "自然、溫暖、貼近日常口語",
    };

    console.log("[VisualStyleStep] 送給父層的 payload:", payload);

    // ✅ 把工作交給父層（父層會：切到 Step 4、打 API、把結果塞進 ScriptGenerationStep）
    onGenerateScript(payload);
  };

  return (
    <Card className="max-w-6xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-primary mb-6 text-center">
          Q3. 請選擇希望影片呈現的風格與影像手法？
        </h2>

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
                  <img src={technique.image} alt={technique.label} className="w-full h-full object-cover" />
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
              onClick={handleGenerateScript}
              disabled={isGenerating}
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
