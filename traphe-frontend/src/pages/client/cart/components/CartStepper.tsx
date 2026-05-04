import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CartStepperProps {
  currentStep: number;
}

export default function CartStepper({ currentStep }: CartStepperProps) {
  const steps = [
    { id: 1, label: "Shopping cart" },
    { id: 2, label: "Checkout details" },
    { id: 3, label: "Order complete" },
  ];

  return (
    <div className="max-w-3xl mx-auto mb-16 px-6">
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
                  "flex items-center gap-3",
                  isActive || isCompleted ? "text-black" : "text-gray-400",
                )}
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center font-bold transition-colors",
                    isCompleted
                      ? "bg-[#38CB89] text-white"
                      : isActive
                        ? "bg-black text-white"
                        : "bg-gray-200 text-gray-500",
                  )}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : step.id}
                </div>
                <span
                  className={cn(
                    "whitespace-nowrap",
                    isActive ? "font-bold text-black" : "",
                  )}
                >
                  {step.label}
                </span>
              </div>

              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-4 rounded-full",
                    isCompleted ? "bg-[#38CB89]" : "bg-gray-200",
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
