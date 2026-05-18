import type { GuideStep } from "../types";

type TourModalProps = {
  isOpen: boolean;
  title: string;
  steps: GuideStep[];
  currentStep: number;
  onNext: () => void;
  onClose: () => void;
};

export function TourModal({
  isOpen,
  title,
  steps,
  currentStep,
  onNext,
  onClose
}: TourModalProps) {
  if (!isOpen) {
    return null;
  }

  const step = steps[currentStep];
  const isLast = currentStep === steps.length - 1;

  return (
    <div className="tour-backdrop">
      <div className="tour-card">
        <div className="eyebrow">Guided tour</div>
        <h2>{title}</h2>
        <div className="tour-index">
          Step {currentStep + 1} of {steps.length}
        </div>
        <h3>{step.title}</h3>
        <p className="copy">{step.body}</p>
        <div className="tour-actions">
          <button className="button secondary" onClick={onClose}>
            Skip tour
          </button>
          <button className="button" onClick={isLast ? onClose : onNext}>
            {isLast ? "Finish tour" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
