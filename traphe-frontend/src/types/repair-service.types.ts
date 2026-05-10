export interface RepairService {
  id: string;
  name: string;
  description: string;
  standardPrice: number;
  estimatedDuration: string;
  category?: string;
  isActive: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRepairServiceRequest {
  name: string;
  description?: string;
  standardPrice: number;
  estimatedDuration: string;
  category?: string;
  isActive: boolean;
  notes?: string;
}

export interface UpdateRepairServiceRequest extends CreateRepairServiceRequest {}
