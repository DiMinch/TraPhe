import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartStepperProps {
  currentStep: number;
}

export default function CartStepper({ currentStep }: CartStepperProps) {
  const steps = [
    { id: 1, label: "Shopping Cart" },
    { id: 2, label: "Checkout Details" },
    { id: 3, label: "Order Complete" },
  ];

  return (
    <div className="max-w-3xl mx-auto mb-10 px-6">
      <div className="flex items-center justify-between text-sm font-medium">
        {steps.map((step, index) => {
          const isActive = step.id === currentStep;
          const isCompleted = step.id < currentStep;

          return (
            <div
              key={step.id}
              className="flex items-center flex-1 last:flex-none"
            >
              <div
                className={cn(
                  "flex items-center gap-3 font-ui-body",
                  isActive || isCompleted ? "text-roast" : "text-smoke opacity-60",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold transition-all duration-300",
                    isCompleted
                      ? "bg-cream text-roast border border-roast/20 shadow-sm"
                      : isActive
                        ? "bg-roast text-white shadow-md scale-110"
                        : "bg-mist/30 text-smoke border border-mist/20",
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap font-ui-body text-xs md:text-sm transition-all duration-300",
                    isActive ? "font-ui-heading font-bold text-roast" : "",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 rounded-full transition-all duration-500",
                    isCompleted ? "bg-roast" : "bg-mist/30",
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

