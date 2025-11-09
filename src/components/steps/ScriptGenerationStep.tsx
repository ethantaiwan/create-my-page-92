import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Download, Image } from "lucide-react";


const API_URL = "https://dyscriptgenerator.onrender.com/generate-script"; // 🚨 確保 API URL 可用

// 修正 Props 介面：接收所有 API 所需的參數
interface ScriptGenerationStepProps {
  brand: string;
  topic: string;
  videoType: string; 
  platform: string;
  aspectRatio: string;
  visualStyle: string; 
  videoTechniques: string;
  onPrev: () => void;
  onNext: (script: string) => void; 
}

const ScriptGenerationStep = ({ 
    brand, topic, videoType, platform, aspectRatio, visualStyle, videoTechniques,
    onPrev, onNext 
}: ScriptGenerationStepProps) => {
    
  // 內部狀態：用於管理載入和腳本內容
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  // 【核心函數：在 Component 內部執行 API 呼叫】
  const generateScript = async () => {
    setIsGenerating(true);
    
    // 檢查核心參數是否為空 (安全檢查)
    console.log("--- [除錯] 檢查 ScriptGenerationStep 接收到的 Props ---");
    console.log("Brand:", brand);
    console.log("Topic:", topic);
    console.log("Video Type:", videoType);
    console.log("Platform:", platform);
    console.log("Aspect Ratio:", aspectRatio);
    console.log("Visual Style:", visualStyle);
    console.log("videoTechniques", videoTechniques);
    console.log("-------------------------------------------------");
    if (!brand || !topic || !videoType || !platform || !aspectRatio || !videoTechniques) {
        setGeneratedScript("錯誤：缺少必要的表單資訊，請返回上一步。");
        setIsGenerating(false);
        return;
    }

    const payload = {
        brand, topic, video_type: videoType, platform, aspect_ratio: aspectRatio,
        visual_style: visualStyle,
        video_techniques: "videoTechniques q.q",
        tone: "自然、溫暖、貼近日常口語",
    };

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
             throw new Error(`API 錯誤: ${response.status}`);
        }

        const data = await response.json();
        
        if (data && data.result) {
            console.log("結果是:", data.result)
            setGeneratedScript(data.result); 
        } else {
            throw new Error("API 回應未包含預期的 'result' 鍵。");
        }

    } catch (e: any) {
        console.error("腳本生成失敗:", e);
        const errorMessage = (e instanceof Error) ? e.message : String(e);
        setGeneratedScript(`腳本生成失敗：${errorMessage}`);
    } finally {
        setIsGenerating(false);
        // 首次生成時設為 1，之後遞增
        setGenerationCount(prev => (prev === 0 ? 1 : prev + 1)); 
    }
  };

  // 【自動執行】: 元件載入後立即執行一次腳本生成
  useEffect(() => {
    generateScript();
  }, [brand, topic, videoType, platform, aspectRatio, visualStyle]); // 確保在父元件數據改變時重新生成

  // 【下載文字腳本函數】 - 完整且唯一的實現
  const downloadScript = () => {
    // 檢查是否有腳本內容可以下載
    if (!generatedScript || generatedScript.trim() === "" || generatedScript.startsWith("腳本生成失敗")) {
        console.error("無法下載：腳本內容無效。");
        return;
    }
    
    const element = document.createElement('a');
    const file = new Blob([generatedScript], { type: 'text/plain;charset=utf-8' });
    
    element.href = URL.createObjectURL(file);
    element.download = 'generate-script.txt';
    
    document.body.appendChild(element);
    element.click();
    
    // 清理：釋放 Blob URL 和移除元素
    URL.revokeObjectURL(element.href);
    document.body.removeChild(element);
  };
    
  // 修正：確保 displayScript 被定義
  const displayScript = isGenerating 
    ? "正在生成腳本，請稍候..." 
    : generatedScript;


  return (
    <Card className="max-w-4xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
          影片腳本生成
        </h2>
        
        <p className="text-center text-muted-foreground mb-8">
          依據您提供的資訊，AI已為您產生影片腳本。您可以在下方編輯、調整或重新生成腳本內容。
        </p>
        
        <div className="space-y-6">
          <Card className="bg-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">AI腳本生成結果</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateScript}
                    disabled={isGenerating || (generationCount > 0 && generationCount >= 3)} // 限制重新生成次數
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    AI 重新生成({generationCount}/3)
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={displayScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                className="min-h-[300px] text-base resize-none border border-dashed border-primary/30 focus:border-dashed focus:border-primary/30 bg-card/80"
                disabled={isGenerating}
              />
            </CardContent>
          </Card>
          
          {/* 【恢復導航按鈕】 */}
          <div className="flex justify-center">
            <div className="flex space-x-4">
              <Button 
                variant="outline"
                onClick={onPrev}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
              >
                ← 上一步
              </Button>
              <Button 
                onClick={downloadScript}
                variant="outline"
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating || !generatedScript || generatedScript.startsWith("腳本生成失敗")}
              >
                <Download className="w-4 h-4 mr-2" />
                下載文字腳本
              </Button>
              <Button 
                onClick={() => onNext(generatedScript)}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating || !generatedScript || generatedScript.startsWith("腳本生成失敗")}
              >
                <Image className="w-4 h-4 mr-2" />
                生成照片
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { ScriptGenerationStep };
