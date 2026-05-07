import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { authService } from "@/services/auth.service";
import { UserRole } from "@/enums/roles.enum";
import { toast } from "sonner";

export default function SignInPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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
          userRoles.includes(UserRole.EMPLOYEE)
        ) {
          navigate("/dashboard");
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
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">Sign In</h1>
            <p className="text-gray-500">Start your journey with Viti</p>
          </div>

          <form className="space-y-6" onSubmit={handleSignIn}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="example@gmail.com"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="h-12 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
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

            <Button
              type="submit"
              className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Sign in"
              )}
            </Button>

            <p className="text-center text-sm text-gray-600">
              New to Viti?{" "}
              <Link
                to="/sign-up"
                className="font-semibold text-gray-900 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>
      <div className="hidden md:block w-1/2 bg-gray-200 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/logo.svg"
            alt="Decorative"
            className="object-cover h-1/2 w-1/2"
          />
        </div>
      </div>
    </div>
  );
}
