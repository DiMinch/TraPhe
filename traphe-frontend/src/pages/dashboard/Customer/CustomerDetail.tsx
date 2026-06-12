import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { customerService } from "@/services/customer.service";
import { orderService, type OrderResponse } from "@/services/order.service";
import type { Customer } from "@/types/customer.types";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";
import { format } from "date-fns";

const SEGMENT_COLORS: Record<string, { label: string; color: string }> = {
  CHAMPIONS: { label: "Champions 🏆", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  LOYAL_CUSTOMERS: { label: "Trung thành ❤️", color: "bg-blue-100 text-blue-800 border-blue-200" },
  POTENTIAL_LOYALIST: { label: "Tiềm năng 🌟", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  NEW_CUSTOMERS: { label: "Mới 🆕", color: "bg-teal-100 text-teal-800 border-teal-200" },
  PROMISING: { label: "Hứa hẹn 👍", color: "bg-amber-100 text-amber-800 border-amber-200" },
  AT_RISK: { label: "Rủi ro ⚠️", color: "bg-rose-100 text-rose-800 border-rose-200" },
  HIBERNATING: { label: "Ngủ đông 💤", color: "bg-gray-100 text-gray-800 border-gray-200" },
  LOST: { label: "Đã mất ❌", color: "bg-red-100 text-red-800 border-red-200" },
};

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [isOrdersLoading, setIsOrdersLoading] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchCustomerAndOrders = async () => {
      setIsLoading(true);
      try {
        const res = await customerService.getCustomerById(id);
        if (res.statusCode === 200 && res.data) {
          setCustomer(res.data);
          // Fetch orders for this customer
          setIsOrdersLoading(true);
          try {
            const ordersRes = await orderService.getCustomerOrders(id, { size: 50 });
            if (ordersRes.statusCode === 200 && ordersRes.data) {
              setOrders(ordersRes.data.content);
            }
          } catch (err) {
            console.error("Failed to fetch customer orders:", err);
          } finally {
            setIsOrdersLoading(false);
          }
        } else {
          toast.error("Customer not found");
          navigate("/admin/loyalty/customers");
        }
      } catch (error) {
        toast.error("Failed to fetch customer details");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomerAndOrders();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!customer) return null;

  return (
    <PageContainer>
      <PageHeader
        title="Customer Detail"
        subtitle="View and manage customer information"
      />

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-6 text-sm text-gray-600">
        <button
          onClick={() => navigate("/admin/loyalty/customers")}
          className="hover:text-gray-900"
        >
          Customer List
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 font-medium">{customer.fullName}</span>
      </div>

      <div className="grid grid-cols-[350px_1fr] gap-6">
        {/* Left Side - Customer Info */}
        <div>
          {/* Identity Section */}
          <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm p-6 mb-6">
            <h3 className="text-base font-semibold mb-4">Identity</h3>

            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Name
              </Label>
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-gray-200 text-gray-700 font-bold">
                    {customer.fullName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 font-medium text-gray-900">
                  {customer.fullName}
                </div>
                <div className="flex flex-col gap-1 items-end">
                  <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                    {customer.tier?.name || "No Tier"}
                  </Badge>
                  {customer.rfmSegment && SEGMENT_COLORS[customer.rfmSegment] && (
                    <>
                      <Badge className={`${SEGMENT_COLORS[customer.rfmSegment].color} border text-[10px] whitespace-nowrap`}>
                        {SEGMENT_COLORS[customer.rfmSegment].label}
                      </Badge>
                      {customer.rScore !== undefined && customer.rScore !== null && (
                        <div className="flex gap-1 text-[9px] font-bold text-gray-500 bg-gray-50 border border-gray-200/60 rounded px-1.5 py-0.5 mt-1 justify-center">
                          <span>R:{customer.rScore}</span>
                          <span>F:{customer.fScore}</span>
                          <span>M:{customer.mScore}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <Label className="text-sm font-medium text-gray-700 mb-1 block">
                Loyalty Points
              </Label>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-2xl font-bold text-roast">
                  {customer.loyaltyPoint?.pointsAvailable || 0}
                </span>
                <span className="text-xs text-gray-500">points available</span>
              </div>

              <div className="text-xs text-gray-600 mb-1 flex justify-between">
                <span>Current Spending</span>
                <span className="font-semibold">
                  {customer.totalPurchase?.toLocaleString()}đ
                </span>
              </div>
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-roast rounded-full"
                  style={{ width: "40%" }}
                ></div>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <h4 className="text-sm font-semibold text-gray-900">Contact</h4>
              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-1">
                  Phone
                </Label>
                <div className="text-sm text-gray-900">{customer.phone}</div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 block mb-1">
                  Email
                </Label>
                <div className="text-sm text-gray-900">
                  {customer.email || "N/A"}
                </div>
              </div>
            </div>

          </Card>
        </div>

        {/* Right Side - Tabs */}
        <div>
          <Tabs defaultValue="order-history" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="order-history" className="cursor-pointer">
                Lịch sử mua hàng
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="cursor-pointer">
                Lịch sử tích/đổi điểm
              </TabsTrigger>
            </TabsList>

            <TabsContent value="order-history">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  {isOrdersLoading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                    </div>
                  ) : orders.length > 0 ? (
                    <div className="rounded-md border border-slate-200">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                            <TableHead>Mã ĐH</TableHead>
                            <TableHead>Ngày đặt</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                            <TableHead>Trạng thái</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.map((order) => (
                            <TableRow key={order.orderId}>
                              <TableCell className="font-medium text-gray-900">
                                {order.orderNumber}
                              </TableCell>
                              <TableCell className="text-gray-600">
                                {format(new Date(order.createdAt), "dd/MM/yyyy HH:mm")}
                              </TableCell>
                              <TableCell className="text-gray-900">
                                {order.finalAmount.toLocaleString()}đ
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                                  {order.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-10 text-gray-500">
                      Khách hàng này chưa có đơn hàng nào.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <p className="text-gray-600 mb-2">
                    Tổng điểm đã tích:{" "}
                    <span className="font-semibold text-roast">{customer.loyaltyPoint?.totalPoints || 0}</span>
                  </p>
                  <p className="text-gray-600">
                    Tổng điểm đã dùng:{" "}
                    <span className="font-semibold text-rose-600">{customer.loyaltyPoint?.pointsUsed || 0}</span>
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageContainer>
  );
}
