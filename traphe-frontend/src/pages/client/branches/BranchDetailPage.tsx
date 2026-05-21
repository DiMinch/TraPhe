import { useState, useEffect } from "react";
import { useParams, Link } from "react-router";
import { MapPin, Phone, Clock, ArrowLeft, Wifi, Loader2, Coffee } from "lucide-react";
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
  imageUrl?: string;
  description?: string;
  isActive: boolean;
}

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<BranchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        // Use public branches endpoint (NOT admin)
        const res = await axiosClient.get<any, any>(`/branches/${id}`);
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
      <div className="bg-[#FBF5EC] min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#5C3317]" />
      </div>
    );
  }

  if (!branch) {
    return (
      <div className="bg-[#FBF5EC] min-h-screen flex flex-col items-center justify-center gap-4">
        <Coffee className="w-16 h-16 text-[#D4C9BC]" />
        <p className="text-[#4A3F35] text-lg font-serif">Không tìm thấy chi nhánh</p>
        <Link to="/branches">
          <Button
            variant="outline"
            className="border-[#5C3317] text-[#5C3317] hover:bg-[#F5EAD8] rounded-full px-6"
          >
            Quay lại danh sách
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF5EC] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2C1A0E] to-[#5C3317] py-20 px-6 overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#A0622A]/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-[#C89A6E]/10 rounded-full blur-2xl" />

        <div className="max-w-5xl mx-auto relative z-10">
          <Link
            to="/branches"
            className="inline-flex items-center gap-2 text-sm text-[#C89A6E] hover:text-[#F5EAD8] mb-8 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Tất cả chi nhánh
          </Link>
          <h1 className="text-4xl lg:text-5xl font-serif text-[#F5EAD8] mb-4 leading-tight">
            {branch.name}
          </h1>
          {branch.description && (
            <p className="text-[#C89A6E] text-lg max-w-2xl leading-relaxed font-serif">
              {branch.description}
            </p>
          )}
          {!branch.description && (
            <p className="text-[#C89A6E] text-lg max-w-2xl leading-relaxed font-serif italic">
              Không gian ấm cúng mang đậm dấu ấn văn hóa cà phê Việt đương đại
            </p>
          )}
        </div>
      </section>

      {/* Content */}
      <section className="max-w-5xl mx-auto py-16 px-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Info Card */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-serif text-[#2C1A0E] mb-6">Thông Tin Liên Hệ</h2>
            <div className="bg-white rounded-2xl p-8 shadow-[0_2px_12px_rgba(44,26,14,0.08)] space-y-6">
              {/* Address */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5EAD8] flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5 text-[#5C3317]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#8C7B6E] mb-1">Địa chỉ</p>
                  <p className="text-[#1A1410] leading-relaxed">{branch.address}</p>
                </div>
              </div>

              {/* Opening Hours */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5EAD8] flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-[#5C3317]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#8C7B6E] mb-1">Giờ mở cửa</p>
                  <p className="text-[#1A1410] leading-relaxed">
                    {branch.openingHours || "07:00 – 22:00 hàng ngày"}
                  </p>
                </div>
              </div>

              {/* Phone */}
              {branch.phone && (
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#F5EAD8] flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-[#5C3317]" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[#8C7B6E] mb-1">Điện thoại</p>
                    <p className="text-[#1A1410]">{branch.phone}</p>
                  </div>
                </div>
              )}

              {/* Amenities */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F5EAD8] flex items-center justify-center shrink-0">
                  <Wifi className="w-5 h-5 text-[#5C3317]" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#8C7B6E] mb-1">Tiện ích</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {["Wifi miễn phí", "Không gian làm việc", "Bãi đậu xe"].map((a) => (
                      <span
                        key={a}
                        className="text-xs bg-[#F5EAD8] text-[#5C3317] px-3 py-1.5 rounded-full font-medium"
                      >
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map placeholder / Quick actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(44,26,14,0.08)]">
              <h3 className="text-lg font-serif text-[#2C1A0E] mb-4">Vị trí</h3>
              {branch.latitude && branch.longitude ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-[#F0EBE3]">
                  <iframe
                    title="Map"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    src={`https://maps.google.com/maps?q=${branch.latitude},${branch.longitude}&output=embed`}
                  />
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-[#F0EBE3] flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#D4C9BC]" />
                </div>
              )}
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${branch.latitude || ""},${branch.longitude || ""}`}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4"
              >
                <Button className="w-full bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-full transition-colors">
                  <MapPin className="w-4 h-4 mr-2" /> Chỉ đường
                </Button>
              </a>
            </div>

            <div className="bg-gradient-to-br from-[#5C3317] to-[#2C1A0E] rounded-2xl p-6 text-white">
              <Coffee className="w-8 h-8 mb-3 text-[#C89A6E]" />
              <h3 className="text-lg font-serif mb-2">Đặt hàng ngay</h3>
              <p className="text-sm text-[#C89A6E] mb-4 leading-relaxed">
                Xem menu và đặt hàng trước để nhận ngay khi đến quán.
              </p>
              <Link to="/menu">
                <Button className="w-full bg-[#A0622A] hover:bg-[#C89A6E] text-white rounded-full transition-colors">
                  Xem menu
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
