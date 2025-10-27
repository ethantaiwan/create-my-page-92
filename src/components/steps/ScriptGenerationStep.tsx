import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Download, Image } from "lucide-react";

// 1. 修改 Props 介面：移除 formData，新增 scriptContent
interface ScriptGenerationStepProps {
  scriptContent: string; // <-- 新增：接收已生成的腳本字串
  onPrev: () => void;
  onNext: () => void;
}

const ScriptGenerationStep = ({ 
  scriptContent, // <-- 解構賦值以接收 scriptContent
  onPrev, 
  onNext 
}: ScriptGenerationStepProps) => {
    
  // 2. 使用傳入的 scriptContent 初始化狀態
  // 將 isGenerating 初始值設為 false，因為腳本已經生成
  const [generatedScript, setGeneratedScript] = useState(scriptContent);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // 由於是重新生成，這裡的計數器可以保留，但初始值設為 0
  const [generationCount, setGenerationCount] = useState(0); 

  // ⚠️ 注意：原 generateScript 函數保留但需要修改其內容
  // 在真實應用中，點擊「重新生成」按鈕應該再次呼叫 AI API，
  // 這裡為了讓程式碼可運行，使用模擬內容。
  const generateScript = () => {
    // ⚠️ 實際應用中，這裡應是再次呼叫 API
    setIsGenerating(true);
    
    // Simulate AI generation delay
    setTimeout(() => {
      // 替換為重新生成的模擬腳本 (或再次呼叫您的 AI 服務)
      const regeneratedSample = `這是 AI 重新生成 (第 ${generationCount + 1} 次) 的腳本內容。
新的視覺風格、新的描述...請在此填入重新呼叫 API 取得的結果。`;

      setGeneratedScript(regeneratedSample);
      setIsGenerating(false);
      setGenerationCount(prev => prev + 1);
    }, 2000);
  };

  const downloadScript = () => {
    const element = document.createElement('a');
    const file = new Blob([generatedScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'video-script.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // 移除 useEffect(() => { generateScript(); }, []); 
  // 因為腳本已經由上一步傳入並初始化了狀態，不需要自動生成。

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
                    disabled={isGenerating || generationCount >= 3} // 限制重新生成次數
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    AI 重新生成({generationCount}/3)
                  </Button>
                </div>
              </div>
              
              <Textarea
                // 顯示 loading 狀態或已生成的腳本
                value={isGenerating ? "正在生成腳本，請稍候..." : generatedScript}
                onChange={(e) => setGeneratedScript(e.target.value)}
                className="min-h-[300px] text-base resize-none border border-dashed border-primary/30 focus:border-dashed focus:border-primary/30 bg-card/80"
                disabled={isGenerating}
              />
            </CardContent>
          </Card>
          
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
                disabled={isGenerating || !generatedScript}
              >
                <Download className="w-4 h-4 mr-2" />
                下載文字腳本
              </Button>
              <Button 
                onClick={onNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating || !generatedScript}
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
