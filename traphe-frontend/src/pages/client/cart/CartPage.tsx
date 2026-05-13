import { useState } from "react";
import CartStepper from "./components/CartStepper";
import ShoppingCartStep from "./components/ShoppingCartStep";
import CheckoutStep from "./components/CheckoutStep";
import OrderCompleteStep from "./components/OrderCompleteStep";
import type { OrderResponse } from "@/services/order.service";

export default function CartPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [orderSuccessData, setOrderSuccessData] =
    useState<OrderResponse | null>(null);

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 3));

  const getTitle = () => {
    switch (currentStep) {
      case 1:
        return "Cart";
      case 2:
        return "Check Out";
      case 3:
        return "Complete!";
      default:
        return "Cart";
    }
  };

  return (
    <div className="bg-white min-h-screen pb-20">
      <div className="pt-10 pb-8 text-center">
        <h1 className="text-4xl font-semibold tracking-tight">{getTitle()}</h1>
      </div>
      <CartStepper currentStep={currentStep} />

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentStep === 1 && <ShoppingCartStep onNext={nextStep} />}
        {currentStep === 2 && (
          <CheckoutStep
            onNext={nextStep}
            onOrderSuccess={setOrderSuccessData}
          />
        )}
        {currentStep === 3 && <OrderCompleteStep order={orderSuccessData} />}
      </div>
    </div>
  );
}
