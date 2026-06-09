import { WarrantyStatus } from "@/enums/warranty.enum";

export interface WarrantyTicket {
  id: string;
  ticketNumber: string;
  serialNumber: string;
  productName: string;
  customerName: string;
  customerPhone: string;
  technicianName: string;
  status: WarrantyStatus;
  isUnderWarranty: boolean;
  totalCost: number;
  receivedDate: string;
  expectedReturnDate: string;
  createdAt: string;
}

export interface WarrantyProduct {
  variantId: string;
  sku: string;
  productName: string;
  variantName: string;
}

export interface WarrantyCustomer {
  customerId: string | null;
  name: string;
  phone: string;
  email: string | null;
}

export interface WarrantyTechnician {
  id: string;
  name: string;
}

export interface WarrantyTicketDetail {
  id: string;
  ticketNumber: string;
  product: WarrantyProduct;
  serialNumber: string;
  customer: WarrantyCustomer;
  technician: WarrantyTechnician | null;
  problemDescription: string;
  accessories: string;
  isUnderWarranty: boolean;
  warrantyExpireDate: string | null;
  status: WarrantyStatus;
  receivedDate: string;
  expectedReturnDate: string;
  actualReturnDate: string | null;
  totalServiceCost: number;
  totalPartCost: number;
  totalCost: number;
  services: WarrantyServiceItem[];
  parts: WarrantyPartItem[];
  notes: string;
  cancellationReason: string | null;
  createdAt: string;
  updatedAt: string;
  history?: WarrantyHistory[];
}

export interface WarrantyServiceItem {
  id: string;
  repairServiceId: string;
  serviceName: string;
  serviceDescription?: string;
  status: string;
  unitPrice: number;
  additionalCost: number;
  totalCost: number;
  completedAt: string | null;
  notes: string | null;
}

export interface WarrantyPartItem {
  id: string;
  partId: string;
  partName: string;
  quantity: number;
  unitPrice: number;
  totalCost: number;
}

export interface WarrantyHistory {
  id: string;
  action: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

export interface WarrantyDashboardStats {
  totalTickets: number;
  pendingTickets: number;
  processingTickets: number;
  completedTickets: number;
  revenue: number;
}

export interface CreateTicketRequest {
  serialNumber: string;
  customerId?: string;
  customerName: string;
  customerPhone: string;
  problemDescription: string;
  accessories?: string;
  technicianId?: string;
  expectedReturnDate: string;
  services?: {
    repairServiceId: string;
    additionalCost: number;
    notes?: string;
  }[];
  notes?: string;
}

export interface UpdateTicketRequest {
  problemDescription?: string;
  accessories?: string;
  technicianId?: string;
  expectedReturnDate?: string;
  notes?: string;
}

export interface ReassignTechnicianRequest {
  newTechnicianId: string;
  reason: string;
}

export interface AddPartRequest {
  parts: WarrantyPartRequestItem[];
}

export interface UpdateStatusRequest {
  status: WarrantyStatus;
  note?: string;
}

export interface WarrantyServiceRequestItem {
  repairServiceId: string;
  additionalCost: number;
  note?: string;
}

export interface AddServiceRequest {
  services: {
    repairServiceId: string;
    additionalCost: number;
    note?: string;
  }[];
}

export interface WarrantyPartRequestItem {
  partComponentId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface WarrantyDashboardStats {
  totalTickets: number;
  receivedCount: number;
  processingCount: number;
  waitingForPartsCount: number;
  completedCount: number;
  returnedCount: number;
  cancelledCount: number;
  overdueCount: number;
  totalRevenue: number;
  totalServiceRevenue: number;
  totalPartRevenue: number;
  ticketsThisMonth: number;
  ticketsLastMonth: number;
  avgRepairDays: number;
  ticketsByTechnician: Record<string, number>;
  ticketsByStatus: Record<string, number>;
  lowStockPartsCount: number;
}
