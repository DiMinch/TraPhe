import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { Loader2, Upload, X, Lock } from "lucide-react";
import type { UserInfo } from "@/types/user.types";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AccountTabProps {
  currentUser: UserInfo | null;
  onUpdateSuccess: () => void;
}

export default function AccountTab({
  currentUser,
  onUpdateSuccess,
}: AccountTabProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });

  // Avatar upload state
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Password update state
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync profile details
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || "",
        phone: currentUser.phone || "",
      });
      setPreviewUrl(null);
      setAvatarFile(null);
    }
  }, [currentUser]);

  // Handle avatar select
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Update profile handler
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const toastId = toast.loading("Updating profile...");

    try {
      const submitData = new FormData();
      submitData.append("fullName", formData.fullName);
      submitData.append("phone", formData.phone);
      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      const response = await userService.updateProfile(submitData);

      if (response.statusCode === 200) {
        toast.success("Profile updated successfully", { id: toastId });
        onUpdateSuccess();
      } else {
        toast.error("Update failed", {
          id: toastId,
          description: response.message,
        });
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to update profile";
      toast.error("Error", { id: toastId, description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  // Change password handler
  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswords({ ...passwords, [e.target.id]: e.target.value });
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwords.oldPassword || !passwords.newPassword) {
      toast.warning("Please fill in all password fields");
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (passwords.newPassword.length < 6) {
      toast.warning("Password must be at least 6 characters");
      return;
    }

    setIsPasswordLoading(true);
    const toastId = toast.loading("Updating password...");

    try {
      const response = await authService.changePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
      });

      if (response.statusCode === 200) {
        toast.success("Password updated successfully", { id: toastId });
        setPasswords({ oldPassword: "", newPassword: "", confirmPassword: "" });
      } else {
        toast.error("Update failed", {
          id: toastId,
          description: response.message,
        });
      }
    } catch (err: any) {
      const errorMsg =
        err.response?.data?.message || "Failed to update password";
      toast.error("Error", { id: toastId, description: errorMsg });
    } finally {
      setIsPasswordLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="animate-spin w-8 h-8 text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 max-w-4xl">
      <header>
        <h1 className="font-serif text-3xl font-semibold text-[#2C1A0E] mb-2">Profile Settings</h1>
        <p className="text-gray-600 text-sm">Manage your personal information and account security.</p>
      </header>

      <div className="grid grid-cols-1 gap-8">
        {/* Personal Information Section */}
        <section className="bg-white rounded-xl border border-[#E2DDD7] p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="font-serif text-lg font-bold text-[#5C3317]">Personal Information</h2>
            <p className="text-xs text-gray-500 mt-1">Update your basic profile details here.</p>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-6">
            {/* Avatar upload */}
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <Avatar className="w-20 h-20 border-2 border-[#E2DDD7] shadow-sm">
                  <AvatarImage
                    src={previewUrl || currentUser.avatar || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-[#5C3317] text-white text-lg font-bold">
                    {currentUser.fullName ? currentUser.fullName[0] : currentUser.email[0]}
                  </AvatarFallback>
                </Avatar>
                {previewUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewUrl(null);
                      setAvatarFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow-sm hover:bg-red-600 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center gap-2 bg-[#F5EAD8] hover:bg-[#EFE5D3] text-[#5C3317] border border-[#D4C9BC] px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm">
                    <Upload className="w-3.5 h-3.5" />
                    {avatarFile ? "Change Image" : "Upload Avatar"}
                  </div>
                  <Input
                    id="avatar"
                    type="file"
                    className="hidden"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </Label>
                <p className="text-[10px] text-gray-400 font-semibold">
                  JPG, PNG, WEBP. Max size 5MB.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <Label
                  htmlFor="fullname"
                  className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Full Name
                </Label>
                <Input
                  id="fullname"
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  className="h-11 bg-white border-[#E2DDD7] rounded-lg text-sm focus-visible:ring-[#5C3317] focus-visible:border-[#5C3317]"
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="phone"
                  className="text-xs font-bold text-gray-500 uppercase tracking-wider"
                >
                  Phone Number
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="h-11 bg-white border-[#E2DDD7] rounded-lg text-sm focus-visible:ring-[#5C3317] focus-visible:border-[#5C3317]"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Email Address
                </Label>
                <Input
                  value={currentUser.email}
                  className="h-11 bg-gray-50 border-[#E2DDD7] rounded-lg text-sm text-gray-500"
                  readOnly
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                className="bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-full px-6 py-2.5 text-xs font-bold shadow-sm cursor-pointer"
                disabled={isLoading}
              >
                {isLoading && <Loader2 className="h-3.5 h-3.5 animate-spin mr-2" />}
                Save Changes
              </Button>
            </div>
          </form>
        </section>

        {/* Security Section */}
        <section className="bg-white rounded-xl border border-[#E2DDD7] p-6 shadow-sm">
          <div className="border-b border-gray-100 pb-4 mb-6">
            <h2 className="font-serif text-lg font-bold text-[#5C3317] flex items-center gap-2">
              <Lock className="w-5 h-5 text-[#A0622A]" />
              <span>Security</span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">Ensure your account stays secure by updating your password regularly.</p>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-6 max-w-lg">
            <div className="space-y-1.5">
              <Label
                htmlFor="oldPassword"
                className="text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Current Password
              </Label>
              <Input
                id="oldPassword"
                type="password"
                value={passwords.oldPassword}
                onChange={handlePassChange}
                className="h-11 bg-white border-[#E2DDD7] rounded-lg text-sm focus-visible:ring-[#5C3317] focus-visible:border-[#5C3317]"
                placeholder="Enter current password"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="newPassword"
                className="text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                New Password
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={passwords.newPassword}
                onChange={handlePassChange}
                className="h-11 bg-white border-[#E2DDD7] rounded-lg text-sm focus-visible:ring-[#5C3317] focus-visible:border-[#5C3317]"
                placeholder="Enter new password"
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-xs font-bold text-gray-500 uppercase tracking-wider"
              >
                Confirm New Password
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwords.confirmPassword}
                onChange={handlePassChange}
                className="h-11 bg-white border-[#E2DDD7] rounded-lg text-sm focus-visible:ring-[#5C3317] focus-visible:border-[#5C3317]"
                placeholder="Repeat new password"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-gray-100">
              <Button
                type="submit"
                variant="outline"
                className="border border-[#5C3317] text-[#5C3317] hover:bg-[#F5EAD8] rounded-full px-6 py-2.5 text-xs font-bold cursor-pointer"
                disabled={isPasswordLoading}
              >
                {isPasswordLoading && <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />}
                Update Password
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}
