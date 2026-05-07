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
import type { WarrantyPartItem } from "@/types/warranty.types";

interface PartsTabProps {
  parts?: WarrantyPartItem[];
  onAddClick: () => void;
  onRemoveClick: (id: string) => void;
}

export default function PartsTab({
  parts,
  onAddClick,
  onRemoveClick,
}: PartsTabProps) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-gray-100">
        <CardTitle className="text-base">Parts Replacement</CardTitle>
        <Button
          className="cursor-pointer"
          size="sm"
          variant="outline"
          onClick={onAddClick}
        >
          <Plus className="w-4 h-4 mr-2" /> Add Part
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50 hover:bg-gray-50">
              <TableHead>Part Name</TableHead>
              <TableHead>Qty</TableHead>
              <TableHead className="text-right">Unit Cost</TableHead>
              <TableHead className="text-right">Subtotal</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {parts && parts.length > 0 ? (
              parts.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.partName}</TableCell>
                  <TableCell>{p.quantity}</TableCell>
                  <TableCell className="text-right text-gray-500">
                    {p.cost.toLocaleString()}₫
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {(p.cost * p.quantity).toLocaleString()}₫
                  </TableCell>
                  <TableCell className="w-[50px]">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-400 hover:text-red-600"
                      onClick={() => onRemoveClick(p.id)}
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
                  No parts added
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
