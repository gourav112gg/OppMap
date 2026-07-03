import React, { useState, useEffect, useMemo } from "react";
import Navbar from "./components/Navbar";
import FilterPanel from "./components/FilterPanel";
import BusinessList from "./components/BusinessList";
import BusinessDetail from "./components/BusinessDetail";
import CompareTray from "./components/CompareTray";
import CompareModal from "./components/CompareModal";
import MapContainer from "./components/MapContainer";
import { BATHINDA_BUSINESSES, SeededBusiness } from "./data/bathinda_seeded";
import { scoreBusiness, ScoringWeights, DEFAULT_WEIGHTS } from "./lib/scoring";
import { runConsoleDiagnostics } from "./lib/diagnostics";
import { Menu, X, Globe, AlertTriangle } from "lucide-react";

export default function App() {
  // --- 1. Global State Management ---
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [areaFilter, setAreaFilter] = useState("All");
  const [websiteFilter, setWebsiteFilter] = useState("All");
  const [opportunityFilter, setOpportunityFilter] = useState("All");
  const [weights, setWeights] = useState<ScoringWeights>(DEFAULT_WEIGHTS);
  
  const [selectedBusiness, setSelectedBusiness] = useState<SeededBusiness | null>(null);
  const [compareList, setCompareList] = useState<SeededBusiness[]>([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // --- 1.2 Real-time Sync & Discovery States ---
  const [businesses, setBusinesses] = useState<SeededBusiness[]>(() => {
    try {
      const saved = localStorage.getItem("oppmap_businesses");
      return saved ? JSON.parse(saved) : BATHINDA_BUSINESSES;
    } catch (e) {
      return BATHINDA_BUSINESSES;
    }
  });
  const [isEnriching, setIsEnriching] = useState<string | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [discoveryStatus, setDiscoveryStatus] = useState("");
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastEnrichedSources, setLastEnrichedSources] = useState<string[]>([]);
  const [simulatedMessage, setSimulatedMessage] = useState<string | null>(null);

  // Persist to localStorage for premium, offline-first feel
  useEffect(() => {
    try {
      localStorage.setItem("oppmap_businesses", JSON.stringify(businesses));
    } catch (e) {
      console.error("Failed to save businesses to localStorage", e);
    }
  }, [businesses]);

  // --- Run Diagnostic Dataset Audit ---
  useEffect(() => {
    runConsoleDiagnostics(businesses);
  }, [businesses]);

  // --- 2. Synchronize UI Theme ---
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // --- 3. Business Filtering & Sorting Core Logic ---
  const filteredBusinesses = useMemo(() => {
    return businesses.filter((b) => {
      // Search matching: name, category, or sub-locality
      const matchesSearch =
        searchQuery.trim() === "" ||
        b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.category.toLowerCase().includes(searchQuery.toLowerCase());

      // Category matching
      const matchesCategory =
        categoryFilter === "All" || b.category === categoryFilter;

      // Area/Sub-locality matching
      const matchesArea = areaFilter === "All" || b.area === areaFilter;

      // Website Status matching
      const matchesWebsite =
        websiteFilter === "All" || b.websiteStatus === websiteFilter;

      // Opportunity Tier matching
      const { score, tier } = scoreBusiness(b, weights, businesses);
      const matchesOpportunity =
        opportunityFilter === "All" || tier === opportunityFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesArea &&
        matchesWebsite &&
        matchesOpportunity
      );
    })
    // Sort programmatically: High opportunity (higher scores) listed first
    .sort((x, y) => {
      const scoreX = scoreBusiness(x, weights, businesses).score;
      const scoreY = scoreBusiness(y, weights, businesses).score;
      return scoreY - scoreX;
    });
  }, [businesses, searchQuery, categoryFilter, areaFilter, websiteFilter, opportunityFilter, weights]);

  // --- 4. User Event Handlers ---
  const handleSelectBusiness = (business: SeededBusiness) => {
    setSelectedBusiness((prev) => (prev?.id === business.id ? null : business));
    // Auto-close mobile drawer sidebar on click
    setIsMobileSidebarOpen(false);
  };

  const handleToggleCompare = (business: SeededBusiness, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent card-selection trigger
    setCompareList((prev) => {
      const exists = prev.some((b) => b.id === business.id);
      if (exists) {
        return prev.filter((b) => b.id !== business.id);
      } else {
        // Prevent excessive comparison sizes
        if (prev.length >= 5) {
          alert("Maximum 5 businesses can be compared at once.");
          return prev;
        }
        return [...prev, business];
      }
    });
  };

  const handleRemoveFromCompare = (business: SeededBusiness) => {
    setCompareList((prev) => prev.filter((b) => b.id !== business.id));
  };

  const handleClearCompare = () => {
    setCompareList([]);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setCategoryFilter("All");
    setAreaFilter("All");
    setWebsiteFilter("All");
    setOpportunityFilter("All");
    setSelectedBusiness(null);
  };

  // --- 5. Real-Time Web Search Grounding Handlers ---
  const handleEnrichBusiness = async (businessId: string) => {
    const businessToEnrich = businesses.find((b) => b.id === businessId);
    if (!businessToEnrich) return;

    setIsEnriching(businessId);
    setSyncError(null);
    setLastEnrichedSources([]);

    try {
      const res = await fetch("/api/realtime/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: businessToEnrich.id,
          name: businessToEnrich.name,
          category: businessToEnrich.category,
          area: businessToEnrich.area,
          address: businessToEnrich.address,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to fetch real-time web sync data.");
      }

      if (data.isSimulated) {
        setSimulatedMessage(data.simulatedReason);
      } else {
        setSimulatedMessage(null);
      }

      // Merge enriched data
      const updatedBusiness = {
        ...businessToEnrich,
        ...data.enrichedData,
        // Keep original lat/lng if not specified
        lat: data.enrichedData.lat || businessToEnrich.lat,
        lng: data.enrichedData.lng || businessToEnrich.lng,
      };

      setBusinesses((prev) =>
        prev.map((b) => (b.id === businessId ? updatedBusiness : b))
      );

      // Also update selectedBusiness if currently active
      setSelectedBusiness(updatedBusiness);

      if (data.sources) {
        setLastEnrichedSources(data.sources);
      }
    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || "An error occurred during real-time web sync.");
    } finally {
      setIsEnriching(null);
    }
  };

  const handleDiscoverBusinesses = async () => {
    setIsDiscovering(true);
    setSyncError(null);
    
    // Step-by-step loading animation to improve UX
    const steps = [
      "Accessing Google Search Grounding engine...",
      "Searching for active places in Bathinda, Punjab...",
      "Analyzing business registries and citations...",
      "Geocoding local coordinates & computing opportunity metrics...",
      "Injecting real-time records into the dashboard..."
    ];

    let currentStep = 0;
    setDiscoveryStatus(steps[0]);
    const interval = setInterval(() => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        setDiscoveryStatus(steps[currentStep]);
      }
    }, 1500);

    try {
      const res = await fetch("/api/realtime/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: categoryFilter === "All" ? "Cafe" : categoryFilter,
          area: areaFilter,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to discover real-time businesses.");
      }

      if (data.isSimulated) {
        setSimulatedMessage(data.simulatedReason);
      } else {
        setSimulatedMessage(null);
      }

      const discoveredList: SeededBusiness[] = data.discovered || [];
      if (discoveredList.length === 0) {
        throw new Error("No new businesses found for the selected category and sub-locality on the live web.");
      }

      // Merge into businesses state (avoiding duplicates by matching clean name lowercase)
      setBusinesses((prev) => {
        const merged = [...prev];
        discoveredList.forEach((newBiz) => {
          const duplicateIdx = merged.findIndex(
            (b) => b.name.toLowerCase() === newBiz.name.toLowerCase()
          );
          if (duplicateIdx !== -1) {
            // Update existing with live data
            merged[duplicateIdx] = {
              ...merged[duplicateIdx],
              ...newBiz,
              id: merged[duplicateIdx].id // preserve original ID
            };
          } else {
            merged.unshift(newBiz); // prepend new ones
          }
        });
        return merged;
      });

      // Automatically select the first newly discovered business
      if (discoveredList.length > 0) {
        setSelectedBusiness(discoveredList[0]);
      }

    } catch (err: any) {
      console.error(err);
      setSyncError(err.message || "Failed to discover real-time businesses.");
    } finally {
      clearInterval(interval);
      setIsDiscovering(false);
      setDiscoveryStatus("");
    }
  };

  return (
    <div className="h-screen max-h-screen overflow-hidden flex flex-col bg-bg text-text transition-colors duration-200" id="oppmap-bi-app">
      {/* Dynamic Header */}
      <Navbar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        businesses={businesses}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Workspace Frame */}
      <main className="flex-1 flex flex-col md:flex-row relative overflow-hidden" id="main-workspace">
        
        {/* Left Control Sidebar (Desktop & collapsible Mobile Drawer) */}
        <aside
          className={`w-full md:w-[380px] border-r border-border bg-surface flex flex-col shrink-0 z-30 transition-all duration-300 md:static absolute inset-y-0 left-0 ${
            isMobileSidebarOpen
              ? "translate-x-0 h-full w-4/5 sm:w-[380px]"
              : "-translate-x-full md:translate-x-0 md:h-full"
          }`}
          id="control-sidebar"
        >
          <div className="h-full overflow-y-auto flex flex-col w-full" id="control-sidebar-inner">
            {/* Mobile close button drawer */}
            <div className="flex md:hidden items-center justify-between p-4 border-b border-border bg-surface-2" id="mobile-drawer-header">
              <span className="font-mono font-bold text-xs uppercase tracking-wider text-text-muted">Console Sidebar</span>
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-1 rounded-none border border-border text-text-muted hover:bg-text hover:text-bg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filtering Widget Grid */}
            <FilterPanel
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              areaFilter={areaFilter}
              setAreaFilter={setAreaFilter}
              websiteFilter={websiteFilter}
              setWebsiteFilter={setWebsiteFilter}
              opportunityFilter={opportunityFilter}
              setOpportunityFilter={setOpportunityFilter}
              resetFilters={resetFilters}
              weights={weights}
              setWeights={setWeights}
            />

            {/* Real-time Web Intelligence Discovery Section - Disabled/Hidden for isolation
            <div className="p-5 border-b border-border bg-blue/5 flex flex-col gap-3" id="live-discovery-section">
              <div className="flex items-center justify-between">
                <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-blue flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5 text-blue animate-pulse" />
                  <span>Real-Time Discovery</span>
                </h4>
                <span className="text-[8px] bg-blue/10 text-blue px-1.5 py-0.5 border border-blue/30 font-mono font-bold uppercase tracking-wider">
                  Live Engine
                </span>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed font-sans">
                Query the live web using Gemini Search Grounding to find actual active places in Bathinda. Updates are merged dynamically.
              </p>

              {syncError && (
                <div className="p-2.5 bg-red/10 border border-red/20 text-red text-[11px] font-sans flex items-start gap-1.5 rounded-none">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{syncError}</span>
                </div>
              )}

              {simulatedMessage && (
                <div className="p-2.5 bg-amber/10 border border-amber/20 text-amber text-[10px] font-mono flex flex-col gap-1 rounded-none">
                  <div className="flex items-center gap-1.5 font-bold uppercase text-[9px] tracking-wider">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Grounding Rate-Limit Active</span>
                  </div>
                  <span className="font-sans leading-normal text-text-muted text-[10px]">{simulatedMessage}</span>
                </div>
              )}

              {isDiscovering ? (
                <div className="p-4 border border-blue/30 bg-blue/5 flex flex-col gap-2.5 text-center font-mono">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-3.5 h-3.5 border-2 border-blue border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] text-blue font-bold tracking-wider uppercase">Searching Live Web...</span>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed font-sans animate-pulse">{discoveryStatus}</p>
                </div>
              ) : (
                <button
                  onClick={handleDiscoverBusinesses}
                  className="w-full py-2 px-3 border border-blue bg-blue/10 text-blue font-mono font-bold text-[10px] uppercase tracking-wider hover:bg-blue hover:text-bg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  id="btn-discover-realtime"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span>Discover Live {categoryFilter === "All" ? "Cafes" : `${categoryFilter}s`} in {areaFilter === "All" ? "Bathinda" : areaFilter}</span>
                </button>
              )}
            </div>
            */}

            {/* Scrollable list of matching places */}
            <BusinessList
              businesses={filteredBusinesses}
              selectedBusiness={selectedBusiness}
              onSelectBusiness={handleSelectBusiness}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
              weights={weights}
            />
          </div>
        </aside>

        {/* Mobile Filter Drawer Trigger Button */}
        <button
          onClick={() => setIsMobileSidebarOpen(true)}
          className="md:hidden fixed top-24 left-4 z-[999] bg-surface text-text p-2.5 rounded-none shadow-none flex items-center justify-center border-2 border-border cursor-pointer hover:bg-text hover:text-bg"
          id="mobile-sidebar-trigger"
          title="Open filters sidebar"
        >
          <Menu className="w-4 h-4" />
        </button>

        {/* Center/Right Map Stage Canvas */}
        <section className="flex-1 relative h-[calc(100vh-80px)] md:h-full" id="map-canvas-stage">
          <MapContainer
            businesses={filteredBusinesses}
            selectedBusiness={selectedBusiness}
            onSelectBusiness={handleSelectBusiness}
            theme={theme}
          />
        </section>

        {/* Slide-in Business Detail Panel Overlay */}
        {selectedBusiness && (
          <>
            {/* Backdrop for click-away capability on mobile */}
            <div
              className="fixed inset-0 z-[1099] bg-slate-950/40 backdrop-blur-xs md:hidden"
              onClick={() => setSelectedBusiness(null)}
              id="detail-panel-backdrop"
            />
            <BusinessDetail
              business={selectedBusiness}
              onClose={() => setSelectedBusiness(null)}
              compareList={compareList}
              onToggleCompare={handleToggleCompare}
              weights={weights}
              allBusinesses={businesses}
              onEnrich={handleEnrichBusiness}
              isEnriching={isEnriching === selectedBusiness.id}
              lastSources={lastEnrichedSources}
            />
          </>
        )}
      </main>

      {/* Persistent Bottom Comparison Shortlist Tray */}
      <CompareTray
        compareList={compareList}
        onRemove={handleRemoveFromCompare}
        onClear={handleClearCompare}
        onGenerateReport={() => setIsCompareModalOpen(true)}
      />

      {/* Comparison & Pitch Report Modal */}
      {isCompareModalOpen && (
        <CompareModal
          compareList={compareList}
          onClose={() => setIsCompareModalOpen(false)}
          onRemove={handleRemoveFromCompare}
          weights={weights}
          allBusinesses={businesses}
        />
      )}
    </div>
  );
}
