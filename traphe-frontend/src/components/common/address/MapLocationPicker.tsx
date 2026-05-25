import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Search } from "lucide-react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface MapLocationPickerProps {
  lat: string;
  lng: string;
  onChange: (lat: string, lng: string) => void;
  address?: string;
}

export default function MapLocationPicker({ lat, lng, onChange, address }: MapLocationPickerProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  useEffect(() => {
    if (!mapContainer.current) return;

    // Default to HCMC if no lat/lng
    const initialLng = lng && !isNaN(Number(lng)) ? Number(lng) : 106.7009;
    const initialLat = lat && !isNaN(Number(lat)) ? Number(lat) : 10.7769;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [initialLng, initialLat],
      zoom: 14,
    });
    mapRef.current = map;

    // Add navigation controls (zoom in/out)
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    const marker = new mapboxgl.Marker({
      draggable: true,
      color: "#5C3317"
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    markerRef.current = marker;

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      onChange(lngLat.lat.toFixed(6), lngLat.lng.toFixed(6));
    });

    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      onChange(e.lngLat.lat.toFixed(6), e.lngLat.lng.toFixed(6));
    });

    return () => {
      map.remove();
    };
  }, []); // Initialize once

  // If external lat/lng changes drastically and not from dragging (e.g. form reset), we might want to update it.
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      const currentLng = lng && !isNaN(Number(lng)) ? Number(lng) : 106.7009;
      const currentLat = lat && !isNaN(Number(lat)) ? Number(lat) : 10.7769;
      const markerLngLat = markerRef.current.getLngLat();
      
      // Only flyTo and move marker if the new coords are significantly different from current marker coords
      if (Math.abs(markerLngLat.lng - currentLng) > 0.0001 || Math.abs(markerLngLat.lat - currentLat) > 0.0001) {
        markerRef.current.setLngLat([currentLng, currentLat]);
        mapRef.current.easeTo({ center: [currentLng, currentLat] });
      }
    }
  }, [lat, lng]);
  // Trigger geocoding when address prop changes
  useEffect(() => {
    if (address && address.trim()) {
      setSearchQuery(address);
      
      const delayDebounceFn = setTimeout(() => {
        const parts = address.split(",").map(p => p.trim()).filter(Boolean);
        // Only auto search if we have a reasonably complete address (street, commune, province)
        if (parts.length >= 3 && parts[0] && parts[1] && parts[2]) {
          autoSearch(address);
        }
      }, 1000);

      return () => clearTimeout(delayDebounceFn);
    }
  }, [address]);

  const autoSearch = async (query: string) => {
    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${mapboxgl.accessToken}&country=VN&autocomplete=true`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        const firstFeature = data.features[0];
        const [featureLng, featureLat] = firstFeature.center;
        if (mapRef.current && markerRef.current) {
          mapRef.current.flyTo({ center: [featureLng, featureLat], zoom: 15 });
          markerRef.current.setLngLat([featureLng, featureLat]);
          onChange(featureLat.toFixed(6), featureLng.toFixed(6));
        }
      }
    } catch (err) {
      console.error("Auto geocoding error", err);
    }
  };
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    try {
      const res = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${mapboxgl.accessToken}&country=VN&autocomplete=true`);
      const data = await res.json();
      if (data.features && data.features.length > 0) {
        setSearchResults(data.features);
      }
    } catch (err) {
      console.error("Geocoding error", err);
    }
  };

  const handleSelectResult = (feature: any) => {
    const [featureLng, featureLat] = feature.center;
    if (mapRef.current && markerRef.current) {
      mapRef.current.flyTo({ center: [featureLng, featureLat], zoom: 15 });
      markerRef.current.setLngLat([featureLng, featureLat]);
      onChange(featureLat.toFixed(6), featureLng.toFixed(6));
      setSearchResults([]);
      setSearchQuery(feature.place_name);
    }
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value === "") setSearchResults([]);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSearch();
                }
              }}
              placeholder="Tìm kiếm địa điểm..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#5C3317] focus:border-[#5C3317] text-sm"
            />
          </div>
          <button type="button" onClick={handleSearch} className="px-4 py-2 bg-[#5C3317] text-white rounded-md text-sm hover:bg-[#4A2810]">
            Tìm
          </button>
        </div>
        
        {searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
            {searchResults.map((feature) => (
              <div 
                key={feature.id} 
                className="px-4 py-2 hover:bg-gray-50 cursor-pointer text-sm border-b border-gray-100 last:border-0"
                onClick={() => handleSelectResult(feature)}
              >
                {feature.place_name}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="relative h-[300px] w-full rounded-md border border-gray-300 overflow-hidden">
        <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
      </div>
      <p className="text-xs text-gray-500 text-center">Kéo thả ghim hoặc click trên bản đồ để chọn tọa độ</p>
    </div>
  );
}
