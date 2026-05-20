// ============================
// User Address Types
// ============================

export interface UserAddress {
  id: string;
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  wardCode: string;
  wardName: string;
  provinceCode: string;
  provinceName: string;
  isDefault: boolean;
  fullAddress: string;
  createdAt: string;
}

export interface CreateUserAddressRequest {
  recipientName: string;
  recipientPhone: string;
  addressLine: string;
  wardCode: string;
  wardName: string;
  provinceCode: string;
  provinceName: string;
  isDefault?: boolean;
}

export interface UpdateUserAddressRequest {
  recipientName?: string;
  recipientPhone?: string;
  addressLine?: string;
  wardCode?: string;
  wardName?: string;
  provinceCode?: string;
  provinceName?: string;
  isDefault?: boolean;
}

// ============================
// Vietnam Administrative Division Types (v2 — 2-tier: Province > Ward)
// ============================

export interface VnProvince {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  wards: VnWard[];
}

export interface VnWard {
  name: string;
  code: number;
  division_type: string;
  codename: string;
}
