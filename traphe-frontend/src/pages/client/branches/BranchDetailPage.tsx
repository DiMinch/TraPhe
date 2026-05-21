import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { MapPin, Phone, Clock, ArrowLeft } from "lucide-react";
import axiosClient from "@/lib/axios-client";
import { Button } from "@/components/ui/button";

interface BranchDetail {
  id: string;
  name: string;
  address: string;
  phone?: string;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<BranchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await axiosClient.get<any, any>(`/admin/branches/${id}`);
        if (res.data) {
          setBranch(res.data);
        }
      } catch {
        setBranch(null);
      } finally {
        setIsLoading(false);
      }
    };
    if (id) fetchBranch();
  }, [id]);

  if (isLoading) {
    return (
      <div className="bg-white min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Đang tải...</div>
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="bg-white min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-gray-500 text-lg">Không tìm thấy chi nhánh</p>
        <Link to="/branches">
          <Button variant="outline">Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <Link
            to="/branches"
            className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Tất cả chi nhánh
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{branch.name}</h1>
        </div>
      </section>

      <section className="max-w-4xl mx-auto py-12 px-6">
        <div className="bg-white border border-gray-100 rounded-xl p-8 shadow-sm space-y-6">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 mt-0.5 text-blue-500 shrink-0" />
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Địa chỉ</p>
              <p className="text-gray-900">{branch.address}</p>
            </div>
          </div>
          {branch.phone && (
            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 mt-0.5 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Điện thoại</p>
                <p className="text-gray-900">{branch.phone}</p>
              </div>
            </div>
          )}
          {branch.openingHours && (
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 mt-0.5 text-blue-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Giờ mở cửa</p>
                <p className="text-gray-900">{branch.openingHours}</p>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
