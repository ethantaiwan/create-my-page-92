interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

const steps = [
  { number: 1, label: "主題資訊" },
  { number: 2, label: "影片需求" },
  { number: 3, label: "風格偏好" },
  { number: 4, label: "腳本生成" },
];

const ProgressSteps = ({ currentStep, onStepClick }: ProgressStepsProps) => {
  return (
    <div className="flex justify-center items-center space-x-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <button
              onClick={() => onStepClick?.(step.number)}
              disabled={step.number > currentStep}
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 hover:scale-110 ${
                step.number <= currentStep
                  ? "bg-step-active cursor-pointer hover:shadow-lg"
                  : "bg-step-inactive text-gray-500 cursor-not-allowed"
              } ${step.number === currentStep ? "animate-pulse shadow-lg" : ""}`}
            >
              {step.number}
            </button>
            <span className={`text-sm mt-2 font-medium transition-all duration-500 ${
              step.number === currentStep 
                ? "text-primary animate-fade-in tech-glow" 
                : "text-foreground"
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-16 h-1 mx-4 ${
                step.number < currentStep
                  ? "bg-step-active"
                  : "bg-step-inactive"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export { ProgressSteps };