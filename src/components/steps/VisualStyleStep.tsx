import React from 'react'; // 確保只導入 React
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";  
import realisticPhotoImg from "@/assets/style-realistic-photo-new.png";
import animation3dImg from "@/assets/style-3d-animation.jpg";
import japaneseHanddrawnImg from "@/assets/style-japanese-handdrawn.jpg";
import clayAnimationImg from "@/assets/style-clay-animation.jpg";
import paperCutImg from "@/assets/style-paper-cut.jpg";

// 1. 修正 Props 介面：只包含狀態和標準跳轉（與 Index.jsx 的簡化流程一致）
interface VisualStyleStepProps {
  selectedStyle: string;
  selectedTechnique: string;
  selectedAspectRatio: string;
  sceneCount: number;
  onStyleChange: (value: string) => void;
  onTechniqueChange: (value: string) => void;
  onAspectRatioChange: (value: string) => void;
  onSceneCountChange: (value: number) => void;

  // 恢復標準的 onNext 函數
  onNext: () => void; 
  onPrev: () => void;

  // 移除所有 API 相關的 Props，否則它們會接收到 undefined 導致崩潰
  // brand: string;
  // topic: string;
  // videoType: string;
  // platform: string;
  // onScriptGenerated: (scriptContent: string) => void;
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
  sceneCount,             
  onStyleChange, 
  onTechniqueChange,
  onAspectRatioChange,
  onSceneCountChange,      
  onPrev,
  onNext // <-- 接收 onNext
}: VisualStyleStepProps) => {

  // 確保所有必要項目都被選中，用於按鈕禁用
  // 這裡使用安全的空字串檢查，避免 .trim() 在 undefined 上執行
  const isFormValid = (selectedTechnique || "").trim() !== "" && (selectedAspectRatio || "").trim() !== "";

  return (
    <Card className="max-w-6xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-xl font-semibold text-primary mb-6 text-center">
          Q3. 請選擇希望影片呈現的風格與影像手法？
        </h2>
        
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

          
          {/* 分鏡數量 Slider */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              分鏡數量（Scenes）：{sceneCount} 個
            </h3>

            <div className="px-4">
              <Slider
                value={[sceneCount]}
                onValueChange={(val) => onSceneCountChange(val[0])}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
            </div>

            <div className="flex justify-between text-sm mt-2 text-muted-foreground px-1">
              <span>2</span>
              <span>4</span>
              <span>6</span>
              <span>8</span>
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
            {/* 恢復標準的 onNext 跳轉，並使用安全的禁用邏輯 */}
            <Button 
              onClick={onNext} 
              disabled={!isFormValid} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
            >
              生成腳本
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { VisualStyleStep };
