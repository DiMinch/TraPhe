import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Filter, Loader2, ArrowLeftRight, Download } from "lucide-react";
import { useState, useEffect } from "react";
import {
  purchaseOrderService,
  type PurchaseOrderResponse,
} from "@/services/purchase-order.service";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

interface Transaction {
  id: string;
  time: string;
  date: string;
  type: "STOCK_IN" | "STOCK_OUT" | "ADJUSTMENT" | "RETURN" | "TRANSFER";
  product: string;
  quantity: number;
  reference: string;
  reasons: string;
  note: string;
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>("all-types");
  const [filterDateRange, setFilterDateRange] = useState<string>("all-days");
  const [filterCategory, setFilterCategory] = useState<string>("both");

  // Fetch stock transactions from Purchase Orders API
  const fetchTransactions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await purchaseOrderService.getAllPurchaseOrders();

      // Transform Purchase Orders to transactions (only RECEIVED orders create stock transactions)
      const transformedData: Transaction[] = [];

      response.data.forEach((po: PurchaseOrderResponse) => {
        if (po.status === "RECEIVED" || po.status === "CLOSED") {
          po.items.forEach((item) => {
            // Skip items without product variant or with zero quantity
            if (!item.productVariant || item.quantityReceived <= 0) {
              return;
            }

            const receivedDate = po.actualDeliveryDate
              ? new Date(po.actualDeliveryDate)
              : new Date(po.updatedAt);

            const productName =
              item.productVariant.productName || "Unknown Product";
            const variantName = item.productVariant.variantName || "";
            const sku = item.productVariant.sku || "N/A";
            const productDisplay = variantName
              ? `${productName} - ${variantName} (${sku})`
              : `${productName} (${sku})`;

            transformedData.push({
              id: `${po.id}-${item.id}`,
              time: receivedDate.toLocaleTimeString("en-US", {
                hour: "numeric",
                minute: "2-digit",
                hour12: true,
              }),
              date: receivedDate.toLocaleDateString("en-GB"),
              type: "STOCK_IN",
              product: productDisplay,
              quantity: item.quantityReceived,
              reference: po.poNumber,
              reasons:
                po.status === "RECEIVED"
                  ? "Purchase Order Received"
                  : "Purchase Order Completed",
              note: `Supplier: ${po.supplier?.name || "N/A"}`,
            });
          });
        }
      });

      // Sort by date descending (newest first)
      transformedData.sort((a, b) => {
        const dateA = new Date(
          a.date.split("/").reverse().join("-") + " " + a.time,
        );
        const dateB = new Date(
          b.date.split("/").reverse().join("-") + " " + b.time,
        );
        return dateB.getTime() - dateA.getTime();
      });

