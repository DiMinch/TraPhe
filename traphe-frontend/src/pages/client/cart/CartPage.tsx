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
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const getTitle = () => {
    switch (currentStep) {
      case 1:
        return "Your Cart";
      case 2:
        return "Checkout";
      case 3:
        return "Order Success";
      default:
        return "Your Cart";
    }
  };

  const getBgClass = () => {
    switch (currentStep) {
      case 1:
        return "bg-parchment";
      case 2:
        return "bg-foam";
      case 3:
        return "bg-foam";
      default:
        return "bg-parchment";
    }
  };

  return (
    <div className={`${getBgClass()} min-h-screen pb-20 transition-colors duration-500`}>
      <div className="max-w-[1280px] mx-auto px-6 pt-10 pb-4">
        <h1 className="font-display-lg text-display-lg text-roast mb-6">{getTitle()}</h1>
        <CartStepper currentStep={currentStep} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        {currentStep === 1 && <ShoppingCartStep onNext={nextStep} />}
        {currentStep === 2 && (
          <CheckoutStep
            onNext={nextStep}
            onBack={prevStep}
            onOrderSuccess={setOrderSuccessData}
          />
        )}
        {currentStep === 3 && <OrderCompleteStep order={orderSuccessData} />}
      </div>
    </div>
  );
}
