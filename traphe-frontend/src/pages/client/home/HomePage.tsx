import { useState, useEffect } from "react";
import { Link } from "react-router";
import { ArrowRight, MapPin, ArrowUpRight, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import axiosClient from "@/lib/axios-client";
import { productService } from "@/services/product.service";

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

  useEffect(() => {
    const fetchBranch = async () => {
      try {
        const res = await axiosClient.get<any, any>("/branches");
        if (res.data && res.data.length > 0) {
          const central = res.data.find((b: any) =>
            b.name.toLowerCase().includes("central")
          );
          setBranch(central || res.data[0]);
        }
      } catch (error) {
        console.error("Failed to fetch branch details", error);
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

    fetchBranch();
    fetchNewArrivals();
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
              Experience the rich, tactile atmosphere of traditional coffee craft.
              Slow-dripped perfection, honoring a heritage of bold flavors and sweet
              resonance.
            </p>
            <div className="pt-4 flex flex-wrap gap-4">
              <Link to="/menu">
                <Button className="bg-[#5C3317] hover:bg-[#2C1A0E] text-white rounded-full px-8 py-6 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-300">
                  Explore the Menu <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/about">
                <Button
                  variant="outline"
                  className="border-[#5C3317] text-[#5C3317] hover:bg-[#F5EAD8] rounded-full px-8 py-6 text-base font-medium transition-all duration-300"
                >
                  Our Story
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
              Discover our latest creations, freshly brewed with passion and quality ingredients.
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
                        Order Now <ArrowUpRight className="w-4 h-4" />
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
                All Products
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
              Không gian trải nghiệm
            </span>
            <h2 className="font-serif text-3xl lg:text-4xl text-[#2C1A0E] leading-tight">
              Find Your Sanctuary
            </h2>
            <p className="font-serif text-[#4A3F35] leading-relaxed">
              Step away from the rush. Our flagship Central Square branch offers a
              peaceful enclave to savor the craft of true Vietnamese coffee.
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
                  Get Directions
                </Button>
              </Link>
            </div>
          </div>

          {/* Map Image/Embed */}
          <div className="w-full lg:w-7/12 h-[350px] lg:h-auto min-h-[400px] relative overflow-hidden group">
            <div className="absolute inset-0 bg-[#2C1A0E]/5 group-hover:bg-transparent transition-colors duration-500 z-10" />
            <img
              alt="Map of Central Branch"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-102 transition-transform duration-1000"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXkDknGUmEp7Cwm-Tl0EZ7xKDij-J4q30EhMg4O7eULFjp4nfHVjpQQPHTwwznl9EBwvU7ib-Thd0aQ6u4-0PbQrtHPSHhHNicaxTpYR-xXL-BRsc4UGJM-GlLc2UNrQtIJ3c9ThT4e9CaNsY2D44AUbxLqEfzvGElhmJ7ZXXq1KlgKPU1vKpHgnfuYEGb_VM0FT_SwXciWRMuRC8ezT0gCs562uSMZL9oAlmfb351oSdni3poRfVo9cL_A4cPYcQimkoHlkL6Oz0"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
