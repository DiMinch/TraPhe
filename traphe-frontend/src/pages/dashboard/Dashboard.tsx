import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown } from "lucide-react";

export default function DashboardPage() {
  const keyMetrics = [
    {
      title: "Revenue",
      value: "$510.0",
      change: "25% vs last 3 months",
      trend: "up",
      color: "bg-orange-500",
    },
    {
      title: "Gross Profit",
      value: "$250.0",
      change: "25% vs last 3 months",
      trend: "down",
      color: "bg-teal-500",
    },
  ];

  const topSellingProducts = [
    {
      id: "P0024",
      product: "Lenovo ThinkPad",
      totalOrders: 1037,
      totalSales: "$960,000",
    },
    { id: "P027", product: "ASUS", totalOrders: 1024, totalSales: "$826,000" },
    {
      id: "P0073",
      product: "ZADEZ Mouse",
      totalOrders: 2038,
      totalSales: "$726,500",
    },
    {
      id: "P0246",
      product: "LCD Screen",
      totalOrders: 543,
      totalSales: "$691,000",
    },
    {
      id: "P0001",
      product: "LEN Mouse",
      totalOrders: 500,
      totalSales: "$327,120",
    },
  ];

  const lowStockAlert = [
    { id: "P0024", product: "ThinkPad", quantity: 1037 },
    { id: "P027", product: "ASUS", quantity: 1024 },
    { id: "P0073", product: "ZADEZ Mouse", quantity: 2038 },
    { id: "P0246", product: "LCD Screen", quantity: 543 },
    { id: "P0001", product: "LEN Mouse", quantity: 500 },
  ];

  const pendingOrders = [
    { id: "O12", customer: "Nguyen Minh A", total: "$1,000" },
    { id: "O367", customer: "Pham Quoc B", total: "$500" },
    { id: "O9r2", customer: "Pham Ha Anh T", total: "$30" },
    { id: "O13", customer: "Luu Minh D", total: "$549" },
    { id: "O59", customer: "Pham Duy E", total: "$200,000" },
  ];

  const warrantyTickets = [
    { id: "O12", technician: "Nguyen Minh A", status: "Waiting For Parts" },
    { id: "O367", technician: "Pham Quoc B", status: "Processing" },
    { id: "O9r2", technician: "Pham Ha Anh T", status: "Processing" },
    { id: "O13", technician: "Luu Minh D", status: "Processing" },
    { id: "O59", technician: "Pham Duy E", status: "Completed" },
  ];

  const auditLogs = [
    { text: "Luu Minh D added a new category", time: "8:35 PM 23/1/2025" },
    {
      text: "Pham Ha Anh T changed the status of Ticket #032 to Processing",
      time: "8:38 PM 23/1/2025",
    },
  ];

  const categories = [
    { name: "Best Seller", value: 4567, color: "bg-yellow-500" },
    { name: "Slow Moving", value: 1845, color: "bg-teal-600" },
    { name: "Fast Moving", value: 3167, color: "bg-orange-600" },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome Admin: Nguyen Van A
          </span>
          <Button variant="outline" size="sm">
            EN
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
          <Avatar>
            <AvatarFallback className="bg-green-600 text-white">
              M
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        {keyMetrics.map((metric) => (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {metric.title}
              </CardTitle>
              <div className={`w-3 h-3 rounded-full ${metric.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-gray-500 mt-1">{metric.change}</p>
            </CardContent>
          </Card>
        ))}

        {/* Chart Card */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <Select defaultValue="month">
              <SelectTrigger className="w-32 h-8">
                <SelectValue placeholder="By Month" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="month">By Month</SelectItem>
                <SelectItem value="week">By Week</SelectItem>
                <SelectItem value="year">By Year</SelectItem>
              </SelectContent>
            </Select>
            <Avatar>
              <AvatarFallback className="bg-green-600 text-white">
                M
              </AvatarFallback>
            </Avatar>
          </CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-2">
              {[40, 20, -20, 30, 50, 40, 45, 38].map((val, i) => (
                <div
                  key={i}
                  className="flex-1 flex flex-col items-center justify-end"
                >
                  <div
                    className={`w-full ${
                      val > 0 ? "bg-red-400" : "bg-green-400"
                    } rounded-t`}
                    style={{ height: `${Math.abs(val)}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-4 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-red-400" />
                <span>Revenue</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span>Gross Profit</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Selling Categories */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Top Selling Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 relative">
              {categories.map((cat, idx) => {
                const size = 120 + idx * 40;
                const positions = [
                  { left: "20%", top: "10%" },
                  { left: "45%", top: "-5%" },
                  { left: "35%", top: "20%" },
                ];
                return (
                  <div
                    key={cat.name}
                    className={`absolute rounded-full ${cat.color} flex items-center justify-center text-white font-semibold opacity-80`}
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      ...positions[idx],
                    }}
                  >
                    <div className="text-center">
                      <div className="text-xl">
                        {cat.value.toLocaleString()}
                      </div>
                      <div className="text-xs">{cat.name}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-semibold">
              Top Selling Products
            </CardTitle>
            <ChevronDown className="w-5 h-5" />
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Total Orders</TableHead>
                  <TableHead>Total Sales</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topSellingProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">{product.id}</TableCell>
                    <TableCell>{product.product}</TableCell>
                    <TableCell>{product.totalOrders}</TableCell>
                    <TableCell>{product.totalSales}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Low Stock Alert */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity Available</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockAlert.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.id}</TableCell>
                    <TableCell>{item.product}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customer}</TableCell>
                    <TableCell>{order.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Warranty Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Warranty Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Technician</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {warrantyTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.id}</TableCell>
                    <TableCell>{ticket.technician}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          ticket.status === "Completed"
                            ? "default"
                            : "secondary"
                        }
                      >
                        {ticket.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* System Warnings and Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Warnings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              System Warnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-red-500 text-sm">Audit Log conflicts</span>
              <Button variant="outline" size="sm">
                Find out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Audit Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.map((log, idx) => (
                <div key={idx} className="text-sm">
                  <p className="text-gray-700">{log.text}</p>
                  <p className="text-gray-400 text-xs">{log.time}</p>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 mt-4">
              <Button variant="ghost" size="sm">
                Previous
              </Button>
              <Button variant="outline" size="sm">
                1
              </Button>
              <Button variant="ghost" size="sm">
                Next
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
