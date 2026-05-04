import { UserRole } from "@/enums/roles";
import { UserStatus, LinkingStatus } from "@/enums/user";

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
  hasEmailProvider?: boolean;
  shouldPromptLinking?: boolean;
  linkingStatus?: LinkingStatus;
}
