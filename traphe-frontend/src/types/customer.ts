export interface CustomerTier {
  id: string;
  name: string;
  minPoint: number;
  discountRate: number;
  description?: string;
  status: "ACTIVE" | "INACTIVE"; //TODO: redefine later
  customerCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoyaltyPoint {
  id: string;
  totalPoints: number;
  pointsAvailable: number;
  pointsUsed: number;
  pointRate: number;
}

export interface CustomerAddress {
  id?: number;
  address: string;
  // TODO: add another field later
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  totalPurchase: number;
  tier?: CustomerTier;
  loyaltyPoint?: LoyaltyPoint;
  addresses: CustomerAddress[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  fullName: string;
  phone: string;
  email: string;
  tierId: string;
}

export interface UpdateCustomerRequest {
  fullName: string;
  phone: string;
  email: string;
  tierId: string;
}

export interface CustomerTierRequest {
  name: string;
  minPoint: number;
  discountRate: number;
  description?: string;
}
