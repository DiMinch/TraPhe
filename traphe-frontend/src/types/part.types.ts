export interface PartSupplier {
  supplierId: string;
  name: string;
}

export interface PartComponent {
  id: string;
  name: string;
  partType: string;
  supplier?: PartSupplier;
  unit: string;
  purchasePriceAvg: number;
  sellingPrice: number;
  minStock: number;
  currentStock: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePartRequest {
  name: string;
  partType: string;
  supplierId: string;
  unit: string;
  unitPrice: number;
  minStock: number;
}

export interface UpdatePartRequest {
  name: string;
  partType: string;
  supplierId: string;
  unit: string;
  unitPrice: number;
  minStock: number;
}
