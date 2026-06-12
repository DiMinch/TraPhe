import { useState } from "react";
import { Link } from "react-router";
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axiosClient from "@/lib/axios-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    setIsLoading(true);
    try {
      await axiosClient.post("/auth/forgot-password", { email: email.trim() });
      setIsSent(true);
      toast.success("Đã gửi link khôi phục mật khẩu!");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi yêu cầu. Vui lòng thử lại.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {isSent ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Đã gửi email!</h2>
            <p className="text-gray-500 text-sm">
              Vui lòng kiểm tra hộp thư <strong>{email}</strong> và nhấp vào liên kết để đặt lại mật khẩu.
            </p>
            <Link to="/sign-in">
              <Button variant="outline" className="mt-4">Quay lại đăng nhập</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <Mail className="w-7 h-7 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Quên mật khẩu?</h1>
              <p className="text-gray-500 text-sm">Nhập email đăng ký để nhận link khôi phục</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-900" disabled={isLoading}>
                {isLoading ? "Đang gửi..." : "Gửi link khôi phục"}
              </Button>
            </form>
            <div className="mt-6 text-center">
              <Link to="/sign-in" className="text-sm text-gray-500 hover:text-black inline-flex items-center gap-1">
                <ArrowLeft className="w-3.5 h-3.5" /> Quay lại đăng nhập
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
