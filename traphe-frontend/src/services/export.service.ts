/**
 * Export Service
 * Centralized service for exporting data to CSV/Excel formats
 * Works with any array of objects and handles file downloads
 */

export interface ExportColumn<T> {
  key: keyof T | string;
  header: string;
  formatter?: (value: any, row: T) => string | number;
}

export type ExportFormat = "CSV" | "EXCEL";

/**
 * Generate CSV content from data array
 */
function generateCSVContent<T>(data: T[], columns: ExportColumn<T>[]): string {
  // Add BOM for Excel UTF-8 compatibility
  const BOM = "\ufeff";

  // Generate header row
  const headers = columns.map((col) => `"${col.header}"`).join(",");

  // Generate data rows
  const rows = data.map((row) => {
    return columns
      .map((col) => {
        const keys = String(col.key).split(".");
        let value: any = row;
        for (const k of keys) {
          value = value?.[k];
        }

        if (col.formatter) {
          value = col.formatter(value, row);
        }

        // Handle null/undefined
        if (value === null || value === undefined) {
          return '""';
        }

        // Convert to string and escape quotes
        const stringValue = String(value).replace(/"/g, '""');
        return `"${stringValue}"`;
      })
      .join(",");
  });

  return BOM + [headers, ...rows].join("\r\n");
}

/**
 * Trigger file download in browser
 */
function downloadFile(
  content: string | Blob,
  filename: string,
  type: string,
): void {
  const blob =
    content instanceof Blob ? content : new Blob([content], { type });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Download file from URL (for backend-generated exports)
 */
async function downloadFromUrl(url: string, filename: string): Promise<void> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Failed to download file");
    }
    const blob = await response.blob();
    downloadFile(blob, filename, blob.type);
  } catch (error) {
    console.error("Download error:", error);
    throw error;
  }
}

/**
 * Generate timestamp for filenames
 */
function getTimestamp(): string {
  const now = new Date();
  return now.toISOString().split("T")[0]; // YYYY-MM-DD format
}

export const exportService = {
  /**
   * Export data array to CSV file
   */
  exportToCSV: <T>(
    data: T[],
    columns: ExportColumn<T>[],
    filenamePrefix: string,
  ): void => {
    const content = generateCSVContent(data, columns);
    const filename = `${filenamePrefix}_${getTimestamp()}.csv`;
    downloadFile(content, filename, "text/csv;charset=utf-8;");
  },

  /**
   * Export data array to Excel-compatible CSV
   * (Same as CSV but with .xlsx extension for better UX)
   */
  exportToExcel: <T>(
    data: T[],
    columns: ExportColumn<T>[],
    filenamePrefix: string,
  ): void => {
    const content = generateCSVContent(data, columns);
    const filename = `${filenamePrefix}_${getTimestamp()}.xlsx`;
    downloadFile(
      content,
      filename,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );
  },

  /**
   * Download file from a URL (for backend-generated exports)
   */
  downloadFromUrl,

  /**
   * Download blob directly
   */
  downloadBlob: (blob: Blob, filename: string): void => {
    downloadFile(blob, filename, blob.type);
  },

  /**
   * Get formatted timestamp for filenames
   */
  getTimestamp,
};

// Pre-defined column configurations for common exports

export const inventoryColumns: ExportColumn<any>[] = [
  { key: "sku", header: "SKU" },
  { key: "productName", header: "Product Name" },
  { key: "variantName", header: "Variant Name" },
  { key: "category", header: "Category" },
  { key: "supplier", header: "Supplier" },
  { key: "physical", header: "Physical Qty" },
  { key: "reserved", header: "Reserved Qty" },
  { key: "available", header: "Available Qty" },
  { key: "status", header: "Status" },
];

export const transactionColumns: ExportColumn<any>[] = [
  { key: "date", header: "Date" },
  { key: "time", header: "Time" },
  { key: "type", header: "Transaction Type" },
  { key: "product", header: "Product" },
  { key: "quantity", header: "Quantity" },
  { key: "reference", header: "Reference" },
  { key: "reasons", header: "Reason" },
  { key: "note", header: "Note" },
];

export const orderColumns: ExportColumn<any>[] = [
  { key: "orderNumber", header: "Order #" },
  { key: "date", header: "Date" },
  { key: "customerName", header: "Customer" },
  { key: "items", header: "Items" },
  { key: "total", header: "Total" },
  { key: "status", header: "Status" },
  { key: "paymentStatus", header: "Payment Status" },
];

export const productColumns: ExportColumn<any>[] = [
  { key: "sku", header: "SKU" },
  { key: "name", header: "Product Name" },
  { key: "category", header: "Category" },
  { key: "basePrice", header: "Base Price" },
  { key: "discountedPrice", header: "Discounted Price" },
  { key: "stock", header: "Stock" },
  { key: "status", header: "Status" },
];

export const customerColumns: ExportColumn<any>[] = [
  { key: "name", header: "Customer Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "tier", header: "Tier" },
  { key: "totalOrders", header: "Total Orders" },
  { key: "totalSpent", header: "Total Spent" },
  { key: "createdAt", header: "Created Date" },
];

export const supplierColumns: ExportColumn<any>[] = [
  { key: "code", header: "Supplier Code" },
  { key: "name", header: "Supplier Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "address", header: "Address" },
  { key: "status", header: "Status" },
];

export const userColumns: ExportColumn<any>[] = [
  { key: "username", header: "Username" },
  { key: "fullName", header: "Full Name" },
  { key: "email", header: "Email" },
  { key: "phone", header: "Phone" },
  { key: "role", header: "Role" },
  { key: "status", header: "Status" },
  { key: "createdAt", header: "Created Date" },
];

export const promotionColumns: ExportColumn<any>[] = [
  { key: "code", header: "Promo Code" },
  { key: "name", header: "Promotion Name" },
  { key: "discountType", header: "Discount Type" },
  { key: "discountValue", header: "Discount Value" },
  { key: "startDate", header: "Start Date" },
  { key: "endDate", header: "End Date" },
  { key: "status", header: "Status" },
  { key: "usageCount", header: "Usage Count" },
];

export const purchaseOrderColumns: ExportColumn<any>[] = [
  { key: "poNumber", header: "PO Number" },
  { key: "date", header: "Date" },
  { key: "supplier", header: "Supplier" },
  { key: "items", header: "Items" },
  { key: "totalAmount", header: "Total Amount" },
  { key: "status", header: "Status" },
  { key: "expectedDelivery", header: "Expected Delivery" },
];

export const warrantyColumns: ExportColumn<any>[] = [
  { key: "ticketNumber", header: "Ticket #" },
  { key: "date", header: "Date" },
  { key: "customer", header: "Customer" },
  { key: "product", header: "Product" },
  { key: "serialNumber", header: "Serial Number" },
  { key: "issueType", header: "Issue Type" },
  { key: "status", header: "Status" },
  { key: "priority", header: "Priority" },
];

export default exportService;
