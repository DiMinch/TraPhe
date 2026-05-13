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

      if (response.statusCode === 200) {
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

      if (response.statusCode === 200) {
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
        {/* Left Side: Atmospheric Background Image */}
        <div className="hidden lg:flex lg:w-1/2 relative bg-surface-variant overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            title="A beautiful, atmospheric top-down shot of a rustic wooden table in a Vietnamese coffee shop"
            style={{
              backgroundImage:
                "url('https://lh3.googleusercontent.com/aida-public/AB6AXuBPHaUjCN2b-Hn6h8Mt_oqMGIZGq7jA7eYiUgiYc31a0CA18AMYVX5LfPTe7dQovUxVjJ3OxLz5CMbhLYkvVvrpfir4NVVAMFq0aInEHZo8pDi2H7_RJkAESuwFCDbIBuMDuY4Nhp_b2V-ZSD_Y6x748b_MHG2qVmF7tY7l7x7HfVmJR39aUJC_PdbqvkfvFC5xakMkdgDwDb3lKbtBT2yezfIh03hr_JgLXDnoELjHowz3VJepIPzAGrgS1mBhYHdzmL3h8Mwi1cY')",
            }}
          ></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-foam/30"></div>
        </div>

        {/* Right Side: Registration Form */}
        <div className="w-full lg:w-1/2 flex flex-col px-space-6 py-space-8 lg:px-space-20 relative bg-surface-container-lowest lg:bg-transparent justify-center items-center">
          <div className="absolute top-space-6 left-space-6 lg:left-space-12">
            <Link
              to="/"
              aria-label="Quay lại"
              className="flex items-center gap-2 text-dust hover:text-roast transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>

          <div className="w-full max-w-[480px]">
            <div className="mb-space-8 text-center lg:text-left">
              <h1 className="text-[36px] font-display-md text-espresso mb-space-2">
                {step === 1 ? "Đăng ký tài khoản" : "Xác thực email"}
              </h1>
              <p className="text-[16px] font-body-md text-dust">
                {step === 1
                  ? "Tạo tài khoản mới để trải nghiệm dịch vụ của TraPhe"
                  : `Nhập OTP đã gửi đến ${formData.email}`}
              </p>
            </div>

            {step === 1 && (
              <form className="flex flex-col gap-space-4" onSubmit={handleRegister}>
                <label className="flex flex-col w-full group">
                  <span className="text-[14px] font-ui-body text-ink font-medium pb-2">
                    Họ và tên
                  </span>
                  <input
                    className="w-full rounded-lg border-[1.5px] border-mist bg-surface-container-lowest px-4 py-3 text-[14px] font-ui-body text-ink placeholder:text-dust/70 focus:border-roast focus:ring-1 focus:ring-roast transition-all duration-200 outline-none"
                    id="fullName"
                    name="fullName"
                    placeholder="Nhập họ và tên của bạn"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </label>

                <label className="flex flex-col w-full group">
                  <span className="text-[14px] font-ui-body text-ink font-medium pb-2">
                    Tên đăng nhập
                  </span>
                  <input
                    className="w-full rounded-lg border-[1.5px] border-mist bg-surface-container-lowest px-4 py-3 text-[14px] font-ui-body text-ink placeholder:text-dust/70 focus:border-roast focus:ring-1 focus:ring-roast transition-all duration-200 outline-none"
                    id="username"
                    name="username"
                    placeholder="Nhập tên đăng nhập"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </label>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-space-4">
                  <label className="flex flex-col w-full group">
                    <span className="text-[14px] font-ui-body text-ink font-medium pb-2">
                      Email
                    </span>
                    <input
                      className="w-full rounded-lg border-[1.5px] border-mist bg-surface-container-lowest px-4 py-3 text-[14px] font-ui-body text-ink placeholder:text-dust/70 focus:border-roast focus:ring-1 focus:ring-roast transition-all duration-200 outline-none"
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Nhập địa chỉ email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </label>
                  <label className="flex flex-col w-full group">
                    <span className="text-[14px] font-ui-body text-ink font-medium pb-2">
                      Số điện thoại
                    </span>
                    <input
                      className="w-full rounded-lg border-[1.5px] border-mist bg-surface-container-lowest px-4 py-3 text-[14px] font-ui-body text-ink placeholder:text-dust/70 focus:border-roast focus:ring-1 focus:ring-roast transition-all duration-200 outline-none"
                      id="phone"
                      name="phone"
                      placeholder="Nhập số điện thoại"
                      value={formData.phone}
                      onChange={handleChange}
                      required
                      disabled={isLoading}
                    />
                  </label>
                </div>

                <label className="flex flex-col w-full group">
                  <span className="text-[14px] font-ui-body text-ink font-medium pb-2">
                    Mật khẩu
                  </span>
                  <div className="relative">
                    <input
                      className="w-full rounded-lg border-[1.5px] border-mist bg-surface-container-lowest px-4 py-3 pr-12 text-[14px] font-ui-body text-ink placeholder:text-dust/70 focus:border-roast focus:ring-1 focus:ring-roast transition-all duration-200 outline-none"
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
                      aria-label="Hiện mật khẩu"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-dust hover:text-roast"
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
                </label>

                <button
                  className="w-full bg-roast hover:bg-espresso text-white font-heading-lg text-[15px] rounded-full py-[14px] transition-colors duration-300 shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Đăng ký"
                  )}
                </button>
              </form>
            )}

            {step === 2 && (
              <form
                className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"
                onSubmit={handleVerifyOtp}
              >
                <div className="space-y-space-2">
                  <label
                    className="block text-[14px] font-ui-body text-ink font-medium"
                    htmlFor="otp"
                  >
                    Mã OTP
                  </label>
                  <input
                    id="otp"
                    placeholder="Nhập 6 chữ số"
                    className="w-full rounded-lg border-[1.5px] border-mist bg-surface-container-lowest px-4 py-3 text-[16px] font-ui-body text-ink placeholder:text-dust/70 focus:border-roast focus:ring-1 focus:ring-roast transition-all duration-200 outline-none text-center tracking-widest"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <p className="text-[12px] text-dust text-center">
                    Vui lòng kiểm tra hộp thư hoặc thư rác.
                  </p>
                </div>

                <button
                  className="w-full bg-roast hover:bg-espresso text-white font-heading-lg text-[15px] rounded-full py-[14px] transition-colors duration-300 shadow-sm mt-2 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Xác thực"
                  )}
                </button>

                <button
                  type="button"
                  className="w-full rounded-full border border-mist text-dust hover:text-roast hover:border-roast py-[12px] transition-colors"
                  onClick={() => setStep(1)}
                  disabled={isLoading}
                >
                  <span className="inline-flex items-center justify-center gap-2">
                    <ArrowLeft className="w-4 h-4" /> Quay lại đăng ký
                  </span>
                </button>
              </form>
            )}

            {step === 1 && (
              <div className="mt-space-8 text-center">
                <p className="text-[14px] font-ui-body text-dust">
                  Đã có tài khoản?{" "}
                  <Link
                    className="text-caramel hover:text-roast font-medium ml-1"
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
