import { useState } from "react";

import { Header } from "@/components/Header";

import { ProgressSteps } from "@/components/ProgressSteps";

import { CompanyInfoStep } from "@/components/steps/CompanyInfoStep";

import { VideoTypeStep } from "@/components/steps/VideoTypeStep";

import { VisualStyleStep } from "@/components/steps/VisualStyleStep";

import { ScriptGenerationStep } from "@/components/steps/ScriptGenerationStep";

import { ImageGenerationStep } from "@/components/steps/ImageGenerationStep";

import { VideoGenerationStep } from "@/components/steps/VideoGenerationStep";



const Index = () => {

  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState({

    companyInfo: "",

    videoType: "",

    targetPlatform: "",

    visualStyle: "",

    videoTechniques: "",

    aspectRatio: "16:9",

  });



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

            selectedTechnique={formData.videoTechniques}

            selectedAspectRatio={formData.aspectRatio}

            onStyleChange={(value) => updateFormData("visualStyle", value)}

            onTechniqueChange={(value) => updateFormData("videoTechniques", value)}

            onAspectRatioChange={(value) => updateFormData("aspectRatio", value)}

            onNext={nextStep}

            onPrev={prevStep}

          />

        );

      case 4:

        return (

          <ScriptGenerationStep

            formData={formData}

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

