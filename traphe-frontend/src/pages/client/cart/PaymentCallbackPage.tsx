import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { CheckCircle2, XCircle, ShoppingBag, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCallbackPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<"success" | "failed" | "loading">("loading");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [gateway, setGateway] = useState<string | null>(null);

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const orderIdParam = searchParams.get("orderId");
    const gatewayParam = searchParams.get("gateway");

    setOrderId(orderIdParam);
    setGateway(gatewayParam);

    if (statusParam === "success") {
      setStatus("success");
    } else {
      setStatus("failed");
    }
  }, [searchParams]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 bg-gray-50/50">
      <div className="max-w-md w-full bg-white border border-gray-100 rounded-2xl p-8 shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
        {status === "success" ? (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-50 text-emerald-500 mb-2">
              <CheckCircle2 className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900">Thanh Toán Thành Công!</h2>
              <p className="text-gray-500 text-sm">
                Đơn hàng của bạn đã được thanh toán trực tuyến qua cổng <span className="font-semibold uppercase">{gateway || "Cổng thanh toán"}</span>.
              </p>
            </div>

            {orderId && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left space-y-1.5">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mã giao dịch đơn hàng</div>
                <div className="font-mono text-sm font-bold text-gray-800 break-all">{orderId}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => navigate("/account")}
              >
                Lịch sử đơn
              </Button>
              <Button
                className="w-full justify-center gap-2 bg-black text-white hover:bg-gray-900"
                onClick={() => navigate("/menu")}
              >
                Mua sắm tiếp <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-50 text-rose-500 mb-2">
              <XCircle className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-extrabold text-gray-900">Thanh Toán Thất Bại</h2>
              <p className="text-gray-500 text-sm">
                Đã xảy ra lỗi trong quá trình thanh toán trực tuyến. Đơn hàng của bạn vẫn được ghi nhận ở trạng thái chờ thanh toán.
              </p>
            </div>

            {orderId && (
              <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-left space-y-1.5">
                <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Mã đơn hàng</div>
                <div className="font-mono text-sm font-bold text-gray-800 break-all">{orderId}</div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button
                variant="outline"
                className="w-full justify-center gap-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                onClick={() => navigate("/account")}
              >
                Xem đơn hàng
              </Button>
              <Button
                className="w-full justify-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                onClick={() => navigate("/cart")}
              >
                Thử lại <ShoppingBag className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
