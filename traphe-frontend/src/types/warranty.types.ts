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

export interface WarrantyTicketDetail extends WarrantyTicket {
  problemDescription: string;
  accessories: string;
  notes: string;
  technicianId: string;
  customerId: string;
  services?: WarrantyServiceItem[];
  parts?: WarrantyPartItem[];
  history?: WarrantyHistory[];
}

export interface WarrantyServiceItem {
  id: string;
  repairServiceId: string;
  serviceName?: string;
  cost: number;
  notes?: string;
}

export interface WarrantyPartItem {
  id: string;
  partId: string;
  partName?: string;
  quantity: number;
  cost: number;
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

export interface AddServiceRequest {
  repairServiceId: string;
  quantity?: number;
  notes?: string;
}

export interface AddPartRequest {
  partId: string;
  quantity: number;
  notes?: string;
}

export interface UpdateStatusRequest {
  status: WarrantyStatus;
  note?: string;
}
