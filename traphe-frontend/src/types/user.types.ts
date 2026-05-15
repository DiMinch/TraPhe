import { UserRole } from "@/enums/roles.enum";
import { UserStatus, LinkingStatus } from "@/enums/user.enum";

export interface UserInfo {
  id: string;
  customerId?: string;
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
  tier?: {
    name: string;
    discountRate: number;
    minPoint: number;
    description?: string;
  };
  loyaltyPoint?: {
    totalPoints: number;
    pointsAvailable: number;
    pointsUsed: number;
    pointsToNextTier?: number;
  };
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
  contactName?: string;
  contactPhone?: string;
}

export interface CreateAddressRequest {
  street: string;
  communeCode: string;
  provinceCode: string;
  type: string;
  isPrimary: boolean;
  postalCode?: string;
  contactName?: string;
  contactPhone?: string;
}
