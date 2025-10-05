import { Progress } from '@/components/ui/progress';

interface WizardProps {
  currentStep: number;
  steps: React.ReactNode[];
}

export function Wizard({ currentStep, steps }: WizardProps) {
  return (
    <div className="w-full max-w-2xl">
      <Progress value={(currentStep / steps.length) * 100} className="mb-4" />
      <div className="space-y-4">
        {steps[currentStep - 1]} {/* 1-indexed */}
      </div>
      <div className="flex justify-between mt-4">
        {currentStep > 1 && <button onClick={() => { /* prev logic */ }}>Previous</button>}
        <span>Step {currentStep} of {steps.length}</span>
      </div>
    </div>
  );
}
