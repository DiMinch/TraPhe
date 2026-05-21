import { useState, useEffect } from "react";
import { MapPin, Phone, Clock } from "lucide-react";
import { Link } from "react-router";
import axiosClient from "@/lib/axios-client";

interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  openingHours?: string;
  latitude?: number;
  longitude?: number;
  isActive: boolean;
}

export default function BranchesPage() {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await axiosClient.get<any, any>("/branches/nearest", {
          params: { lat: 0, lon: 0, limit: 50 },
        });
        if (res.data) {
          setBranches(Array.isArray(res.data) ? res.data : []);
        }
      } catch {
        // Fallback: try admin endpoint
        try {
          const res2 = await axiosClient.get<any, any>("/admin/branches");
          if (res2.data) {
            setBranches(Array.isArray(res2.data) ? res2.data : res2.data.content || []);
          }
        } catch {
          setBranches([]);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchBranches();
  }, []);

  return (
    <div className="bg-white min-h-screen">
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">Hệ thống chi nhánh</h1>
          <p className="text-lg text-gray-600">Tìm chi nhánh TraPhe gần bạn nhất</p>
        </div>
      </section>

      <section className="max-w-6xl mx-auto py-16 px-6">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : branches.length === 0 ? (
          <div className="text-center py-20">
            <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">Chưa có thông tin chi nhánh</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {branches.map((branch) => (
              <Link
                key={branch.id}
                to={`/branches/${branch.id}`}
                className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:-translate-y-0.5 group"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                  {branch.name}
                </h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                    <span>{branch.address}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 shrink-0 text-gray-400" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  {branch.openingHours && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 shrink-0 text-gray-400" />
                      <span>{branch.openingHours}</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
