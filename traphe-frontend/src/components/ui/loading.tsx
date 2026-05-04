import { Loader2 } from "lucide-react";

interface LoadingProps {
  isLoading: boolean;
}

export default function Loading({ isLoading }: LoadingProps) {
  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white p-4 rounded-lg shadow-lg flex flex-col items-center gap-2">
        <Loader2 className="w-8 h-8 text-black animate-spin" />
        <span className="text-sm font-medium text-gray-700">
          Pleaase wait...
        </span>
      </div>
    </div>
  );
}
