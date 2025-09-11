import { useState } from "react";
import { Header } from "@/components/Header";
import { ProgressSteps } from "@/components/ProgressSteps";
import { CompanyInfoStep } from "@/components/steps/CompanyInfoStep";
import { VideoTypeStep } from "@/components/steps/VideoTypeStep";
import { VisualStyleStep } from "@/components/steps/VisualStyleStep";
import { ScriptGenerationStep } from "@/components/steps/ScriptGenerationStep";

const Index = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    companyInfo: "",
    videoType: "",
    targetPlatform: "",
    visualStyle: "",
    videoTechniques: [] as string[],
  });

  const updateFormData = (key: keyof typeof formData, value: string | string[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CompanyInfoStep
            value={formData.companyInfo}
            onChange={(value) => updateFormData("companyInfo", value)}
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
            selectedStyle={formData.visualStyle}
            selectedTechniques={formData.videoTechniques}
            onStyleChange={(value) => updateFormData("visualStyle", value)}
            onTechniquesChange={(value) => updateFormData("videoTechniques", value)}
            onNext={nextStep}
            onPrev={prevStep}
          />
        );
      case 4:
        return (
          <ScriptGenerationStep
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
        <h1 className="text-center text-3xl font-bold text-foreground mb-8">
          影片腳本生成器
        </h1>
        <ProgressSteps currentStep={currentStep} totalSteps={4} />
        <div className="mt-8">
          {renderCurrentStep()}
        </div>
      </main>
      <footer className="bg-primary text-primary-foreground text-center py-4 mt-16">
        <p>© 2025 Video Script Generator</p>
      </footer>
    </div>
  );
};

export default Index;