import { useState, useEffect } from "react";
// ... (其他引入保持不變)

interface ScriptGenerationStepProps {
  scriptContent: string | null; // <-- 允許 null，表示內容尚未載入
  onPrev: () => void;
  onNext: () => void;
  isInitialLoading: boolean; // <-- 新增：從父元件接收初始載入狀態
}

const ScriptGenerationStep = ({ 
  scriptContent, 
  onPrev, 
  onNext,
  isInitialLoading // <-- 接收初始載入狀態
}: ScriptGenerationStepProps) => {
    
  // 內部狀態：用於用戶編輯腳本
  const [editableScript, setEditableScript] = useState(scriptContent || "");
  // 載入狀態：初始載入狀態由父元件控制
  const [isGenerating, setIsGenerating] = useState(isInitialLoading); 
  const [generationCount, setGenerationCount] = useState(0); 

  // 使用 useEffect 監聽父元件傳來的腳本內容變化
  useEffect(() => {
    if (scriptContent !== null && isInitialLoading) {
        // 如果腳本內容從父元件傳入，表示初始載入完成
        setEditableScript(scriptContent);
        setIsGenerating(false);
    } else if (scriptContent !== null && !isInitialLoading) {
        // 僅當腳本內容更新，且不是在初始載入時，才更新 editableScript
        setEditableScript(scriptContent);
    }
  }, [scriptContent, isInitialLoading]);


  // 重新生成邏輯 (generateScript) 保持不變，但應確保它也更新父元件的狀態
  const generateScript = () => {
    // ... 實際應用中，應再次觸發 API 呼叫 ...
    
    // 這裡使用模擬：
    setIsGenerating(true);
    setTimeout(() => {
      const regeneratedSample = `這是 AI 重新生成 (第 ${generationCount + 1} 次) 的腳本內容。`;
      setEditableScript(regeneratedSample); // 更新自己的狀態
      setIsGenerating(false);
      setGenerationCount(prev => prev + 1);
    }, 2000);
  };
  
  // ... (downloadScript 保持不變)

  // 決定 Textarea 顯示的內容
  const displayScript = isGenerating 
    ? "正在生成腳本，請稍候..." 
    : editableScript;

  return (
    <Card className="max-w-4xl mx-auto bg-accent/10 border-primary/20" style={{ boxShadow: 'var(--card-shadow)' }}>
      <CardContent className="p-8">
        <h2 className="text-2xl font-semibold text-foreground mb-2 text-center">
          影片腳本生成
        </h2>
        
        {/* ... (其他 UI 保持不變) */}
        
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
                    disabled={isGenerating || generationCount >= 3 || editableScript.trim() === ''} // 腳本未載入時禁用
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${isGenerating ? 'animate-spin' : ''}`} />
                    AI 重新生成({generationCount}/3)
                  </Button>
                </div>
              </div>
              
              <Textarea
                value={displayScript} // 使用計算後的 displayScript
                onChange={(e) => setEditableScript(e.target.value)}
                className="min-h-[300px] text-base resize-none border border-dashed border-primary/30 focus:border-dashed focus:border-primary/30 bg-card/80"
                disabled={isGenerating}
              />
            </CardContent>
          </Card>
          
          <div className="flex justify-center">
            <div className="flex space-x-4">
              {/* ... (按鈕邏輯：確保腳本載入完畢才可點擊) */}
              <Button 
                onClick={onNext}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-base font-medium"
                disabled={isGenerating || !editableScript}
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
