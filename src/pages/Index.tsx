import { useState } from "react";
import { Header } from "@/components/Header";
import { ProgressSteps } from "@/components/ProgressSteps";
import { CompanyInfoStep } from "@/components/steps/CompanyInfoStep";
import { VideoTypeStep } from "@/components/steps/VideoTypeStep";
import { VisualStyleStep } from "@/components/steps/VisualStyleStep";
import { ScriptGenerationStep } from "@/components/steps/ScriptGenerationStep";
import { ImageGenerationStep } from "@/components/steps/ImageGenerationStep";
import { VideoGenerationStep } from "@/components/steps/VideoGenerationStep";

// 定義 API URL，這與 VisualStyleStep.tsx 中使用的 URL 相同
const API_URL = "https://dyscriptgenerator.onrender.com/generate-script";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyInfo: "", // 應包含 brand 和 topic
    videoType: "",
    targetPlatform: "",
    visualStyle: "",
    videoTechniques: "",
    aspectRatio: "16:9",
  });
  
  // 【新增狀態 1: 儲存 AI 生成的腳本內容】
  const [generatedScript, setGeneratedScript] = useState<string | null>(null); 
  // 【新增狀態 2: 處理腳本的初始生成載入特效】
  const [isScriptGenerating, setIsScriptGenerating] = useState(false); 

  const updateFormData = (key: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 【新增核心函數: 處理 API 呼叫、跳轉和特效】
  const handleScriptGeneration = async (payload: any) => {
    
    // 1. 立即啟動載入特效，並跳轉到腳本生成頁面 (步驟 4)
    setIsScriptGenerating(true);
    setCurrentStep(4); 

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
      
      // 2. 成功後，儲存腳本內容
      if (data && data.result) {
        setGeneratedScript(data.result); 
      } else {
        throw new Error("API 回應格式錯誤或內容為空。");
      }

    } catch (e: any) {
      console.error("生成腳本失敗:", e);
      // 處理錯誤：在腳本顯示頁面顯示錯誤訊息
      const errorMessage = (e instanceof Error) ? e.message : String(e);
      setGeneratedScript(`腳本生成失敗：${errorMessage}`); // 將錯誤訊息儲存到腳本狀態中
      
    } finally {
      // 3. API 完成後，關閉載入特效
      setIsScriptGenerating(false);
    }
  };

  const renderCurrentStep = () => {
    // 假設 formData.companyInfo 格式為 "品牌名稱 / 主題內容"
    const [brand = '', topic = ''] = (formData.companyInfo as string).split(' / ');
    
    switch (currentStep) {
      // ... case 1 保持不變 ...
      case 2:
        return (
          <VideoTypeStep
            videoType={formData.videoType}
            targetPlatform={formData.targetPlatform}
            onVideoTypeChange={(value) => updateFormData("videoType", value)}
            onTargetPlatformChange={(value) => updateFormData("targetPlatform", value)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 3:
        return (
          // 【修改: 傳遞狀態和 API 處理函數給 VisualStyleStep】
          <VisualStyleStep
            selectedStyle={formData.visualStyle}
            selectedTechnique={formData.videoTechniques}
            selectedAspectRatio={formData.aspectRatio}
            onStyleChange={(value) => updateFormData("visualStyle", value)}
            onTechniqueChange={(value) => updateFormData("videoTechniques", value)}
            onAspectRatioChange={(value) => updateFormData("aspectRatio", value)}
            onPrev={prevStep}
            
            // 傳遞來自前兩步的數據
            brand={brand}
            topic={topic}
            videoType={formData.videoType}
            platform={formData.targetPlatform} // 假設 targetPlatform 對應 API 的 platform 欄位
            
            // 傳遞新的 API 處理函數
            onGenerateScript={handleScriptGeneration} 
            isGenerating={isScriptGenerating}
          />
        );
      case 4:
        return (
          // 【修改: 傳遞腳本內容和載入狀態給 ScriptGenerationStep】
          <ScriptGenerationStep
            scriptContent={generatedScript} // 傳遞腳本內容
            isInitialLoading={isScriptGenerating} // 傳遞載入狀態
            onPrev={prevStep}
            onNext={nextStep}
          />
        );
      // ... case 5, 6 保持不變 ...
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--gradient-bg)' }}>
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary mb-4">
            影片腳本生成器
          </h1>
          <p className="text-lg text-muted-foreground">
            透過 AI 驅動的技術，讓您輕鬆打造專業級影片腳本
          </p>
        </div>
        <ProgressSteps 
          currentStep={currentStep} 
          totalSteps={6}
          onStepClick={(step) => {
            if (step <= currentStep) {
              setCurrentStep(step);
            }
          }}
        />
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </main>
      <footer className="text-primary-foreground text-center py-6 mt-16" style={{ background: 'var(--footer-bg)' }}>
        <p>© 2025 Video Script Generator</p>
      </footer>
    </div>
  );
};

export default Index;
