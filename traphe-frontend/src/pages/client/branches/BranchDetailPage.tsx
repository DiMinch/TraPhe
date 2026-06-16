import { useState, useEffect, useRef } from "react";
import { useParams, Link } from "react-router";
import { MapPin, Phone, Clock, ArrowLeft, Wifi, Coffee } from "lucide-react";
import axiosClient from "@/lib/axios-client";
import { Button } from "@/components/ui/button";
import { ClientSkeleton } from "@/components/ui/skeleton-loaders";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

// Set Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface BranchHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface BranchDetail {
  id: string;
  name: string;
  address: string;
  phone?: string;
  lat?: number;
  lng?: number;
  isActive: boolean;
  hours?: BranchHour[];
}

const DAY_NAMES = ["", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7", "Chủ nhật"];

function formatTime(t: string) {
  return t?.slice(0, 5) || "";
}

export default function BranchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [branch, setBranch] = useState<BranchDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const fetchBranch = async () => {
      try {
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

  // Initialize Mapbox once branch with coordinates is loaded
  useEffect(() => {
    if (!branch || !branch.lat || !branch.lng || !mapContainerRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [branch.lng, branch.lat],
      zoom: 15,
    });

    mapRef.current = map;

    // Custom marker
    const el = document.createElement("div");
    el.className = "flex flex-col items-center";
    el.innerHTML = `
      <div class="bg-white px-3 py-1.5 rounded-lg shadow-md border border-[#5C3317] mb-1 whitespace-nowrap z-20">
        <span class="font-bold text-xs text-[#2C1A0E]">${branch.name}</span>
      </div>
      <div class="w-10 h-10 bg-[#A0622A] rounded-full flex items-center justify-center shadow-lg border-2 border-white relative z-10">
        <svg class="w-5 h-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
          <line x1="6" y1="2" x2="6" y2="4" /><line x1="10" y1="2" x2="10" y2="4" /><line x1="14" y1="2" x2="14" y2="4" />
        </svg>
      </div>
      <div class="w-4 h-4 bg-[#A0622A]/30 rounded-full absolute bottom-[-4px] animate-ping"></div>
    `;

    new mapboxgl.Marker({ element: el })
      .setLngLat([branch.lng, branch.lat])
      .addTo(map);

    return () => {
      map.remove();
    };
  }, [branch]);

  if (isLoading) {
    return (
      <div className="bg-[#FAF6F0] min-h-screen pb-16">
        {/* Hero Section skeleton */}
        <section className="bg-gradient-to-br from-[#2C1A0E] to-[#5C3317] py-20 px-6">
          <div className="max-w-5xl mx-auto space-y-4">
            <ClientSkeleton className="h-4 w-32 rounded-full opacity-60" />
            <ClientSkeleton className="h-12 w-1/2 rounded-full" />
            <ClientSkeleton className="h-4 w-1/3 rounded-full opacity-60" />
          </div>
        </section>

        {/* Content skeleton */}
        <section className="max-w-5xl mx-auto py-16 px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <ClientSkeleton className="h-8 w-48 rounded-full" />
              <div className="bg-white rounded-2xl p-8 border border-[#F5EAD8]/40 space-y-6">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-4">
                    <ClientSkeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <ClientSkeleton className="h-4 w-24 rounded-full" />
                      <ClientSkeleton className="h-5 w-3/4 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#F5EAD8]/40 space-y-4">
                <ClientSkeleton className="h-6 w-24 rounded-full" />
                <ClientSkeleton className="w-full aspect-video rounded-xl" />
                <ClientSkeleton className="h-10 w-full rounded-full" />
              </div>
            </div>
          </div>
        </section>
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

  const hasCoords = !!branch.lat && !!branch.lng;
  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`;

  return (
    <div className="bg-[#FBF5EC] min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-[#2C1A0E] to-[#5C3317] py-20 px-6 overflow-hidden">
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
          <p className="text-[#C89A6E] text-lg max-w-2xl leading-relaxed font-serif italic">
            Không gian ấm cúng mang đậm dấu ấn văn hóa cà phê Việt đương đại
          </p>
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
                  {branch.hours && branch.hours.length > 0 ? (
                    <div className="space-y-1">
                      {branch.hours
                        .sort((a, b) => a.dayOfWeek - b.dayOfWeek)
                        .map((h) => (
                          <div key={h.id} className="flex items-center gap-3 text-sm">
                            <span className="w-20 font-medium text-[#4A3F35]">
                              {DAY_NAMES[h.dayOfWeek] || `Ngày ${h.dayOfWeek}`}
                            </span>
                            {h.isClosed ? (
                              <span className="text-red-400 italic">Đóng cửa</span>
                            ) : (
                              <span className="text-[#1A1410]">
                                {formatTime(h.openTime)} – {formatTime(h.closeTime)}
                              </span>
                            )}
                          </div>
                        ))}
                    </div>
                  ) : (
                    <p className="text-[#1A1410]">07:00 – 22:00 hàng ngày</p>
                  )}
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

          {/* Map & Quick actions */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-[0_2px_12px_rgba(44,26,14,0.08)]">
              <h3 className="text-lg font-serif text-[#2C1A0E] mb-4">Vị trí</h3>
              {hasCoords ? (
                <div className="aspect-video rounded-xl overflow-hidden bg-[#F0EBE3] relative">
                  <div ref={mapContainerRef} className="w-full h-full" />
                </div>
              ) : (
                <div className="aspect-video rounded-xl bg-[#F0EBE3] flex items-center justify-center">
                  <MapPin className="w-8 h-8 text-[#D4C9BC]" />
                </div>
              )}
              <a
                href={directionsUrl}
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
