import React from "react";
import { Search, Sun, Moon, MapPin, Globe, AlertCircle } from "lucide-react";
import { SeededBusiness } from "../data/bathinda_seeded";
import { scoreBusiness } from "../lib/scoring";

interface NavbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  businesses: SeededBusiness[];
  theme: "dark" | "light";
  toggleTheme: () => void;
  onSelectBusiness: (business: SeededBusiness) => void;
}

export default function Navbar({
  searchQuery,
  setSearchQuery,
  businesses,
  theme,
  toggleTheme,
  onSelectBusiness,
}: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Compute real-time stats
  const totalCount = businesses.length;
  
  const noWebsiteCount = React.useMemo(() => {
    return businesses.filter((b) => b.websiteStatus === "NO").length;
  }, [businesses]);

  const highOppCount = React.useMemo(() => {
    return businesses.filter((b) => {
      const { score } = scoreBusiness(b);
      return b.websiteStatus !== "YES" && score >= 70;
    }).length;
  }, [businesses]);

  // Extract top 5 opportunities to show as suggestions when search is empty
  const topOpportunities = React.useMemo(() => {
    return [...businesses]
      .map((b) => ({ business: b, score: scoreBusiness(b).score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((x) => x.business);
  }, [businesses]);

  // Autocomplete search suggestions matching query
  const filteredSuggestions = React.useMemo(() => {
    if (!searchQuery.trim()) return [];
    const query = searchQuery.toLowerCase().trim();
    return businesses.filter(
      (b) =>
        b.name.toLowerCase().includes(query) ||
        b.area.toLowerCase().includes(query) ||
        b.category.toLowerCase().includes(query)
    ).slice(0, 8);
  }, [businesses, searchQuery]);

  return (
    <header className="sticky top-0 z-[1001] flex flex-col md:flex-row items-center justify-between px-6 py-4 border-b border-border bg-surface text-text font-sans transition-colors duration-200" id="app-header">
      {/* Brand Logo & Subtitle */}
      <div className="flex items-center gap-3 mb-3 md:mb-0 w-full md:w-auto justify-between md:justify-start" id="brand-container">
        <div className="flex items-center gap-2">
          <div className="bg-text p-2 rounded-none text-bg flex items-center justify-center border border-border" id="logo-icon-box">
            <div className="w-4 h-4 border border-bg rotate-45 flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-amber rounded-full"></div>
            </div>
          </div>
          <div>
            <h1 className="font-display font-bold text-lg tracking-tight text-text flex items-center gap-2">
              OppMap <span className="text-[10px] bg-text text-bg px-2 py-0.5 font-mono font-bold tracking-widest uppercase border border-border">BI Platform</span>
            </h1>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Bathinda F&B Market intelligence</p>
          </div>
        </div>
        
        {/* Theme button on mobile */}
        <button
          onClick={toggleTheme}
          className="p-2 border border-border rounded-none bg-surface-2 hover:bg-text hover:text-bg text-text transition-all md:hidden cursor-pointer"
          title="Toggle Theme"
          id="theme-toggle-mobile"
        >
          {theme === "dark" ? <Sun className="w-4 h-4 text-amber" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      {/* Global Search Bar */}
      <div className="relative w-full md:max-w-md mx-0 md:mx-6 mb-3 md:mb-0" id="search-container">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-text-muted">
          <Search className="w-4 h-4" />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="SEARCH MARKET PROSPECTS..."
          className="w-full pl-10 pr-4 py-2 text-xs border border-border rounded-none bg-surface-2 text-text placeholder-text-muted focus:outline-none focus:border-amber transition-all font-mono uppercase tracking-wider"
          id="global-search-input"
        />

        {/* Search Suggestions Dropdown */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface border border-border z-[1050] max-h-64 overflow-y-auto shadow-none flex flex-col font-mono" id="search-suggestions-dropdown">
            {!searchQuery.trim() ? (
              <>
                <div className="px-3 py-1.5 bg-surface-2 border-b border-border text-[9px] text-text-muted uppercase font-bold tracking-wider">
                  Top Opportunity Targets
                </div>
                {topOpportunities.map((b) => {
                  const { score } = scoreBusiness(b);
                  return (
                    <button
                      key={b.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchQuery(b.name);
                        onSelectBusiness(b);
                        setIsOpen(false);
                      }}
                      className="px-3 py-2 text-left text-[11px] text-text hover:bg-text hover:text-bg transition-colors flex items-center justify-between border-b border-border last:border-b-0 cursor-pointer"
                    >
                      <span className="truncate max-w-[280px] font-bold">{b.name}</span>
                      <span className="text-[10px] text-amber font-mono font-bold">Score: {score}</span>
                    </button>
                  );
                })}
              </>
            ) : (
              <>
                {filteredSuggestions.length > 0 ? (
                  <>
                    <div className="px-3 py-1.5 bg-surface-2 border-b border-border text-[9px] text-text-muted uppercase font-bold tracking-wider">
                      Matching Prospects
                    </div>
                    {filteredSuggestions.map((b) => {
                      const { score } = scoreBusiness(b);
                      return (
                        <button
                          key={b.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchQuery(b.name);
                            onSelectBusiness(b);
                            setIsOpen(false);
                          }}
                          className="px-3 py-2 text-left text-[11px] text-text hover:bg-text hover:text-bg transition-colors flex items-center justify-between border-b border-border last:border-b-0 cursor-pointer"
                        >
                          <div className="flex flex-col truncate">
                            <span className="truncate max-w-[260px] font-bold">{b.name}</span>
                            <span className="text-[9px] text-text-muted group-hover:text-bg/60 uppercase">{b.category} · {b.area}</span>
                          </div>
                          <span className="text-[10px] text-amber font-mono font-bold">Score: {score}</span>
                        </button>
                      );
                    })}
                  </>
                ) : (
                  <div className="px-3 py-3 text-center text-xs text-text-muted">
                    NO PROSPECTS FOUND
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Stats and Utilities */}
      <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end" id="stats-utilities-container">
        {/* Stat Counters */}
        <div className="flex items-center gap-2 md:gap-4 text-xs font-mono" id="nav-stat-counters">
          <div className="px-3 py-1.5 bg-surface-2 rounded-none border border-border flex items-center gap-1.5" id="stat-total">
            <span className="w-2 h-2 rounded-none bg-blue"></span>
            <span className="text-text-muted uppercase text-[10px]">Listed:</span>
            <span className="font-bold text-text data-value">{totalCount}</span>
          </div>
          
          <div className="px-3 py-1.5 bg-surface-2 rounded-none border border-border flex items-center gap-1.5" id="stat-no-website">
            <span className="w-2 h-2 rounded-none bg-red"></span>
            <span className="text-text-muted uppercase text-[10px]">No Web:</span>
            <span className="font-bold text-red data-value">{noWebsiteCount}</span>
          </div>

          <div className="px-3 py-1.5 bg-surface-2 rounded-none border border-border flex items-center gap-1.5" id="stat-high-opp">
            <span className="w-2 h-2 rounded-none bg-amber animate-pulse"></span>
            <span className="text-text-muted uppercase text-[10px]">High Opp:</span>
            <span className="font-bold text-amber data-value">{highOppCount}</span>
          </div>
        </div>

        {/* Theme toggle on Desktop */}
        <button
          onClick={toggleTheme}
          className="p-2 border border-border rounded-none bg-surface-2 hover:bg-text hover:text-bg text-text transition-all hidden md:flex items-center justify-center cursor-pointer"
          title="Toggle Theme"
          id="theme-toggle-desktop"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber" />
          ) : (
            <Moon className="w-4 h-4 text-text" />
          )}
        </button>
      </div>
    </header>
  );
}
