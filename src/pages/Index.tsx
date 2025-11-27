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
        aspectRatio: "",
        sceneCount: 4,   // ⭐⭐⭐ 必須有預設值（不能 undefined）
    });

    const [generatedScript, setGeneratedScript] = useState<string | null>(null); 
    const [isScriptGenerating, setIsScriptGenerating] = useState(false); 
    
    // ----------------------------------------------------
    //  通用狀態更新函數 (已修改，支援單鍵更新和物件合併)
    // ----------------------------------------------------
    const handleScriptNext = (script: string) => {
        // 將 data.result (腳本) 儲存到父組件的 state 中
        setGeneratedScript(script); 
        
        // 執行通用的 "下一步"
        nextStep(); 
    };
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
    // Index.jsx 內的 handleScriptGeneration 函數

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
                    <VisualStyleStep
                        // 只需要傳遞狀態和跳轉函數
                        selectedTechnique={formData.videoTechniques}
                        selectedAspectRatio={formData.aspectRatio}
                        sceneCount={formData.sceneCount} 
                        onTechniqueChange={(value) => updateFormData("videoTechniques", value)}
                        onAspectRatioChange={(value) => updateFormData("aspectRatio", value)}
                        onSceneCountChange={(value) => updateFormData("sceneCount", value)} 

                        // 恢復標準跳轉
                        onNext={nextStep} // <--- 關鍵：使用 onNext
                        onPrev={prevStep}
                    />
                );
                        
                        // 刪除不再需要的 API 相關 props
                        // brand={formData.brand}
                        // topic={formData.topic}
                        // videoType={formData.videoType}
                        // platform={formData.targetPlatform}
                        // onGenerateScript={handleScriptGeneration}
                        // isGenerating={isScriptGenerating}
            case 4:
                return (
                    <ScriptGenerationStep
                        // ... (brand, topic, videoType, platform, aspectRatio 保持不變) ...
                        brand={formData.brand}
                        topic={formData.topic}
                        videoType={formData.videoType}
                        platform={formData.targetPlatform} 
                        aspectRatio={formData.aspectRatio}
                        videoTechniques={formData.videoTechniques}
                        sceneCount={formData.sceneCount}   
                        onPrev={prevStep}
                        onNext={handleScriptNext}
                    />
                );   
            case 5:
                if (!generatedScript) {
                    // 如果腳本不存在，顯示錯誤或返回上一步
                    return (
                        <div>
                            <p>錯誤：沒有腳本數據。請返回上一步。</p>
                            <Button onClick={prevStep}>返回上一步</Button>
                        </div>
                    );
                }
                // 如果腳本存在，才渲染 ImageGenerationStep
                return (
                    <ImageGenerationStep
                        scriptResult={generatedScript} // (這部分您是正確的)
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
