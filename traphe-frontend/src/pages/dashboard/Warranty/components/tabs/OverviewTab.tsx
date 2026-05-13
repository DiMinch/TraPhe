import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { WarrantyTicketDetail } from "@/types/warranty.types";

interface OverviewTabProps {
  ticket: WarrantyTicketDetail;
}

export default function OverviewTab({ ticket }: OverviewTabProps) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-6 space-y-6">
        <div>
          <h3 className="font-semibold mb-2 text-sm text-gray-900">
            Problem Description
          </h3>
          <p className="text-gray-700 bg-gray-50 rounded-md text-sm border border-gray-100 leading-relaxed">
            {ticket.problemDescription}
          </p>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h3 className="font-semibold mb-1 text-sm text-gray-900">
              Accessories
            </h3>
            <p className="text-sm text-gray-600">
              {ticket.accessories || "None"}
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-1 text-sm text-gray-900">
              Expected Return
            </h3>
            <p className="text-sm text-gray-600">
              {ticket.expectedReturnDate
                ? format(new Date(ticket.expectedReturnDate), "PPP")
                : "N/A"}
            </p>
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2 text-sm text-gray-900">
            Technician Notes
          </h3>
          <p className="text-sm text-gray-600 italic">
            {ticket.notes || "No notes available."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
