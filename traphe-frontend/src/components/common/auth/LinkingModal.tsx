import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ShieldAlert } from "lucide-react";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";

interface LinkingModalProps {
  isOpen: boolean;
  onSuccess: () => void;
}

export default function LinkingModal({ isOpen, onSuccess }: LinkingModalProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleCreatePassword = async () => {
    if (!password || !confirmPassword) {
      toast.warning("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);
    try {
      const res = await authService.createPassword({
        password,
        confirmPassword,
      });
      if (res.statusCode === 200) {
        toast.success(
          "Password created! You can now login with email/password.",
        );
        onSuccess();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSkip = async () => {
    setIsLoading(true);
    try {
      await authService.skipLinking();
      toast.info("You skipped password creation.");
      onSuccess();
    } catch (error: any) {
      console.error(error);
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px] bg-white shadow-2xl border border-gray-100 p-6 sm:rounded-xl transition-all"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="space-y-3">
          <DialogTitle className="flex items-center gap-2 text-xl">
            {/* Thêm icon nhỏ để tiêu đề nổi bật hơn */}
            <ShieldAlert className="w-6 h-6 text-blue-600" />
            Secure your account
          </DialogTitle>
          <DialogDescription className="text-base text-gray-600 leading-relaxed">
            You signed in with Google. Would you like to create a password to
            also log in using your email?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-6">
          <div className="grid gap-2">
            <Label htmlFor="new-pass" className="font-medium">
              New Password
            </Label>
            <Input
              id="new-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="h-11 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-pass" className="font-medium">
              Confirm Password
            </Label>
            <Input
              id="confirm-pass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
              className="h-11 bg-gray-50 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-3 sm:gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="sm:w-auto w-full h-11 border-gray-300 hover:bg-gray-50 text-gray-700"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleCreatePassword}
            disabled={isLoading}
            className="sm:w-auto w-full bg-black hover:bg-gray-800 text-white h-11 shadow-sm"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
