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
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead>Service Name</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Cost</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {services && services.length > 0 ? (
              services.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.serviceName}</TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {s.notes}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {s.cost.toLocaleString()}₫
                  </TableCell>
                  <TableCell className="w-[50px]">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
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
                  colSpan={4}
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
