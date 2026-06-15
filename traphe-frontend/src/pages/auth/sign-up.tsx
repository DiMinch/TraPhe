import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

export default function SignUpPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2>(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phone: "",
  });
  const [otp, setOtp] = useState("");
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Processing registration...");

    try {
      const response = await authService.register(formData);

      if (response.success) {
        toast.success("Registration successful!", {
          id: toastId,
          description: response.message || "Please check your email for OTP.",
        });
        setStep(2);
      } else {
        toast.error("Registration Failed", {
          id: toastId,
          description: response.message,
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Failed to register.";
      toast.error("Error", { id: toastId, description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Verifying OTP...");

    try {
      const response = await authService.verifySignup({
        email: formData.email,
        otp: otp,
      });

      if (response.success) {
        toast.success("Account Verified!", {
          id: toastId,
          description: "You can now login.",
        });
        navigate("/sign-in");
      } else {
        toast.error("Verification Failed", {
          id: toastId,
          description: response.message,
        });
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Invalid OTP.";
      toast.error("Error", { id: toastId, description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-foam font-ui-body text-on-surface antialiased selection:bg-roast selection:text-white">
      <main className="flex min-h-screen w-full">
        {/* Left Section: Cinematic Imagery (Hidden on small screens) */}
        <div className="relative hidden w-1/2 flex-col justify-end bg-surface-container-high lg:flex overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-out hover:scale-105"
            title="A warm, inviting close-up shot of a steaming ceramic cup of Vietnamese coffee"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBHA3Nrl9AaJ_2SybDk8KCqdU-ZGAQofMIyAF6CW8drT3rwEM9GJRRL-snYptMfFwtBAF-WsGohcYa9ZYT0vvPPJQsFAdVffcRe5jcOqYPoxpjc1ag_Hj99ONChsSyzMXVY8Z6y1e3LGqmCc4LehtN-6s6w_s5AIO819lgWdjLvZbfeeyHeZ1KCmT_NFp-2Un5fBH31SrO-nPzl51G362mGhafK3D0HK9_eoTmZ8UeoTvA1LCqtmrTgDOYrD2swVllvzPTs2y1EUfE')",
            }}
          ></div>
          {/* Subtle gradient overlay for text readability if needed, and to anchor the brand feel */}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/20 to-transparent"></div>
          {/* Atmospheric Brand Anchor */}
          <div className="relative z-10 p-space-12 text-white/90">
            <div className="space-y-space-4 max-w-lg">
              <h2 className="font-display-md text-[36px] text-parchment leading-tight">
                Hương vị của sự <br />
                tĩnh lặng.
              </h2>
              <p className="font-body-md text-[16px] text-cloud opacity-90">
                Khám phá bộ sưu tập cà phê rang mộc nguyên bản, được tuyển chọn
                từ những vùng nguyên liệu trứ danh nhất Việt Nam.
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="flex w-full flex-col justify-center px-space-6 py-space-12 lg:w-1/2 xl:px-space-20 bg-foam relative">
          <div className="absolute top-space-6 left-space-6 lg:left-space-12">
            <Link
              to="/sign-in"
              aria-label="Quay lại"
              className="flex items-center gap-2 text-dust hover:text-roast transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>

          <div className="mx-auto w-full max-w-[420px]">
            {/* Header */}
            <div className="mb-space-8 text-center">
              <h1 className="font-display-lg text-[48px] text-espresso mb-space-2">
                TraPhe
              </h1>
              <p className="font-body-md text-[16px] text-dust">
                {step === 1 ? "Đăng ký tài khoản" : "Xác thực email"}
              </p>
              <p className="font-body-sm text-[14px] text-outline mt-1">
                {step === 1
                  ? "Tạo tài khoản mới để trải nghiệm dịch vụ của TraPhe"
                  : `Nhập OTP đã gửi đến ${formData.email}`}
              </p>
            </div>

            {step === 1 && (
              <form className="space-y-space-4" onSubmit={handleRegister}>
                <div className="space-y-space-2">
                  <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="fullName">
                    Họ và tên
                  </label>
                  <input
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                    id="fullName"
                    name="fullName"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-space-2">
                  <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="username">
                    Tên đăng nhập
                  </label>
                  <input
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                    id="username"
                    name="username"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-4">
                  <div className="space-y-space-2">
                    <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="email">
                      Email
                    </label>
                    <input
                      className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Nhập email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-space-2">
                    <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="phone">
                      Số điện thoại
                    </label>
                    <input
                      className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                      id="phone"
                      name="phone"
                      placeholder="Nhập SĐT"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-space-2">
                  <label className="block font-ui-body text-[14px] text-on-surface-variant font-medium" htmlFor="password">
                    Mật khẩu
                  </label>
                  <div className="relative flex items-center">
                    <input
                      className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist pl-space-4 pr-12 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                      id="password"
                      name="password"
                      placeholder="Tạo mật khẩu"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                    <button
                      aria-label="Hiển thị mật khẩu"
                      className="absolute right-3 flex items-center justify-center text-outline hover:text-roast transition-colors p-1"
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="pt-space-4">
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-roast px-space-6 py-[14px] font-body-md text-body-md font-semibold text-parchment shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-roast focus:ring-offset-2 focus:ring-offset-foam disabled:opacity-70 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Đăng ký"
                    )}
                  </button>
                </div>
              </form>
            )}

            {step === 2 && (
              <form
                className="space-y-space-6 animate-in fade-in slide-in-from-right-8 duration-300"
                onSubmit={handleVerifyOtp}
              >
                <div className="space-y-space-2">
                  <label
                    className="block font-ui-body text-[14px] text-on-surface-variant font-medium"
                    htmlFor="otp"
                  >
                    Mã xác nhận OTP (6 số)
                  </label>
                  <input
                    id="otp"
                    placeholder="Nhập 6 chữ số"
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none text-center tracking-widest text-[16px]"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-[12px] text-dust text-center mt-1">
                    Vui lòng kiểm tra hộp thư hoặc thư rác.
                  </p>
                </div>

                <div className="space-y-space-4">
                  <button
                    className="w-full flex items-center justify-center gap-2 rounded-full bg-roast px-space-6 py-[14px] font-body-md text-body-md font-semibold text-parchment shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-roast focus:ring-offset-2 focus:ring-offset-foam disabled:opacity-70 disabled:cursor-not-allowed"
                    type="submit"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      "Xác thực email"
                    )}
                  </button>

                  <button
                    type="button"
                    className="w-full rounded-full border-[1.5px] border-mist text-dust hover:text-roast hover:border-roast py-[12px] transition-colors font-medium text-[14px] focus:outline-none"
                    onClick={() => setStep(1)}
                    disabled={isLoading}
                  >
                    <span className="inline-flex items-center justify-center gap-2">
                      <ArrowLeft className="w-4 h-4" /> Quay lại đăng ký
                    </span>
                  </button>
                </div>
              </form>
            )}

            {step === 1 && (
              <div className="mt-space-8 border-t border-mist/40 pt-space-8 text-center">
                <p className="font-ui-body text-ui-body text-on-surface-variant">
                  Đã có tài khoản?{" "}
                  <Link
                    className="font-medium text-caramel hover:text-roast underline-offset-4 hover:underline transition-colors"
                    to="/sign-in"
                  >
                    Đăng nhập ngay
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
