import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import realisticPhotoImg from "@/assets/style-realistic-photo-new.png";
import animation3dImg from "@/assets/style-3d-animation.jpg";
import japaneseHanddrawnImg from "@/assets/style-japanese-handdrawn.jpg";
import clayAnimationImg from "@/assets/style-clay-animation.jpg";
import paperCutImg from "@/assets/style-paper-cut.jpg";

const API_BASE = "https://dyscriptgenerator.onrender.com/genertate-script/"; // Render 後端位址


type GeneratePayload = {
  brand: string;
  topic: string;
  video_type: string;
  platform: string;
  aspect_ratio: string;
  visual_style: string;
};

type GenerateResponse = {
  script?: string;
  [k: string]: any;
};
interface VisualStyleStepProps {
  selectedStyle: string; // 目前未使用，可視情況移除
  selectedTechnique: string;
  selectedAspectRatio: string;

  // 這裡把前面步驟填好的欄位帶進來
  formValues: {
    brand: string;
    topic: string;
    video_type: string;
    platform: string;
  };
  onStyleChange: (value: string) => void;
  onTechniqueChange: (value: string) => void;
  onAspectRatioChange: (value: string) => void;

  // 新增：把 API 結果回傳父層（例如帶 script 進下一頁）
  onScriptReady: (data: GenerateResponse) => void;

  // 既有導頁
  onNext: () => void;
  onPrev: () => void;
}
// 如果後端想收到中文風格名稱，就用這個 map 轉換；否則可直接送 id
const visualStyleMap: Record<string, string> = {
  "realistic-photo": "寫實照片風格",
  "3d-animation": "3D動畫風格",
  "japanese-handdrawn": "日式手繪風格",
  "clay-animation": "立體黏土風格",
  "paper-cut": "剪紙風格",
};

const VisualStyleStep = ({
  selectedStyle,
  selectedTechnique,
  selectedAspectRatio,
  formValues,
  onStyleChange,
  onTechniqueChange,
  onAspectRatioChange,
  onScriptReady,
  onNext,
  onPrev,
}: VisualStyleStepProps) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const visualStyleForApi = useMemo(() => {
    // ▶ 若要送中文：回傳 visualStyleMap[selectedTechnique]
    // ▶ 若要送 id：回傳 selectedTechnique
    return visualStyleMap[selectedTechnique] ?? selectedTechnique;
  }, [selectedTechnique]);

  const handleGenerate = async () => {
    setErrMsg(null);

    // 基本檢查
    if (!API_BASE) {
      setErrMsg("尚未設定 VITE_API_BASE_URL");
      return;
    }
    if (!selectedTechnique || !selectedAspectRatio) {
      setErrMsg("請先選擇視覺風格與影片尺寸");
      return;
    }

    const payload: GeneratePayload = {
      brand: formValues.brand,
      topic: formValues.topic,
      video_type: formValues.video_type,
      platform: formValues.platform,
      aspect_ratio: selectedAspectRatio,
      visual_style: visualStyleForApi,
    };

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/generate-script`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // 若有需要 cookie 或跨網域憑證，可加上：
        // credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`API ${res.status}：${text}`);
      }

      const data: GenerateResponse = await res.json();

      // 把結果丟給父層（父層可存到 state，並進下一步頁面）
      onScriptReady(data);
      onNext();
    } catch (err: any) {
      setErrMsg(err?.message ?? "產生腳本失敗，請稍後再試");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="max-w-6xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: "var(--card-shadow)" }}>
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
                      : "hover:scale-105 hover:ring-2 hover:ring-primary/50"
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

          {errMsg && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-3">
              {errMsg}
            </div>
          )}

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={onPrev}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
              disabled={loading}
            >
              ← 上一步
            </Button>

            <Button
              onClick={handleGenerate}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
              disabled={loading}
            >
              {loading ? "產生中…" : "生成腳本"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { VisualStyleStep };
3) 父層用法（簡例）
tsx
Copy code
// 父層保有所有表單資料
const [brand, setBrand] = useState("");
const [topic, setTopic] = useState("");
const [videoType, setVideoType] = useState("");
const [platform, setPlatform] = useState("");
const [selectedTechnique, setSelectedTechnique] = useState("");
const [selectedAspectRatio, setSelectedAspectRatio] = useState("9:16");
const [scriptResult, setScriptResult] = useState<any>(null);

<VisualStyleStep
  selectedStyle="" // 若不用可移除
  selectedTechnique={selectedTechnique}
  selectedAspectRatio={selectedAspectRatio}
  formValues={{
    brand,
    topic,
    video_type: videoType,
    platform,
  }}
  onStyleChange={() => {}}
  onTechniqueChange={setSelectedTechnique}
  onAspectRatioChange={setSelectedAspectRatio}
  onScriptReady={(data) => setScriptResult(data)} // 這裡拿到後端回傳，例如 data.script
  onPrev={() => setStep(2)}
  onNext={() => setStep(4)} // 例如前往「預覽 / 編輯腳本」的頁面
/>
4) 後端（以 FastAPI 為例）記得開 CORS
py
Copy code
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://你的前端網域.com", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Payload(BaseModel):
    brand: str
    topic: str
    video_type: str
    platform: str
    aspect_ratio: str
    visual_style: str

@app.post("/generate-script")
def generate_script(p: Payload):
    # TODO: 呼叫你的 LLM / 生成邏輯
    return {"script": f"{p.brand} / {p.topic} / {p.video_type} / {p.platform
