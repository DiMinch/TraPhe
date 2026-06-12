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
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Search,
  Edit,
  Loader2,
  Users,
  UserPlus,
  Crown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { customerService } from "@/services/customer.service";
import { customerTierService } from "@/services/customer-tier.service";
import type { Customer } from "@/types/customer.types";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  PageContainer,
  PageHeader,
  EmptyState,
} from "@/components/layout/PageLayout";

export default function CustomerPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [customers, setCustomers] = useState<Customer[]>([]);

  // Client-side pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [custRes, tierRes] = await Promise.all([
        customerService.getCustomers(),
        customerTierService.getActiveTiers(),
      ]);

      if (custRes.statusCode === 200 && custRes.data) {
        // Handle both direct array and paginated response
        const customersData = Array.isArray(custRes.data)
          ? custRes.data
          : (custRes.data as any)?.content || [];

        // Sort by createdAt descending (newest first)
        customersData.sort((a: Customer, b: Customer) => {
          const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
          const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
          return dateB.getTime() - dateA.getTime();
        });

        setCustomers(customersData);
      }
      if (tierRes.statusCode === 200 && tierRes.data) {
        // Tiers fetched successfully
      }
    } catch (error) {
      toast.error("Không thể tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Compute stats from real data
  const totalCustomers = customers.length;
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const newCustomersCount = customers.filter(c => {
    if (!c.createdAt) return false;
    return new Date(c.createdAt) >= thirtyDaysAgo;
  }).length;
  const vipCount = customers.filter(c => {
    if (!c.tier) return false;
    return c.tier.tierLevel >= 3; // Level 3+ is VIP
  }).length;

  const totalPages = Math.ceil(customers.length / itemsPerPage);
  const currentCustomers = customers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  return (
    <PageContainer>
      <PageHeader
        title="Danh sách Khách hàng"
        subtitle="Quản lý khách hàng và hạng thành viên"
        onRefresh={fetchData}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card className="shadow-lg border-0 bg-gradient-to-br from-blue-500 to-blue-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Users className="w-5 h-5" />
                </div>
                <p className="text-sm text-blue-100">Tổng khách hàng</p>
              </div>
              <p className="text-3xl font-bold">{totalCustomers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <UserPlus className="w-5 h-5" />
                </div>
                <p className="text-sm text-emerald-100">Mới trong 30 ngày</p>
              </div>
              <p className="text-3xl font-bold">{newCustomersCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white overflow-hidden">
          <CardContent className="p-6 relative">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <div className="relative">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Crown className="w-5 h-5" />
                </div>
                <p className="text-sm text-amber-100">Khách VIP</p>
              </div>
              <p className="text-3xl font-bold">{vipCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Table */}
      <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm rounded-2xl overflow-hidden">
        <CardContent className="p-0">
          {/* Search */}
          <div className="flex items-center gap-3 p-6 bg-gradient-to-r from-slate-50/80 to-foam/50 border-b border-slate-200/60">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Tìm theo tên, SĐT hoặc email"
                className="pl-10 bg-white border-slate-200 focus:border-roast focus:ring-2 focus:ring-roast/20 rounded-lg h-10 shadow-sm"
              />
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-foam to-purple-100 flex items-center justify-center animate-pulse">
                  <Loader2 className="w-8 h-8 animate-spin text-roast" />
                </div>
                <span className="mt-4 text-slate-600 font-medium">
                  Đang tải danh sách khách hàng...
                </span>
              </div>
            ) : customers.length === 0 ? (
              <EmptyState
                icon={<Users className="w-8 h-8 text-slate-400" />}
                title="Chưa có khách hàng"
                description="Khách hàng sẽ xuất hiện khi họ đăng ký tài khoản"
              />
            ) : (
              <div className="rounded-xl border border-slate-200/60 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100/50">
                      <TableHead className="font-semibold text-slate-700">
                        Khách hàng
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Hạng
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Tổng chi tiêu
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Điểm
                      </TableHead>
                      <TableHead className="font-semibold text-slate-700">
                        Ngày tham gia
                      </TableHead>
                      <TableHead className="text-center font-semibold text-slate-700">
                        Thao tác
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentCustomers.map((customer) => (
                      <TableRow
                        key={customer.id}
                        className="border-slate-100 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-foam/30 transition-all duration-200"
                      >
                        <TableCell>
                          <button
                            onClick={() => navigate(`/admin/loyalty/customers/${customer.id}`)}
                            className="text-left hover:text-roast cursor-pointer transition-colors"
                          >
                            <div className="font-medium text-slate-800">
                              {customer.fullName}
                            </div>
                            <div className="text-sm text-slate-500">
                              {customer.phone}
                            </div>
                            <div className="text-xs text-slate-400">
                              {customer.email}
                            </div>
                          </button>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-roast/20 text-roast/90 hover:bg-roast/20 border-0 rounded-full px-3">
                            {customer.tier?.name || "N/A"}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-semibold text-slate-800">
                          {customer.totalPurchase?.toLocaleString("vi-VN")}đ
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-amber-50 text-amber-700 border-amber-200 rounded-full px-3"
                          >
                            {customer.loyaltyPoint?.pointsAvailable || 0} pts
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-slate-500">
                          {customer.createdAt
                            ? format(new Date(customer.createdAt), "dd/MM/yyyy")
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-9 w-9 rounded-lg text-slate-600 hover:text-roast hover:bg-roast/10 transition-colors"
                              onClick={() => navigate(`/admin/loyalty/customers/${customer.id}`)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination */}
            {customers.length > 0 && (
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-slate-200/60">
                <p className="text-sm text-slate-500">
                  Trang{" "}
                  <span className="font-medium text-slate-700">
                    {currentPage}
                  </span>{" "}
                  /{" "}
                  <span className="font-medium text-slate-700">
                    {totalPages}
                  </span>
                </p>
                <Pagination>
                  <PaginationContent className="gap-1">
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((p) => Math.max(1, p - 1))
                        }
                        className="cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                      />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((p) => Math.min(totalPages, p + 1))
                        }
                        className="cursor-pointer rounded-lg hover:bg-slate-100 transition-colors"
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

    </PageContainer>
  );
}
