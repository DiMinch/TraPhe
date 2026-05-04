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

export interface Province {
  code: string;
  name: string;
}

export interface Commune {
  code: string;
  name: string;
  provinceCode: string;
}

export interface UserAddress {
  id: string;
  street: string;
  communeCode: string;
  communeName?: string;
  provinceCode: string;
  provinceName?: string;
  type: string;
  isPrimary: boolean;
  postalCode?: string;
  detailAddress?: string;
}

export interface CreateAddressRequest {
  street: string;
  communeCode: string;
  provinceCode: string;
  type: string;
  isPrimary: boolean;
  postalCode?: string;
}
