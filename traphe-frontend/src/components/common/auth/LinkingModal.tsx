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
import { Loader2 } from "lucide-react";
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
      toast.error(error.response?.data?.message || "Failed to skip linking");
      onSuccess();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent
        className="sm:max-w-[425px]"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Secure your account</DialogTitle>
          <DialogDescription>
            You signed in with Google. Would you like to create a password to
            also log in using your email?
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="new-pass">New Password</Label>
            <Input
              id="new-pass"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="confirm-pass">Confirm Password</Label>
            <Input
              id="confirm-pass"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={handleSkip}
            disabled={isLoading}
            className="sm:w-auto w-full"
          >
            Skip for now
          </Button>
          <Button
            onClick={handleCreatePassword}
            disabled={isLoading}
            className="sm:w-auto w-full bg-black text-white"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
