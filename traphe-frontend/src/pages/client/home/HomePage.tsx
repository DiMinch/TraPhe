import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { ArrowRight, MapPin, ArrowUpRight, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosClient from "@/lib/axios-client";
import { productService } from "@/services/product.service";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
}

export default function HomePage() {
  const [branch, setBranch] = useState<Branch | null>(null);
  const [newArrivals, setNewArrivals] = useState<any[]>([]);
  const [gpsStatus, setGpsStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const getNearestBranch = (userLat: number, userLng: number, branchList: Branch[]) => {
    let nearest: Branch | null = null;
    let minDistance = Infinity;

    branchList.forEach((b) => {
      const lat = (b as any).lat ?? b.latitude;
      const lng = (b as any).lng ?? b.longitude;
      if (lat !== undefined && lng !== undefined) {
        const dist = Math.sqrt(Math.pow(lat - userLat, 2) + Math.pow(lng - userLng, 2));
        if (dist < minDistance) {
          minDistance = dist;
          nearest = b;
        }
      }
    });
    return nearest;
  };

  useEffect(() => {
    const fetchBranchAndLocate = async () => {
      let fetchedBranches: Branch[] = [];
      try {
        const res = await axiosClient.get<any, any>("/branches");
        fetchedBranches = Array.isArray(res.data) ? res.data : res.data?.content || [];
        
        // Find default branch (Central Square)
        const central = fetchedBranches.find((b: any) =>
          b.name.toLowerCase().includes("central")
        );
        setBranch(central || fetchedBranches[0] || null);
      } catch (error) {
        console.error("Failed to fetch branch details", error);
      }

      // Now request GPS
      if (navigator.geolocation) {
        setGpsStatus("loading");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setGpsStatus("success");
            
            if (fetchedBranches.length > 0) {
              const nearest = getNearestBranch(lat, lng, fetchedBranches);
              if (nearest) {
                setBranch(nearest);
              }
            }
          },
          (error) => {
            console.warn("GPS access denied or failed:", error);
            setGpsStatus("error");
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setGpsStatus("error");
      }
    };

    const fetchNewArrivals = async () => {
      try {
        const res = await productService.getAllProducts({
          page: 0,
          size: 3,
          sortBy: "createdAt",
          sortDir: "desc",
          status: "ACTIVE",
        });
        if (res.success && res.data) {
          const items = Array.isArray(res.data) ? res.data : (res.data as any).content || [];
          setNewArrivals(items);
        }
      } catch (error) {
        console.error("Failed to fetch new arrivals", error);
      }
    };

    fetchBranchAndLocate();
    fetchNewArrivals();
  }, []);

  // Sync Mapbox instance
  useEffect(() => {
    if (!branch || !mapContainerRef.current) return;
    const lat = (branch as any).lat ?? branch.latitude;
    const lng = (branch as any).lng ?? branch.longitude;
    if (lat === undefined || lng === undefined) return;

    if (!mapboxgl.accessToken) {
      mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
    }

    try {
      if (!mapRef.current) {
        const map = new mapboxgl.Map({
          container: mapContainerRef.current,
          style: "mapbox://styles/mapbox/light-v11",
          center: [lng, lat],
          zoom: 15,
          interactive: false,
        });
        mapRef.current = map;
      } else {
        mapRef.current.setCenter([lng, lat]);
      }

      // Re-create marker every time branch changes to keep the text updated
      if (markerRef.current) {
        markerRef.current.remove();
      }

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
      `;
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(mapRef.current);
      markerRef.current = marker;
    } catch (err) {
      console.error("Error loading Mapbox in homepage:", err);
    }
  }, [branch]);

  // Cleanup map on unmount
  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      if (markerRef.current) {
        markerRef.current = null;
      }
    };
  }, []);

  const fallbackProducts = [
    {
      id: "caphesuada",
      name: "Cà Phê Sữa Đá",
      description:
        "Our signature Robusta blend, slow-dripped and served over ice with sweetened condensed milk.",
      price: 55000,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBjEmTWn9CFGFLoIok0LcRXnyVKHxfi0eHbPyGwOgM806KqEj-CjMph6WxgiqazcsXjI3YxbAvG-adaAm_cB3eHS0L9oly5dmjtWq8bSG25qQ9SZRI6vFmyYSkDAN7kbUuemQNXJUacinPNAJuyvxOyFXShhBiJzWSuWas0hhIzRI9TFRKFdMFN1GnNRThutVBUySJXkR--Ah-Zh2IRjd18d8AM025ucGm5OCVnHVIrluQMra7k-q36V93cofMTnjMT0xN0YMhvOm4",
    },
    {
      id: "lotussilktea",
      name: "Lotus Silk Tea",
      description:
        "A delicate infusion of premium green tea steeped with fresh lotus blossoms for a floral, calming finish.",
      price: 40000,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuC8l98retiWDyXBxiIONW2NvGq_SWc4t5UvDdXCAim9MM0VqG6mvEOMiJxJqW_UXR0DBLPli2fn85UIkvPoWALZFsMt1R97YyGHGnXzc6JY4lVsObve8Dpa40v49amDYMYdo-krk1mjudZpKfxiEtlsB-Qpbj6kI8YTiCW9lmlZD8toit87hW5Y_51Oflrn1lSK3MEw1aRw2cGRgF48tozfwH2wXdmQM19T9DFnyUt7JUSbHtr_6BmRGZUg0xtPRjnpkvLqFpJ7DGU",
    },
    {
      id: "hanoieggcoffee",
      name: "Hanoi Egg Coffee",
      description:
        "A rich, dessert-like experience. Robust espresso topped with a whipped, airy meringue of egg yolk and sweet milk.",
      price: 60000,
      imageUrl:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCtcOMXLdQgCqxw_yfJ1HhjeFuAimWcMBB6HTmEWuhBsiB2G8L_3w7rS403VFk19eAnlwp6c2UwDthNuYWL9KEbSqEhwxqRJTo2Bd_WrX_l0zf8EZlVF3rky-9846AnWawiJMVhaJILQaGUav2dkcAgJDLfZvjdBKjiYxmxg4RcI5Ci3o7dlxPysC-tHq61gK6jryrW0J5ipxomV5oqmKoTAFEA5nwKhUe1XFu9NYFO6yFamnGq3FeYw6cw7Z_QylWQDis3LRL3L6o",
    },
  ];

  const displayProducts = newArrivals.length > 0 ? newArrivals : fallbackProducts;

  return (
    <div className="bg-[#fff8f5] text-[#1A1410] antialiased">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div className="flex flex-col items-start space-y-6 lg:pr-8">
            <h1 className="font-serif text-5xl lg:text-7xl font-light text-[#2C1A0E] leading-tight">
              The Art of <br />
              <span className="font-normal italic text-[#5C3317]">Vietnamese Coffee</span>
            </h1>
            <p className="font-serif text-[#4A3F35] text-lg leading-relaxed max-w-lg">
              Hãy để cảm xúc thăng hoa với những ly trà và cà phê.
              Từng giọt trà và cà phê được chắt chiu từ tâm huyết của người pha chế.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/menu">
                <Button className="bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-full px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  Khám phá Menu <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  className="border-[#5C3317] text-[#5C3317] hover:bg-[#F5EAD8] rounded-full px-8 py-6 text-base font-medium transition-all duration-300"
                >
                  Câu chuyện của chúng tôi
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative aspect-[4/5] w-full rounded-2xl lg:rounded-t-[80px] lg:rounded-br-[80px] overflow-hidden shadow-2xl border border-[#D4C9BC]/30 group">
            <div className="absolute inset-0 bg-[#2C1A0E]/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <img
              alt="Traditional Vietnamese Coffee brewing"
              className="absolute inset-0 w-full h-full object-cover scale-100 group-hover:scale-105 transition-transform duration-[1.5s]"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuABVsP2mV5EGAMjESQSCaQKBH2ZcLmfb1q7e2AEe08WRohDqCfQWnvUTe7NZxCRdXKE2x2veTScOh7BnNm4C9oLtyCZfYDYK4hrmbkNFE4OMMRuxGfEO3OEs7kNep6zWMuL4JxWX_Y2S_MwZoK5MNpxqpRSQS3i-DM7rq9ppG4p-1JH3QDuWKNWW7E-ghKIJ4_ZRkX8HXUIAH0HH9wFzGf8jWKb_tIRIKQKrDuFpe5FCa9FFdNc6ONBnrW_Yl0vu8lkmbhYgKmggY4"
            />
          </div>
        </div>
      </section>

      {/* Featured Drinks Bento Grid (New Arrivals) */}
      <section className="bg-[#F5EAD8] py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <span className="text-xs font-bold text-[#A0622A] uppercase tracking-widest block">
              Trải nghiệm độc bản
            </span>
            <h2 className="font-serif text-4xl lg:text-5xl text-[#2C1A0E]">
              New Arrivals
            </h2>
            <p className="font-serif text-[#4A3F35] text-base leading-relaxed">
              Khám phá những hương vị mới nhất, được pha chế bằng cả trái tim và nguyên liệu chất lượng.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {displayProducts.map((prod, idx) => {
              const displayPrice =
                prod.effectivePrice ||
                prod.basePrice ||
                prod.sizes?.[0]?.sellingPrice ||
                prod.price ||
                0;
              const productUrl = prod.id && isNaN(Number(prod.id)) && prod.id.length > 20
                ? `/menu/${prod.id}`
                : `/menu`;

              return (
                <div
                  key={idx}
                  className="bg-[#EFE5D3] rounded-2xl overflow-hidden shadow-lg group hover:-translate-y-2 transition-all duration-300 flex flex-col border border-[#D4C9BC]/50"
                >
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors z-10" />
                    {prod.imageUrl ? (
                      <img
                        alt={prod.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        src={prod.imageUrl}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#EFE5D3] flex items-center justify-center">
                        <Coffee className="w-12 h-12 text-[#5C3317]" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-grow">
                    <h3 className="font-serif text-2xl text-[#2C1A0E] mb-3 group-hover:text-[#5C3317] transition-colors">
                      {prod.name}
                    </h3>
                    <p className="font-serif text-[#4A3F35] text-sm leading-relaxed mb-6 flex-grow line-clamp-3">
                      {prod.description}
                    </p>
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#D4C9BC]/40">
                      <span className="text-[#A0622A] font-bold text-lg">
                        {displayPrice.toLocaleString("vi-VN")} ₫
                      </span>
                      <Link
                        to={productUrl}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5C3317] hover:text-[#2C1A0E]"
                      >
                        Đặt ngay<ArrowUpRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center">
            <Link to="/menu">
              <Button className="border-2 border-[#5C3317] text-white bg-[#5C3317] hover:bg-[#2C1A0E] font-medium rounded-full px-8 py-5 transition-all duration-300">
                Tất cả
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Branch Locator Map Preview (Find Your Sanctuary) */}
      <section className="max-w-7xl mx-auto px-6 py-20 lg:py-28">
        <div className="bg-white rounded-3xl overflow-hidden shadow-2xl border border-[#D4C9BC]/30 flex flex-col lg:flex-row">
          {/* Details */}
          <div className="p-8 md:p-16 lg:w-5/12 flex flex-col justify-center bg-white space-y-6">
            <span className="text-xs font-bold text-[#A0622A] uppercase tracking-widest block">
              {gpsStatus === "loading" && "Đang tìm cửa hàng gần bạn..."}
              {gpsStatus === "success" && "Cửa hàng gần bạn nhất"}
              {gpsStatus === "error" && "Không gian trải nghiệm"}
              {gpsStatus === "idle" && "Không gian trải nghiệm"}
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl text-[#2C1A0E] leading-tight">
              {gpsStatus === "success" ? "Cửa Hàng Gần Bạn" : "Find Your Sanctuary"}
            </h2>
            <p className="font-serif text-[#4A3F35] leading-relaxed">
              {gpsStatus === "success"
                ? "Dựa trên vị trí hiện tại của bạn, đây là chi nhánh thuận tiện nhất để bạn ghé qua thưởng thức trà và cà phê ngon."
                : "Tạm lánh xa cuộc sống hối hả. Hãy ghé chi nhánh của chúng tôi mang đến một không gian yên tĩnh để thưởng thức hương vị trà và cà phê Việt Nam đích thực."}
            </p>

            <div className="flex items-start gap-3.5 p-4 rounded-xl bg-[#FBF5EC] border border-[#F5EAD8]">
              <MapPin className="w-6 h-6 text-[#5C3317] shrink-0 mt-0.5" />
              <div>
                <p className="font-serif font-bold text-[#2C1A0E] text-base">
                  {branch ? branch.name : "Central Square"}
                </p>
                <p className="font-serif text-[#4A3F35] text-sm mt-1">
                  {branch ? branch.address : "128 Heritage Ave, Suite A"}
                </p>
              </div>
            </div>

            <div>
              <Link to={branch ? `/branches/${branch.id}` : "/branches"}>
                <Button className="border-2 border-[#5C3317] text-[#5C3317] bg-transparent hover:bg-[#F5EAD8] font-medium rounded-full px-8 py-5 transition-all duration-300">
                  Tìm đường
                </Button>
              </Link>
            </div>
          </div>

          {/* Map Image/Embed */}
          <Link
            to={branch ? `/branches/${branch.id}` : "/branches"}
            className="w-full lg:w-7/12 h-[350px] lg:h-auto min-h-[400px] relative overflow-hidden block group"
          >
            <div className="absolute inset-0 bg-[#2C1A0E]/5 group-hover:bg-transparent transition-colors duration-500 z-20 pointer-events-none" />
            <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-10 transition-transform duration-1000 group-hover:scale-[1.02]" />
          </Link>
        </div>
      </section>
    </div>
  );
}
