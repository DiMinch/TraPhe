import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authService } from "@/services/auth.service";
import { userService } from "@/services/user.service";
import { toast } from "sonner";
import { Loader2, Upload, X } from "lucide-react";
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

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
  });

  // State quản lý file avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State quản lý form password
  const [passwords, setPasswords] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Sync prop currentUser vào state khi load xong
  useEffect(() => {
    if (currentUser) {
      setFormData({
        fullName: currentUser.fullName || "",
        phone: currentUser.phone || "",
      });
      // Reset preview khi user đổi (hoặc cancel)
      setPreviewUrl(null);
      setAvatarFile(null);
    }
  }, [currentUser]);

  // Xử lý chọn file ảnh
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // Limit 5MB
        toast.error("File size should be less than 5MB");
        return;
      }
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Tạo URL preview
    }
  };

  // Xử lý cập nhật Profile (Info + Avatar)
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
        onUpdateSuccess(); // Refresh data ở trang cha
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

  // Xử lý đổi mật khẩu
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
    }
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <h2 className="text-xl font-bold mb-6">Account Details</h2>

      {/* === FORM CẬP NHẬT THÔNG TIN & AVATAR === */}
      <form onSubmit={handleUpdateProfile} className="space-y-6 max-w-2xl">
        {/* Avatar Upload Section */}
        <div className="flex items-center gap-6 mb-4">
          <div className="relative">
            <Avatar className="w-24 h-24 border border-gray-200">
              <AvatarImage
                src={previewUrl || currentUser.avatar || ""}
                className="object-cover"
              />
              <AvatarFallback className="bg-gray-100 text-xl font-bold">
                {currentUser.username ? currentUser.username[0] : "U"}
              </AvatarFallback>
            </Avatar>
            {/* Nút xóa ảnh preview nếu muốn hoàn tác */}
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
          <div className="flex flex-col gap-2">
            <Label htmlFor="avatar" className="cursor-pointer">
              <div className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">
                <Upload className="w-4 h-4" />
                {avatarFile ? "Change Selected Image" : "Upload Avatar"}
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
            <p className="text-xs text-gray-500">
              Max size 5MB. Formats: JPG, PNG, WEBP
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label
              htmlFor="fullname"
              className="text-xs font-bold text-gray-500 uppercase"
            >
              Full Name
            </Label>
            <Input
              id="fullname"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className="h-12 bg-white"
              placeholder="Enter your full name"
            />
          </div>
          <div className="space-y-2">
            <Label
              htmlFor="phone"
              className="text-xs font-bold text-gray-500 uppercase"
            >
              Phone
            </Label>
            <Input
              id="phone"
              value={formData.phone}
              onChange={(e) =>
                setFormData({ ...formData, phone: e.target.value })
              }
              className="h-12 bg-white"
              placeholder="Enter phone number"
            />
          </div>
        </div>

        {/* Read-only Fields */}
        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-500 uppercase">
            Username
          </Label>
          <Input
            value={currentUser.username}
            className="h-12 bg-gray-50 text-gray-500"
            readOnly
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs font-bold text-gray-500 uppercase">
            Email
          </Label>
          <Input
            value={currentUser.email}
            className="h-12 bg-gray-50 text-gray-500"
            readOnly
          />
        </div>

        <Button
          type="submit"
          className="bg-black hover:bg-gray-800 text-white h-12 px-8 rounded-md cursor-pointer"
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save Changes
        </Button>
      </form>

      {/* === FORM ĐỔI MẬT KHẨU === */}
      <form
        onSubmit={handleChangePassword}
        className="space-y-6 pt-8 border-t border-gray-100 mt-8 max-w-2xl"
      >
        <h3 className="text-lg font-bold">Password Change</h3>

        <div className="space-y-2">
          <Label htmlFor="oldPassword">Old Password</Label>
          <Input
            id="oldPassword"
            type="password"
            className="h-12 bg-white"
            value={passwords.oldPassword}
            onChange={handlePassChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="newPassword">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              className="h-12 bg-white"
              value={passwords.newPassword}
              onChange={handlePassChange}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Repeat Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="h-12 bg-white"
              value={passwords.confirmPassword}
              onChange={handlePassChange}
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="outline"
          className="bg-black hover:bg-gray-800 text-white h-12 px-8 rounded-md cursor-pointer"
          disabled={isLoading}
        >
          Change Password
        </Button>
      </form>
    </div>
  );
}
