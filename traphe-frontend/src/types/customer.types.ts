export interface CustomerTier {
  id: string;
  name: string;
  tierLevel: number;
  minSpending: number;
  pointEarningRate: number;
  discountRate: number;
  description?: string;
  active: boolean;
  createdAt?: string;
}

export interface LoyaltyPoint {
  id: string;
  totalPoints: number;
  pointsAvailable: number;
  pointsUsed: number;
  pointRate: number;
}

export interface CustomerAddress {
  id?: string;
  label?: string;
  recipientName?: string;
  recipientPhone?: string;
  province?: string;
  ward?: string;
  addressDetail: string;
  isPrimary?: boolean;
}

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
  totalPurchase: number;
  tier?: CustomerTier;
  loyaltyPoint?: LoyaltyPoint;
  rfmSegment?: string;
  rScore?: number;
  fScore?: number;
  mScore?: number;
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
  tierLevel: number;
  minSpending: number;
  pointEarningRate: number;
  discountRate: number;
  description?: string;
}
