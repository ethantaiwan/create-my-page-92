import { useState } from "react";
import { Header } from "@/components/Header";
import { ProgressSteps } from "@/components/ProgressSteps";
import { CompanyInfoStep } from "@/components/steps/CompanyInfoStep";
import { VideoTypeStep } from "@/components/steps/VideoTypeStep";
import { VisualStyleStep } from "@/components/steps/VisualStyleStep";
import { ScriptGenerationStep } from "@/components/steps/ScriptGenerationStep";
import { ImageGenerationStep } from "@/components/steps/ImageGenerationStep";
import { VideoGenerationStep } from "@/components/steps/VideoGenerationStep";

const API_URL = "https://dyscriptgenerator.onrender.com/generate-script";

const Index = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState({
        // 【修正點 1: 將 companyInfo 替換為 brand 和 topic】
        brand: "",
        topic: "",
        videoType: "",
        targetPlatform: "",
        visualStyle: "",
        videoTechniques: "",
        aspectRatio: "16:9",
    });

    const [generatedScript, setGeneratedScript] = useState<string | null>(null); 
    const [isScriptGenerating, setIsScriptGenerating] = useState(false); 
    
    // ----------------------------------------------------
    //  通用狀態更新函數 (已修改，支援單鍵更新和物件合併)
    // ----------------------------------------------------
    const updateFormData = (key, value) => {
        // 處理 CompanyInfoStep 傳入的物件 {brand: v1, topic: v2}
        if (typeof key === 'object' && key !== null) {
             setFormData(prev => ({ ...prev, ...key }));
        } else {
             setFormData(prev => ({ ...prev, [key]: value }));
        }
    };

    const nextStep = () => {
        if (currentStep < 6) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            // 由於跳轉回來時數據可能已經載入，這裡不做特殊處理，讓用戶自己決定是否重設
            setCurrentStep(currentStep - 1);
        }
    };

    // ----------------------------------------------------
    //  核心 API 處理函數
    // ----------------------------------------------------
    const handleScriptGeneration = async (payload) => {
        
        setGeneratedScript(null); // 清空舊的腳本結果
        setIsScriptGenerating(true);
        setCurrentStep(4); // 立即跳轉到載入畫面

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                let errorDetail = `狀態碼: ${response.status}`;
                try {
                    const errorData = await response.json();
                    if (errorData && errorData.detail) {
                        errorDetail += ` (詳情: ${JSON.stringify(errorData.detail)})`;
                    }
                } catch (e) { /* 忽略解析錯誤 */ }
                
                throw new Error(`HTTP 錯誤! ${errorDetail}`);
            }

            const data = await response.json();
            
            if (data && data.result) {
                setGeneratedScript(data.result); 
            } else {
                throw new Error("API 回應未包含預期的 'result' 鍵。");
            }

        } catch (e) {
            console.error("生成腳本失敗:", e);
            const errorMessage = (e instanceof Error) ? e.message : String(e);
            setGeneratedScript(`腳本生成失敗：${errorMessage}`);
            
        } finally {
            setIsScriptGenerating(false);
        }
    };

    // ----------------------------------------------------
    //  渲染邏輯
    // ----------------------------------------------------
    const renderCurrentStep = () => {
        
        switch (currentStep) {
            case 1:
                return (
                    // 【傳遞給 CompanyInfoStep 的 Props】
                    <CompanyInfoStep
                        brand={formData.brand}
                        topic={formData.topic}
                        // onChange 接收 {brand, topic} 物件
                        onChange={(data) => updateFormData(data, null)} 
                        onNext={nextStep}
                    />
                );
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
                    // 【傳遞給 VisualStyleStep 的 Props】
                    <VisualStyleStep
                        selectedStyle={formData.visualStyle}
                        selectedTechnique={formData.videoTechniques}
                        selectedAspectRatio={formData.aspectRatio}
                        onStyleChange={(value) => updateFormData("visualStyle", value)}
                        onTechniqueChange={(value) => updateFormData("videoTechniques", value)}
                        onAspectRatioChange={(value) => updateFormData("aspectRatio", value)}
                        onPrev={prevStep}
                        
                        // 直接傳遞獨立的 brand 和 topic
                        brand={formData.brand}
                        topic={formData.topic}
                        videoType={formData.videoType}
                        platform={formData.targetPlatform} 
                        
                        onGenerateScript={handleScriptGeneration} // 觸發 API 
                        isGenerating={isScriptGenerating}
                    />
                );
            case 4:
                return (
                    // 【傳遞給 ScriptGenerationStep 的 Props】
                    <ScriptGenerationStep
                        scriptContent={generatedScript} // 腳本內容
                        isInitialLoading={isScriptGenerating} // 載入狀態
                        onPrev={prevStep}
                        onNext={nextStep}
                    />
                );
            case 5:
                return (
                    <ImageGenerationStep
                        formData={formData}
                        onPrev={prevStep}
                        onNext={nextStep}
                    />
                );
            case 6:
                return (
                    <VideoGenerationStep
                        formData={formData}
                        onPrev={prevStep}
                    />
                );
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
