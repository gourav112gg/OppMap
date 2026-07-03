import React, { useEffect, useRef } from "react";
import L from "leaflet";
import { SeededBusiness } from "../data/bathinda_seeded";
import { scoreBusiness } from "../lib/scoring";

interface MapContainerProps {
  businesses: SeededBusiness[];
  selectedBusiness: SeededBusiness | null;
  onSelectBusiness: (business: SeededBusiness) => void;
  theme: "dark" | "light";
}

export default function MapContainer({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  theme,
}: MapContainerProps) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapInstance = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // 1. Initialize Leaflet Map Instance
  useEffect(() => {
    if (!mapRef.current) return;

    // Center coordinates for Bathinda, Punjab
    const centerLat = 30.2110;
    const centerLng = 74.9455;

    // Create Map
    const map = L.map(mapRef.current, {
      center: [centerLat, centerLng],
      zoom: 14,
      zoomControl: false, // We'll add custom positioned zoom controls
    });

    leafletMapInstance.current = map;

    // Add standard Zoom Controls to the bottom right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Handle window resizing to keep map canvas smooth and prevent grey tiles
    const handleResize = () => {
      map.invalidateSize();
    };
    window.addEventListener("resize", handleResize);

    // Invalidate size immediately after loading to ensure complete layout render
    const timer = setTimeout(handleResize, 100);

    // Clean up on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
      map.remove();
      leafletMapInstance.current = null;
    };
  }, []);

  // 2. Add Tile Layers based on Theme (Dark Mode vs Warm Light Mode)
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map) return;

    // Remove existing tile layers
    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    // Dark Map Style (CartoDB Dark Matter) vs Light Map Style (CartoDB Voyager)
    const tileUrl =
      theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";

    const attribution =
      theme === "dark"
        ? '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

    L.tileLayer(tileUrl, {
      attribution,
      maxZoom: 20,
    }).addTo(map);
  }, [theme]);

  // 3. Update and Render Markers dynamically
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map) return;

    // Clear old markers from map
    markersRef.current.forEach((marker) => map.removeLayer(marker));
    markersRef.current = [];

    // Draw new markers
    businesses.forEach((business) => {
      const { score, tier } = scoreBusiness(business);
      
      // Determine colors based on business category
      let pinColor = "var(--color-amber)";
      if (business.category === "Restaurant") {
        pinColor = "var(--color-teal)";
      } else if (business.category === "Dhaba") {
        pinColor = "var(--color-red)";
      }

      // Pulse ring for high priority targets
      const isPulsing = tier === "HIGH";

      // Create custom DivIcon html with SVG Map Pin and Shop Name tag
      const iconHtml = `
        <div class="flex items-center gap-1.5 whitespace-nowrap hover:scale-105 transition-transform duration-150" style="width: 160px; height: 40px;">
          <!-- Pin Icon Box -->
          <div class="relative w-8 h-10 shrink-0">
            <!-- Pulsing Ring for high priority prospects -->
            ${isPulsing ? '<div class="absolute top-1 left-1 w-6 h-6 rounded-full pulse-amber" style="z-index: -1;"></div>' : ""}
            <svg class="w-8 h-10" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 9 12 18 12 18s12-9 12-18c0-6.63-5.37-12-12-12z" fill="${pinColor}" stroke="var(--color-border)" stroke-width="2"/>
              <circle cx="12" cy="11" r="7" fill="var(--color-surface)" />
              <text x="12" y="14" fill="var(--color-text)" font-family="var(--font-mono), monospace" font-size="8" font-weight="900" text-anchor="middle">${score}</text>
            </svg>
          </div>
          <!-- Floating Shop Name Card - Hidden by default, animated on hover -->
          <div class="marker-name-card bg-surface/95 text-text border border-border px-1.5 py-0.5 text-[9px] font-mono font-bold tracking-tight shadow-sm select-none truncate max-w-[110px] rounded-none uppercase transition-all duration-200 opacity-0 -translate-x-1 pointer-events-none">
            ${business.name}
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-marker", // reset default styles
        iconSize: [160, 40],
        iconAnchor: [16, 30],
        popupAnchor: [0, -30],
      });

      // Plot marker
      const marker = L.marker([business.lat, business.lng], { icon: customIcon })
        .addTo(map)
        .on("click", () => {
          onSelectBusiness(business);
        });

      // Add a clean, responsive popup
      const websiteBadge = business.websiteStatus === "YES" 
        ? '<span class="text-[9px] bg-blue/10 text-blue border border-blue/30 px-1 py-0.5 rounded-none font-bold uppercase font-mono">WEBSITE ACTIVE</span>'
        : '<span class="text-[9px] bg-red/10 text-red border border-red/30 px-1 py-0.5 rounded-none font-bold uppercase font-mono">MISSING WEBSITE</span>';

      const popupHtml = `
        <div class="p-2 font-mono text-text bg-surface" id="popup-content-${business.id}">
          <div class="flex items-center justify-between gap-3 border-b border-border/40 pb-1.5 mb-1.5">
            <span class="text-[8px] uppercase text-text-muted font-bold tracking-wider">${business.category}</span>
            ${websiteBadge}
          </div>
          <h4 class="font-bold text-xs text-text leading-tight tracking-tight">${business.name}</h4>
          <p class="text-[10px] text-text-muted font-sans mt-1">${business.area}</p>
          <div class="flex items-center justify-between text-[10px] mt-2 pt-2 border-t border-border/30">
            <span>Rating: <span class="font-bold text-amber">${business.rating || "N/A"}★</span></span>
            <span>Score: <span class="font-bold text-teal">${score}/100</span></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);
      markersRef.current.push(marker);
    });
  }, [businesses, onSelectBusiness]);

  // 4. Smooth Pan/Zoom to Selected Business
  useEffect(() => {
    const map = leafletMapInstance.current;
    if (!map || !selectedBusiness) return;

    // Find the corresponding marker to trigger popup open
    const targetMarkerIndex = businesses.findIndex((b) => b.id === selectedBusiness.id);
    if (targetMarkerIndex !== -1) {
      const marker = markersRef.current[targetMarkerIndex];
      if (marker) {
        // Fly to business with beautiful zoom curve
        map.flyTo([selectedBusiness.lat, selectedBusiness.lng], 16, {
          animate: true,
          duration: 1.5,
        });
        
        // Open popup after a short transition delay
        setTimeout(() => {
          marker.openPopup();
        }, 800);
      }
    }
  }, [selectedBusiness, businesses]);

  return (
    <div className="relative w-full h-full bg-surface-2 transition-all duration-300 overflow-hidden" id="map-stage">
      {/* Real Map Canvas */}
      <div ref={mapRef} className="w-full h-full z-10" id="map-viewport" />

      {/* Floating Interactive Map Legend */}
      <div
        className="absolute bottom-6 left-6 z-[1000] p-4 rounded-none border border-border bg-surface/95 text-text text-xs space-y-2.5 shadow-none hidden sm:block pointer-events-auto"
        id="map-legend"
      >
        <h5 className="col-header uppercase tracking-wider text-[10px] text-text-muted border-none pb-0">Category Legend</h5>
        
        <div className="space-y-1.5 font-mono text-[10px] uppercase tracking-wider" id="legend-list">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-amber border border-border flex items-center justify-center shrink-0"></span>
            <span>Cafe</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-teal border border-border flex items-center justify-center shrink-0"></span>
            <span>Restaurant</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-red border border-border flex items-center justify-center shrink-0"></span>
            <span>Dhaba</span>
          </div>

          <div className="pt-1.5 border-t border-border/40 text-[9px] text-text-muted flex items-center gap-2">
            <span className="w-3 h-3 rounded-full border border-border bg-transparent pulse-amber shrink-0"></span>
            <span>Pulsing (High Opp)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
