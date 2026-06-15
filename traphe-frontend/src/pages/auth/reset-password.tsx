import { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import axiosClient from "@/lib/axios-client";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Vui lòng nhập email");
      return;
    }
    if (!otp.trim()) {
      toast.error("Vui lòng nhập mã OTP");
      return;
    }
    if (password.length < 8) {
      toast.error("Mật khẩu mới phải có ít nhất 8 ký tự");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }
    setIsLoading(true);
    try {
      await axiosClient.post("/auth/reset-password", {
        email: email.trim(),
        otp: otp.trim(),
        newPassword: password,
      });
      setIsSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/sign-in"), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Mã OTP không hợp lệ hoặc thông tin không chính xác.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full">
      {/* Cột 1: Ảnh thương hiệu và trích dẫn */}
      <div className="relative hidden w-1/2 flex-col justify-end bg-surface-container-high lg:flex overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out hover:scale-105"
          title="A warm, inviting close-up shot of a steaming ceramic cup of Vietnamese coffee"
          style={{
            backgroundImage: `url("https://lh3.googleusercontent.com/aida-public/AB6AXuBHA3Nrl9AaJ_2SybDk8KCqdU-ZGAQofMIyAF6CW8drT3rwEM9GJRRL-snYptMfFwtBAF-WsGohcYa9ZYT0vvPPJQsFAdVffcRe5jcOqYPoxpjc1ag_Hj99ONChsSyzMXVY8Z6y1e3LGqmCc4LehtN-6s6w_s5AIO819lgWdjLvZbfeeyHeZ1KCmT_NFp-2Un5fBH31SrO-nPzl51G362mGhafK3D0HK9_eoTmZ8UeoTvA1LCqtmrTgDOYrD2swVllvzPTs2y1EUfE")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent" />
        <div className="relative z-10 p-space-12 text-white/90">
          <div className="space-y-space-4 max-w-lg">
            <h2 className="font-display-md text-[36px] text-parchment leading-tight">
              Hương vị của sự <br />
              tĩnh lặng.
            </h2>
            <p className="font-body-md text-[16px] text-cloud opacity-90">
              Khám phá bộ sưu tập cà phê rang mộc nguyên bản, được tuyển chọn từ những vùng nguyên liệu trứ danh nhất Việt Nam.
            </p>
          </div>
        </div>
      </div>

      {/* Cột 2: Form */}
      <div className="flex w-full flex-col justify-center px-space-6 py-space-12 lg:w-1/2 xl:px-space-20 bg-foam relative">
        <div className="absolute top-space-6 left-space-6 lg:left-space-12">
          <Link
            aria-label="Quay lại"
            className="flex items-center gap-2 text-dust hover:text-roast transition-colors"
            to="/forgot-password"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </div>

        <div className="mx-auto w-full max-w-[420px]">
          {isSuccess ? (
            <div className="text-center space-y-space-6 flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="space-y-space-2">
                <h2 className="font-display-md text-[32px] text-espresso">Đặt lại thành công!</h2>
                <p className="font-body-md text-[16px] text-dust">
                  Đang chuyển hướng về trang đăng nhập...
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-space-10 text-center">
                <h1 className="font-display-lg text-[48px] text-espresso mb-space-2">TraPhe</h1>
                <p className="font-body-md text-[16px] text-dust">Đặt lại mật khẩu</p>
                <p className="font-body-sm text-[14px] text-outline mt-1">
                  Nhập thông tin xác thực và mật khẩu mới
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-space-4">
                <div className="space-y-space-2">
                  <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="email">
                    Email tài khoản
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={!!initialEmail || isLoading}
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none disabled:opacity-75 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="space-y-space-2">
                  <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="otp">
                    Mã xác nhận OTP (6 số)
                  </label>
                  <input
                    id="otp"
                    type="text"
                    placeholder="Nhập 6 chữ số OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                  />
                </div>

                <div className="space-y-space-2">
                  <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="password">
                    Mật khẩu mới (tối thiểu 8 ký tự)
                  </label>
                  <input
                    id="password"
                    type="password"
                    placeholder="Mật khẩu mới"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                  />
                </div>

                <div className="space-y-space-2">
                  <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="confirmPassword">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    placeholder="Xác nhận mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                  />
                </div>

                <div className="pt-space-4">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-roast px-space-6 py-[14px] font-body-md text-body-md font-semibold text-parchment shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-roast focus:ring-offset-2 focus:ring-offset-foam disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={isLoading}
                  >
                    {isLoading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
