interface ProgressStepsProps {
  currentStep: number;
  totalSteps: number;
}

const steps = [
  { number: 1, label: "主題資訊" },
  { number: 2, label: "影片需求" },
  { number: 3, label: "風格偏好" },
  { number: 4, label: "腳本生成" },
];

const ProgressSteps = ({ currentStep }: ProgressStepsProps) => {
  return (
    <div className="flex justify-center items-center space-x-8">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${
                step.number <= currentStep
                  ? "bg-step-active"
                  : "bg-step-inactive text-gray-500"
              }`}
            >
              {step.number}
            </div>
            <span className="text-sm mt-2 text-foreground font-medium">
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