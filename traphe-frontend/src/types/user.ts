import { UserRole } from "@/enums/roles";
import { UserStatus } from "@/enums/user";

export interface UserInfo {
  id: string;
  username: string;
  email: string;
  roles: UserRole[];
  isFirstLogin: boolean;
  fullName?: string;
  phone?: string;
  avatar?: string;
  status?: UserStatus;
}
