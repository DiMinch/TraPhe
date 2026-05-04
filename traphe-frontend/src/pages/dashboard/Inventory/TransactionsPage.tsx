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
import { BellIcon, Filter } from "lucide-react";
import { CURRENT_USER } from "@/constants/user";
import { inventoryTransactions } from "@/data/mockData";

export default function TransactionsPage() {
  const transactions = inventoryTransactions;

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Stock Transactions</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            Welcome {CURRENT_USER.role} {CURRENT_USER.name}
          </span>
          <Button variant="outline" size="icon">
            <BellIcon className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm">
            CN
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center justify-end gap-3 mb-6">
        <Button variant="outline" size="icon" className="shrink-0 bg-white">
          <Filter className="w-4 h-4" />
        </Button>

        <Select defaultValue="all-days">
          <SelectTrigger className="w-[140px] bg-white borderColor:#E5E5E5">
            <SelectValue placeholder="All days" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-days">All days</SelectItem>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="all-types">
          <SelectTrigger className="w-[200px] bg-white">
            <SelectValue placeholder="All Transactions Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all-types">All Transactions Type</SelectItem>
            <SelectItem value="stock-in">Stock In</SelectItem>
            <SelectItem value="stock-out">Stock Out</SelectItem>
            <SelectItem value="adjustment">Adjustment</SelectItem>
          </SelectContent>
        </Select>

        <Select defaultValue="both">
          <SelectTrigger className="w-[240px] bg-white">
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
      <Card className="shadow-md bg-white">
        <CardContent className="p-2 px-10">
          {/* Table */}
          <div className="overflow-hidden rounded-lg">
            <Table>
              <TableHeader className="p-2">
                <TableRow
                  className="bg-gray-50"
                  style={{ borderColor: "#E5E5E5" }}
                >
                  <TableHead className="font-medium text-gray-700">
                    Time
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Transactions Type
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Product/Component
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Quantity
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Reference
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Reasons
                  </TableHead>
                  <TableHead className="font-medium text-gray-700">
                    Note
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow
                    key={transaction.id}
                    className="border-b last:border-b-0"
                  >
                    <TableCell className="py-4">
                      <div>
                        <div className="font-medium text-gray-900">
                          {transaction.time}
                        </div>
                        <div className="text-sm text-gray-500">
                          {transaction.date}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        variant="outline"
                        className={
                          transaction.type === "STOCK_IN"
                            ? "bg-blue-50 text-blue-700 border-blue-200 font-normal"
                            : "bg-purple-50 text-purple-700 border-purple-200 font-normal"
                        }
                      >
                        {transaction.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-gray-900 py-4">
                      {transaction.product}
                    </TableCell>
                    <TableCell className="py-4">
                      <span
                        className={`font-semibold ${
                          transaction.quantity > 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {transaction.quantity > 0 ? "+ " : ""}
                        {transaction.quantity}
                      </span>
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">
                      {transaction.reference}
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">
                      {transaction.reasons || "-"}
                    </TableCell>
                    <TableCell className="text-gray-700 py-4">
                      {transaction.note}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between p-6 border-t">
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
    </div>
  );
}
