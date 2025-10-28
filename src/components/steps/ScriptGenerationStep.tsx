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
  onPrev: () => void;
  onNext: () => void;
}

const ScriptGenerationStep = ({ 
    brand, topic, videoType, platform, aspectRatio, visualStyle,
    onPrev, onNext 
}: ScriptGenerationStepProps) => {
    
  // 內部狀態：用於管理載入和腳本內容
  const [generatedScript, setGeneratedScript] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationCount, setGenerationCount] = useState(0);

  // 【核心函數：在 Component 內部執行 API 呼叫】
  const generateScript = async () => {
    setIsGenerating(true);
    
    const payload = {
        brand, topic, video_type: videoType, platform, aspect_ratio: aspectRatio,
        visual_style: visualStyle,
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
        if (generationCount === 0) {
             setGenerationCount(1); // 首次生成完成
        } else {
             setGenerationCount(prev => prev + 1); // 重新生成次數
        }
    }
  };

  // 【自動執行】: 元件載入後立即執行一次腳本生成
  useEffect(() => {
    generateScript();
  }, []); // 僅在 mount 時執行一次

  const downloadScript = () => { /* ... (保持不變) ... */ };

  const displayScript = isGenerating 
    ? "正在生成腳本，請稍候..." 
    : generatedScript;

  return (
    <Card className="max-w-4xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        {/* ... (標題和文字保持不變) ... */}
        
        <div className="space-y-6">
          <Card className="bg-accent/10 border-primary/20">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-primary">AI腳本生成結果</h3>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={generateScript} // 點擊按鈕，再次執行 API
                    disabled={isGenerating || generationCount >= 3} 
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
          
          {/* ... (導航按鈕部分保持不變) ... */}
        </div>
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
                onClick={onNext}
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
