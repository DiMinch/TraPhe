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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight, Edit, Trash2, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { customerService } from "@/services/customer.service";
import type { Customer } from "@/types/customer.types";
import { toast } from "sonner";
import { PageContainer, PageHeader } from "@/components/layout/PageLayout";

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchCustomer = async () => {
      setIsLoading(true);
      try {
        const res = await customerService.getCustomerById(id);
        if (res.statusCode === 200 && res.data) {
          setCustomer(res.data);
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

    fetchCustomer();
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
                <Badge className="bg-yellow-100 text-yellow-700 hover:bg-yellow-100 border-yellow-200">
                  {customer.tier?.name || "No Tier"}
                </Badge>
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
                  {customer.totalPurchase?.toLocaleString()}â‚«
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

            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2 block">
                Notes
              </Label>
              <Textarea
                placeholder="Add internal notes about this customer..."
                className="min-h-[120px] resize-none"
              />
            </div>
          </Card>
        </div>

        {/* Right Side - Tabs */}
        <div>
          <Tabs defaultValue="address" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="order-history" className="cursor-pointer">
                Order History
              </TabsTrigger>
              <TabsTrigger value="address" className="cursor-pointer">
                Address
              </TabsTrigger>
              <TabsTrigger value="loyalty" className="cursor-pointer">
                Loyalty History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="order-history">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="text-center py-10 text-gray-500">
                    No orders found for this customer.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="address">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  {/* Table */}
                  <div className="rounded-md border border-slate-200">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-slate-100">
                          <TableHead className="w-[80px]">Primary</TableHead>
                          <TableHead>Address</TableHead>
                          <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.addresses && customer.addresses.length > 0 ? (
                          customer.addresses.map((address, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Checkbox checked={idx === 0} />
                              </TableCell>
                              <TableCell className="text-gray-700">
                                {address.addressDetail}
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center justify-center gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <Edit className="w-4 h-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center py-4 text-gray-500"
                            >
                              No addresses saved
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="loyalty">
              <Card className="shadow-lg border-0 bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <p className="text-gray-600">
                    Total Points Earned:{" "}
                    {customer.loyaltyPoint?.totalPoints || 0}
                  </p>
                  <p className="text-gray-600">
                    Total Points Used: {customer.loyaltyPoint?.pointsUsed || 0}
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