      setTransactions(transformedData);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);

      // Handle different error types
      if (err.response) {
        const status = err.response.status;
        if (status === 401) {
          setError("Authentication required. Please sign in.");
        } else if (status === 403) {
          setError(
            "You don't have permission to view purchase orders. ADMIN or EMPLOYEE role required.",
          );
        } else if (status === 400) {
          // Backend has data integrity issue - show specific error
          setError(
            "Backend data error: Some purchase order items have missing product variants. Please fix the database data.",
          );
        } else if (status === 500) {
          setError(
            "Server error: The backend encountered an issue processing purchase orders. Check server logs.",
          );
        } else {
          setError(
            `Server error (${status}): ${
              err.response.data?.message || "Failed to fetch transactions"
            }`,
          );
        }
      } else if (err.request) {
        setError(
          "Cannot connect to server. Please check if the backend is running.",
        );
      } else {
        setError(err.message || "Failed to fetch stock transactions");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Filter transactions based on selected filters
  const filteredTransactions = transactions.filter((transaction) => {
    // Filter by type
    if (filterType !== "all-types") {
      const typeMap: Record<string, string> = {
        "stock-in": "STOCK_IN",
        "stock-out": "STOCK_OUT",
        adjustment: "ADJUSTMENT",
        return: "RETURN",
        transfer: "TRANSFER",
      };
      if (transaction.type !== typeMap[filterType]) {
        return false;
      }
    }
    return true;
  });

  // Get badge color based on transaction type
  const getBadgeColor = (type: string) => {
    switch (type) {
      case "STOCK_IN":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "STOCK_OUT":
        return "bg-red-50 text-red-700 border-red-200";
      case "ADJUSTMENT":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "RETURN":
        return "bg-green-50 text-green-700 border-green-200";
      case "TRANSFER":
        return "bg-orange-50 text-orange-700 border-orange-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  return (
    <PageContainer>
      <PageHeader
        title="Stock Transactions"
        subtitle="Track all inventory movements and stock changes"
        onRefresh={fetchTransactions}
      />

      <div className="flex items-center justify-end mb-6">
        <Button
          className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white shadow-lg"
          size="sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Export Excel
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-end gap-3 mb-6">
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 bg-white border-slate-200 hover:bg-slate-50"
        >
          <Filter className="w-4 h-4" />
        </Button>

        <Select value={filterDateRange} onValueChange={setFilterDateRange}>
          <SelectTrigger className="w-[140px] bg-white border-slate-200">
            <SelectValue placeholder="All days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-days">All days</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[200px] bg-white border-slate-200">
            <SelectValue placeholder="All Transactions Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Transactions Type</SelectItem>
            <SelectItem value="stock-in">Stock In</SelectItem>
            <SelectItem value="stock-out">Stock Out</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
            <SelectItem value="return">Return</SelectItem>
            <SelectItem value="transfer">Transfer</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[240px] bg-white border-slate-200">
            <SelectValue placeholder="Both Product & Components" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="both">Both Product & Components</SelectItem>
            <SelectItem value="products">Products Only</SelectItem>
            <SelectItem value="components">Components Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Card */}
      <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
        <CardContent className="p-6">
          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
              <p className="mt-3 text-slate-600">Loading transactions...</p>
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center max-w-md">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-4">
                  <p className="text-red-600 font-semibold mb-2">
                    Error Loading Transactions
                  </p>
                  <p className="text-red-700 text-sm mb-4">{error}</p>
                  <div className="flex gap-2 justify-center">
                    <Button
                      onClick={fetchTransactions}
                      variant="outline"
                      size="sm"
                    >
                      Retry
                    </Button>
                    {error.includes("Authentication") && (
                      <Button
                        onClick={() => (window.location.href = "/sign-in")}
                        size="sm"
                        className="bg-gradient-to-r from-indigo-600 to-indigo-700"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Table */}
          {!loading && !error && filteredTransactions.length === 0 ? (
            <EmptyState
              icon={<ArrowLeftRight className="w-8 h-8 text-slate-400" />}
              title="No transactions found"
              description="Stock transactions will appear here when orders are received"
            />
          ) : (
            !loading &&
            !error && (
              <div className="overflow-hidden rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                      <TableHead className="font-semibold text-slate-600">
                        Time
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Transaction Type
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Product/Component
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Quantity
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Reference
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Reasons
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600">
                        Note
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTransactions.map((transaction) => (
                      <TableRow
                        key={transaction.id}
                        className="hover:bg-slate-50/50 border-b last:border-b-0"
                      >
                        <TableCell className="py-4">
                          <div>
                            <div className="font-medium text-slate-800">
                              {transaction.time}
                            </div>
                            <div className="text-sm text-slate-500">
                              {transaction.date}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge
                            variant="outline"
                            className={`${getBadgeColor(transaction.type)} font-normal`}
                          >
                            {transaction.type.replace(/_/g, " ")}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium text-slate-800 py-4">
                          {transaction.product}
                        </TableCell>
                        <TableCell className="py-4">
                          <span
                            className={`font-semibold ${
                              transaction.quantity > 0
                                ? "text-emerald-600"
                                : "text-red-600"
                            }`}
                          >
                            {transaction.quantity > 0 ? "+ " : ""}
                            {transaction.quantity}
                          </span>
                        </TableCell>
                        <TableCell className="text-slate-600 py-4">
                          {transaction.reference}
                        </TableCell>
                        <TableCell className="text-slate-600 py-4">
                          {transaction.reasons || "-"}
                        </TableCell>
                        <TableCell className="text-slate-600 py-4">
                          {transaction.note || "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          )}

          {/* Pagination */}
          <div className="flex items-center justify-between pt-6 border-t mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive>
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
