import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import type { WarrantyHistory } from "@/types/warranty.types";

interface HistoryTabProps {
  history?: WarrantyHistory[];
}

export default function HistoryTab({ history }: HistoryTabProps) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-6 border-l-2 border-gray-200 ml-3 pl-6 relative">
          {history?.map((log) => (
            <div key={log.id} className="relative">
              <div className="absolute -left-[31px] top-1 w-3 h-3 bg-black rounded-full border-2 border-white ring-2 ring-gray-100"></div>
              <p className="text-sm font-semibold text-gray-900">
                {log.action}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(log.timestamp), "PPP p")} by {log.performedBy}
              </p>
              {log.details && (
                <p className="text-sm text-gray-600 mt-1 bg-gray-50 p-2 rounded border border-gray-100">
                  {log.details}
                </p>
              )}
            </div>
          ))}
          {(!history || history.length === 0) && (
            <p className="text-sm text-gray-500 italic">
              No history available.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
