import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";
import type { WarrantyServiceItem } from "@/types/warranty.types";

interface ServicesTabProps {
  services?: WarrantyServiceItem[];
  onAddClick: () => void;
  onRemoveClick: (id: string) => void;
}

export default function ServicesTab({
  services,
  onAddClick,
  onRemoveClick,
}: ServicesTabProps) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
        <CardTitle className="text-base">Service Charges</CardTitle>
        <Button
          className="cursor-pointer"
          size="sm"
          variant="outline"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Service
        </Button>
      </CardHeader>
      <CardContent className="px-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead>Service Name</TableHead>
              <TableHead className="text-right">Unit Price</TableHead>
              <TableHead className="text-right">Extra</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services && services.length > 0 ? (
              services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div className="font-medium">{s.serviceName}</div>
                    {s.notes && (
                      <div className="text-xs text-gray-500 italic">
                        Note: {s.notes}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-gray-500">
                    {s.unitPrice.toLocaleString()}₫
                  </TableCell>
                  <TableCell className="text-right text-gray-500">
                    {s.additionalCost > 0
                      ? `+${s.additionalCost.toLocaleString()}₫`
                      : "-"}
                  </TableCell>
                  <TableCell className="text-right font-bold text-gray-900">
                    {s.totalCost.toLocaleString()}₫
                  </TableCell>
                  <TableCell className="w-[50px] text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600 cursor-pointer"
                      onClick={() => onRemoveClick(s.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center text-gray-500 py-8"
                >
                  No services added
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
