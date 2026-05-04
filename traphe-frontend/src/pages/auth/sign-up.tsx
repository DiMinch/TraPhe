import { useState } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    <div className="flex min-h-screen">
      <div className="flex flex-col justify-center items-center w-full md:w-1/2 bg-white p-8 md:p-12">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-2">
              {step === 1 ? "Create Account" : "Verify Email"}
            </h1>
            <p className="text-gray-500">
              {step === 1
                ? "Join Viti today for exclusive deals"
                : `Enter the OTP sent to ${formData.email}`}
            </p>
          </div>

          {step === 1 && (
            <form className="space-y-4" onSubmit={handleRegister}>
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  placeholder="Nguyen Van A"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="nguyenvana"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@gmail.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    placeholder="0909 xxx xxx"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a password"
                    className="pr-10"
                    value={formData.password}
                    onChange={handleChange}
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
                  "Sign Up"
                )}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/sign-in"
                  className="font-semibold text-gray-900 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </form>
          )}

          {step === 2 && (
            <form
              className="space-y-6 animate-in fade-in slide-in-from-right-8 duration-300"
              onSubmit={handleVerifyOtp}
            >
              <div className="space-y-2">
                <Label htmlFor="otp">OTP Code</Label>
                <Input
                  id="otp"
                  placeholder="Enter 6-digit code"
                  className="h-12 text-center text-lg tracking-widest"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 text-center">
                  Please check your inbox or spam folder.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-slate-900 hover:bg-slate-800 text-white font-medium"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  "Verify & Complete"
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => setStep(1)}
                disabled={isLoading}
              >
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to Registration
              </Button>
            </form>
          )}
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
