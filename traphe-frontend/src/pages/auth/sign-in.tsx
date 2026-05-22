import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const toastId = toast.loading("Signing in...");

    try {
      const response = await authService.login({ email, password });

      if (response.statusCode === 200 && response.data) {
        const { accessToken, refreshToken, ...userInfo } = response.data;
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
        localStorage.setItem("user", JSON.stringify(userInfo));

        toast.success("Login Successful", {
          id: toastId,
          description: `Welcome back, ${userInfo.username || "User"}!`,
        });

        const roles = userInfo.roles || [];
        const userRoles = roles as string[];
        if (
          userRoles.includes(UserRole.ADMIN) ||
          userRoles.includes(UserRole.EMPLOYEE) ||
          userRoles.includes(UserRole.CASHIER) ||
          userRoles.includes(UserRole.ACCOUNTANT)
        ) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        toast.error("Login Failed", {
          id: toastId,
          description: response.message || "Invalid credentials",
        });
      }
    } catch (err: any) {
      console.error("Login Error:", err);
      const errorMsg = err.response?.data?.message || "Something went wrong.";

      toast.error("Error", {
        id: toastId,
        description: errorMsg,
      });
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
        {/* Right Section: Login Form */}
        <div className="flex w-full flex-col justify-center px-space-6 py-space-12 lg:w-1/2 xl:px-space-20 bg-foam relative">
          {/* Minimal Back Button */}
          <div className="absolute top-space-6 left-space-6 lg:left-space-12">
            <Link
              to="/"
              aria-label="Quay lại"
              className="flex items-center gap-2 text-dust hover:text-roast transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </div>
          <div className="mx-auto w-full max-w-[420px]">
            {/* Header */}
            <div className="mb-space-12 text-center">
              <h1 className="font-display-lg text-[48px] text-espresso mb-space-2">
                TraPhe
              </h1>
              <p className="font-body-md text-[16px] text-dust">
                Đăng nhập để tiếp tục trải nghiệm
              </p>
            </div>
            {/* Form */}
            <form className="space-y-space-6" onSubmit={handleSignIn}>
              {/* Email / Phone Input */}
              <div className="space-y-space-2">
                <label
                  className="block font-ui-body text-[14px] text-on-surface-variant font-medium"
                  htmlFor="identifier"
                >
                  Email hoặc Số điện thoại
                </label>
                <div className="relative">
                  <input
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist px-space-4 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                    id="identifier"
                    name="identifier"
                    placeholder="Nhập email hoặc số điện thoại"
                    required
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              {/* Password Input */}
              <div className="space-y-space-2">
                <label
                  className="block font-ui-body text-[14px] text-on-surface-variant font-medium"
                  htmlFor="password"
                >
                  Mật khẩu
                </label>
                <div className="relative flex items-center">
                  <input
                    className="block w-full rounded bg-surface-container-lowest border-[1.5px] border-mist pl-space-4 pr-12 py-[14px] font-ui-body text-on-surface placeholder:text-outline focus:border-roast focus:ring-1 focus:ring-roast transition-colors outline-none"
                    id="password"
                    name="password"
                    placeholder="Nhập mật khẩu"
                    required
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
              {/* Options Row */}
              <div className="flex items-center justify-between pt-space-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="relative flex items-center justify-center w-5 h-5">
                    <input
                      className="peer appearance-none w-5 h-5 border-[1.5px] border-mist rounded bg-surface-container-lowest checked:bg-roast checked:border-roast focus:outline-none focus:ring-2 focus:ring-roast/20 transition-all cursor-pointer"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      disabled={isLoading}
                    />
                    <svg
                      className="absolute text-white w-3.5 h-3.5 pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M11.6666 3.5L5.24992 9.91667L2.33325 7"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <span className="font-ui-body text-ui-body text-on-surface-variant group-hover:text-espresso transition-colors">
                    Nhớ mật khẩu
                  </span>
                </label>
                <Link
                  className="font-ui-body text-ui-body font-medium text-caramel hover:text-roast underline-offset-4 hover:underline transition-colors"
                  to="/forgot-password"
                >
                  Quên mật khẩu?
                </Link>
              </div>
              {/* Submit Button */}
              <div className="pt-space-4">
                <button
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-roast px-space-6 py-[14px] font-body-md text-body-md font-semibold text-parchment shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300 ease-out focus:outline-none focus:ring-2 focus:ring-roast focus:ring-offset-2 focus:ring-offset-foam disabled:opacity-70 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
              </div>
            </form>
            {/* Footer Links */}
            <div className="mt-space-8 border-t border-mist/40 pt-space-8 text-center">
              <p className="font-ui-body text-ui-body text-on-surface-variant">
                Chưa có tài khoản?{" "}
                <Link
                  className="font-medium text-caramel hover:text-roast underline-offset-4 hover:underline transition-colors"
                  to="/sign-up"
                >
                  Đăng ký tài khoản mới
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
