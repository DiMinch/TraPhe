import { useState, useEffect, useRef, useCallback } from "react";
import { MapPin, Clock, Search, Navigation, ZoomIn, ZoomOut, Coffee } from "lucide-react";
import { Link } from "react-router";
import axiosClient from "@/lib/axios-client";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toast } from "sonner";

// Set Mapbox token
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface BranchHour {
  id: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  lat?: number;
  lng?: number;
  isActive: boolean;
  active?: boolean;
  hours?: BranchHour[];
}

/** Format today's opening hours from a branch's hours array */
function getTodayHours(hours?: BranchHour[]): string {
  if (!hours || hours.length === 0) return "07:00 - 22:00";
  const today = new Date().getDay(); // 0=Sun
  // Backend dayOfWeek: 1=Mon..7=Sun — map JS getDay(0=Sun) => 7, else same
  const backendDay = today === 0 ? 7 : today;
  const todayHour = hours.find((h) => h.dayOfWeek === backendDay);
  if (!todayHour) return "07:00 - 22:00";
  if (todayHour.isClosed) return "Đóng cửa hôm nay";
  const open = todayHour.openTime?.slice(0, 5) || "07:00";
  const close = todayHour.closeTime?.slice(0, 5) || "22:00";
  return `${open} - ${close}`;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeBranchId, setActiveBranchId] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");

  // Mapbox refs
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // ─── Fetch branches ────────────────────────────────────────────────
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axiosClient.get<any, any>("/branches");
        // ApiResponse wrapper: res.data holds the array (or PageResponse .content)
        const items: Branch[] = Array.isArray(res.data) ? res.data : res.data?.content || [];
        setBranches(items);
        if (items.length > 0) {
          setActiveBranchId(items[0].id);
        }
      } catch {
        setBranches([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, []);

  // ─── Filter ────────────────────────────────────────────────────────
  const filteredBranches = branches.filter((b) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q) || b.address.toLowerCase().includes(q);
  });

  // ─── Initialize Mapbox ─────────────────────────────────────────────
  useEffect(() => {
    if (!mapContainerRef.current) return;

    const defaultCenter: [number, number] = [106.7009, 10.7769]; // HCM fallback
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: defaultCenter,
      zoom: 13,
    });

    mapRef.current = map;

    return () => {
      map.remove();
    };
  }, []);

  // ─── Sync markers with filtered data ───────────────────────────────
  const syncMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const branchesWithCoords = filteredBranches.filter((b) => b.lat && b.lng);
    if (branchesWithCoords.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();

    branchesWithCoords.forEach((branch) => {
      const lng = branch.lng!;
      const lat = branch.lat!;
      bounds.extend([lng, lat]);

      const isActive = activeBranchId === branch.id;

      const el = document.createElement("div");
      el.className = "cursor-pointer group flex flex-col items-center";

      if (isActive) {
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
      } else {
        el.innerHTML = `
          <div class="bg-white px-2 py-1 rounded-md shadow-sm border border-[#D4C9BC] mb-1 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none text-[10px]">
            <span class="font-medium text-[#8C7B6E]">${branch.name}</span>
          </div>
          <div class="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md border-2 border-[#C89A6E] hover:scale-110 transition-transform">
            <svg class="w-4 h-4 text-[#C89A6E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
            </svg>
          </div>
        `;
      }

      el.addEventListener("click", () => {
        setActiveBranchId(branch.id);
        map.easeTo({ center: [lng, lat], zoom: 15 });
      });

      const marker = new mapboxgl.Marker({ element: el }).setLngLat([lng, lat]).addTo(map);
      markersRef.current.push(marker);
    });

    // Fit to bounds
    if (branchesWithCoords.length === 1) {
      const b = branchesWithCoords[0];
      map.easeTo({ center: [b.lng!, b.lat!], zoom: 14 });
    } else {
      map.fitBounds(bounds, { padding: 80, maxZoom: 15 });
    }
  }, [filteredBranches, activeBranchId]);

  useEffect(() => {
    syncMarkers();
  }, [syncMarkers]);

  // ─── Handlers ──────────────────────────────────────────────────────
  const handleLocateMe = () => {
    if (!navigator.geolocation) {
      toast.error("Trình duyệt không hỗ trợ định vị");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { longitude, latitude } = pos.coords;
        mapRef.current?.easeTo({ center: [longitude, latitude], zoom: 15 });
      },
      () => toast.error("Không thể xác định vị trí của bạn"),
    );
  };

  const handleSelectBranch = (branch: Branch) => {
    setActiveBranchId(branch.id);
    if (mapRef.current && branch.lng && branch.lat) {
      mapRef.current.easeTo({ center: [branch.lng, branch.lat], zoom: 15 });
    }
  };

  // ─── Render ────────────────────────────────────────────────────────
  return (
    <div className="bg-[#FBF5EC] text-[#1A1410] antialiased min-h-screen flex flex-col">
      <main className="flex-grow flex flex-col md:flex-row h-[calc(100vh-80px)] overflow-hidden max-w-[1440px] w-full mx-auto">
        {/* ─── Sidebar ─────────────────────────────────────────── */}
        <aside className="w-full md:w-[400px] flex flex-col h-full bg-[#EFE5D3] border-r border-[#D4C9BC] z-10 shadow-[4px_0_15px_rgba(44,26,14,0.05)]">
          {/* Header & Search */}
          <div className="p-6 border-b border-[#D4C9BC] bg-[#EFE5D3]/95 backdrop-blur-sm shrink-0">
            <h1 className="font-serif text-3xl font-semibold text-[#2C1A0E] mb-6">Tìm Cửa Hàng</h1>

            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-[#8C7B6E]" />
              </div>
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border-[1.5px] border-[#D4C9BC] rounded-full focus:outline-none focus:border-[#5C3317] focus:ring-1 focus:ring-[#5C3317] text-sm text-[#1A1410] placeholder-[#8C7B6E] shadow-sm transition-all"
                placeholder="Tìm theo tên hoặc địa chỉ..."
                type="text"
              />
            </div>
          </div>

          {/* Branch list */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 branch-list">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-44 bg-white/55 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredBranches.length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
                <Coffee className="w-12 h-12 text-[#D4C9BC]" />
                <p className="text-[#8C7B6E] text-sm">Không tìm thấy chi nhánh phù hợp</p>
              </div>
            ) : (
              filteredBranches.map((branch) => {
                const isActive = activeBranchId === branch.id;
                const hasCoords = !!branch.lat && !!branch.lng;
                const todayHours = getTodayHours(branch.hours);

                return (
                  <div
                    key={branch.id}
                    onClick={() => handleSelectBranch(branch)}
                    className={`rounded-[12px] p-5 relative cursor-pointer transform transition-all duration-300 hover:-translate-y-1 ${
                      isActive
                        ? "bg-white shadow-[0_4px_12px_rgba(92,51,23,0.12)] border-[1.5px] border-[#5C3317]"
                        : "bg-[#FBF5EC] border border-[#D4C9BC] hover:bg-white hover:shadow-[0_4px_12px_rgba(92,51,23,0.08)]"
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-4 right-4 text-[#A0622A]">
                        <MapPin className="w-5 h-5 fill-current" />
                      </div>
                    )}
                    <h3 className="font-serif text-lg font-semibold text-[#2C1A0E] mb-1 pr-8 flex items-center flex-wrap gap-2">
                      <span>{branch.name}</span>
                      {(branch.active === false || branch.isActive === false) && (
                        <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded font-sans font-bold">
                          Tạm đóng
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-[#8C7B6E] mb-3">{branch.address}</p>
                    <div
                      className={`flex items-center gap-2 text-[11px] w-fit px-2.5 py-1 rounded-full mb-4 ${
                        isActive ? "text-[#00454a] bg-[#99d0d6]/30" : "text-[#8C7B6E] bg-[#D4C9BC]/20"
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{todayHours}</span>
                    </div>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                      {isActive ? (
                        <a
                          href={
                            hasCoords
                              ? `https://www.google.com/maps/dir/?api=1&destination=${branch.lat},${branch.lng}`
                              : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(branch.address)}`
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-[#5C3317] text-white rounded-full py-2 text-xs font-medium hover:bg-[#2C1A0E] transition-colors text-center block"
                        >
                          Chỉ Đường
                        </a>
                      ) : (
                        <Link
                          to={`/branches/${branch.id}`}
                          className="flex-1 bg-transparent border-[1.5px] border-[#5C3317] text-[#5C3317] rounded-full py-2 text-xs font-medium hover:bg-[#F5EAD8] transition-colors text-center block"
                        >
                          Chi Tiết
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* ─── Map ─────────────────────────────────────────────── */}
        <section className="flex-1 relative bg-[#F0EBE3] overflow-hidden">
          <div ref={mapContainerRef} className="absolute inset-0 w-full h-full" />

          {/* Floating controls */}
          <div className="absolute bottom-8 right-8 flex flex-col gap-3 z-10">
            <button
              onClick={handleLocateMe}
              className="w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(92,51,23,0.15)] flex items-center justify-center text-[#2C1A0E] hover:bg-[#F5EAD8] transition-colors border border-[#D4C9BC]"
              title="Vị trí của tôi"
            >
              <Navigation className="w-5 h-5" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomIn()}
              className="w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(92,51,23,0.15)] flex items-center justify-center text-[#2C1A0E] hover:bg-[#F5EAD8] transition-colors border border-[#D4C9BC]"
              title="Phóng to"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={() => mapRef.current?.zoomOut()}
              className="w-12 h-12 bg-white rounded-full shadow-[0_4px_12px_rgba(92,51,23,0.15)] flex items-center justify-center text-[#2C1A0E] hover:bg-[#F5EAD8] transition-colors border border-[#D4C9BC]"
              title="Thu nhỏ"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
