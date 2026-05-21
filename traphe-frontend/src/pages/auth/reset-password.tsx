import { useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router";
import { Lock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import axiosClient from "@/lib/axios-client";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setIsLoading(true);
    try {
      await axiosClient.post("/auth/reset-password", { token, newPassword: password });
      setIsSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/sign-in"), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Token không hợp lệ hoặc đã hết hạn.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center space-y-4">
          <p className="text-gray-500">Link đặt lại mật khẩu không hợp lệ.</p>
          <Link to="/forgot-password">
            <Button variant="outline">Yêu cầu lại</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {isSuccess ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 mx-auto bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Đặt lại thành công!</h2>
            <p className="text-gray-500 text-sm">Đang chuyển hướng về trang đăng nhập...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-14 h-14 mx-auto bg-amber-50 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-7 h-7 text-amber-600" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Đặt lại mật khẩu</h1>
              <p className="text-gray-500 text-sm">Nhập mật khẩu mới cho tài khoản của bạn</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input type="password" placeholder="Mật khẩu mới" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Input type="password" placeholder="Xác nhận mật khẩu" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <Button type="submit" className="w-full bg-black text-white hover:bg-gray-900" disabled={isLoading}>
                {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
