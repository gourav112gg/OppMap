import React, { useState } from "react";
import { Filter, RotateCcw, Sliders, CheckSquare, Square, ChevronDown, ChevronUp } from "lucide-react";
import { BATHINDA_AREAS } from "../data/bathinda_seeded";
import { OpportunityTier, ScoringWeights, DEFAULT_WEIGHTS } from "../lib/scoring";

interface FilterPanelProps {
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  areaFilter: string;
  setAreaFilter: (area: string) => void;
  websiteFilter: string;
  setWebsiteFilter: (status: string) => void;
  opportunityFilter: string;
  setOpportunityFilter: (tier: string) => void;
  resetFilters: () => void;
  weights: ScoringWeights;
  setWeights: React.Dispatch<React.SetStateAction<ScoringWeights>>;
}

export default function FilterPanel({
  categoryFilter,
  setCategoryFilter,
  areaFilter,
  setAreaFilter,
  websiteFilter,
  setWebsiteFilter,
  opportunityFilter,
  setOpportunityFilter,
  resetFilters,
  weights,
  setWeights,
}: FilterPanelProps) {
  const [isCalibratorOpen, setIsCalibratorOpen] = useState(true);

  const categories = ["All", "Cafe", "Restaurant", "Dhaba"];
  const websiteStatuses = [
    { value: "All", label: "All Sites" },
    { value: "NO", label: "No Website" },
    { value: "YES", label: "Has Website" },
  ];

  const opportunityTiers = [
    { value: "All", label: "All Tiers", color: "border-border hover:border-text" },
    { value: "HIGH", label: "High", color: "border-amber/40 text-amber bg-amber/5 hover:bg-amber/10 hover:border-amber" },
    { value: "MEDIUM", label: "Medium", color: "border-teal/40 text-teal bg-teal/5 hover:bg-teal/10 hover:border-teal" },
    { value: "LOW", label: "Low", color: "border-red/40 text-red bg-red/5 hover:bg-red/10 hover:border-red" },
    { value: "HAS_WEBSITE", label: "Has Web", color: "border-blue/40 text-blue bg-blue/5 hover:bg-blue/10 hover:border-blue" },
  ];

  const presets = [
    {
      name: "Default BI",
      label: "Balanced Audit",
      description: "Standard balanced model assessing all gaps equally.",
      weights: DEFAULT_WEIGHTS,
    },
    {
      name: "Web-Centric",
      label: "Web Design Leads",
      description: "Prioritizes finding clients who lack a website.",
      weights: {
        website: 60,
        reviews: 10,
        rating: 10,
        phone: 10,
        hours: 10,
        enableCategorySmart: true,
        enableCompetitorDensity: true,
      },
    },
    {
      name: "Dine-In Sentiment",
      label: "SEO & Review Leads",
      description: "Prioritizes businesses with poor ratings or low reviews.",
      weights: {
        website: 10,
        reviews: 35,
        rating: 35,
        phone: 10,
        hours: 10,
        enableCategorySmart: true,
        enableCompetitorDensity: true,
      },
    },
    {
      name: "Contact / Hours",
      label: "Listing Setup Leads",
      description: "Prioritizes listings missing working hours or phone numbers.",
      weights: {
        website: 20,
        reviews: 10,
        rating: 10,
        phone: 30,
        hours: 30,
        enableCategorySmart: true,
        enableCompetitorDensity: true,
      },
    },
  ];

  const handleWeightChange = (key: keyof ScoringWeights, val: number) => {
    setWeights((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleToggleOption = (key: "enableCategorySmart" | "enableCompetitorDensity") => {
    setWeights((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const applyPreset = (presetWeights: ScoringWeights) => {
    setWeights(presetWeights);
  };

  const totalWeightSum = weights.website + weights.reviews + weights.rating + weights.phone + weights.hours;

  return (
    <div className="flex flex-col gap-5 p-5 border-b border-border bg-surface text-text font-sans transition-colors duration-200" id="filter-panel-container">
      {/* Sidebar Header */}
      <div className="flex items-center justify-between border-b border-border pb-2" id="filter-header-bar">
        <h3 className="col-header flex items-center gap-2 text-xs uppercase tracking-widest font-bold text-text-muted border-none pb-0">
          <Filter className="w-3.5 h-3.5 text-amber shrink-0" />
          <span>Console Controls</span>
        </h3>
        <button
          onClick={() => {
            resetFilters();
            setWeights(DEFAULT_WEIGHTS);
          }}
          className="flex items-center gap-1 text-[10px] text-text-muted hover:text-amber font-mono uppercase tracking-wider transition-colors cursor-pointer"
          title="Reset Filters & Calibration"
          id="btn-reset-filters"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset All</span>
        </button>
      </div>

      {/* Main Select Form Grid */}
      <div className="grid grid-cols-2 gap-3" id="filters-dropdowns-grid">
        {/* Category Dropdown */}
        <div className="flex flex-col gap-1.5" id="category-filter-group">
          <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">F&B Category</label>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-none border border-border bg-surface-2 text-text focus:outline-none focus:border-amber cursor-pointer transition-colors font-mono uppercase"
            id="select-category"
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "All" ? "All Categories" : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Area Dropdown */}
        <div className="flex flex-col gap-1.5" id="area-filter-group">
          <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Sub-locality</label>
          <select
            value={areaFilter}
            onChange={(e) => setAreaFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-none border border-border bg-surface-2 text-text focus:outline-none focus:border-amber cursor-pointer transition-colors font-mono uppercase"
            id="select-area"
          >
            <option value="All">All Areas</option>
            {BATHINDA_AREAS.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Website Status Chip Filters */}
      <div className="flex flex-col gap-2" id="website-filter-group">
        <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Website Presence</label>
        <div className="flex flex-wrap gap-1.5" id="website-chips-container">
          {websiteStatuses.map((status) => {
            const isActive = websiteFilter === status.value;
            return (
              <button
                key={status.value}
                onClick={() => setWebsiteFilter(status.value)}
                className={`px-3 py-1 text-[10px] font-mono uppercase tracking-wider rounded-none border transition-all cursor-pointer ${
                  isActive
                    ? "bg-text text-bg border-border font-bold shadow-none"
                    : "bg-surface-2 text-text border-border hover:border-text-muted"
                }`}
                id={`chip-web-${status.value}`}
              >
                {status.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Opportunity Tier Quick-Filters */}
      <div className="flex flex-col gap-2 border-b border-border pb-4" id="opp-filter-group">
        <label className="text-[10px] font-mono uppercase tracking-wider text-text-muted">Opportunity Rating</label>
        <div className="flex flex-wrap gap-1.5" id="opp-chips-container">
          {opportunityTiers.map((tier) => {
            const isActive = opportunityFilter === tier.value;
            return (
              <button
                key={tier.value}
                onClick={() => setOpportunityFilter(tier.value)}
                className={`px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider rounded-none border transition-all cursor-pointer ${
                  isActive
                    ? "bg-text text-bg border-border font-bold shadow-none"
                    : `bg-surface-2 text-text ${tier.color} rounded-none`
                }`}
                id={`chip-opp-${tier.value}`}
              >
                {tier.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Scoring Engine Calibration section */}
      <div className="flex flex-col gap-3" id="calibrator-section">
        <button
          onClick={() => setIsCalibratorOpen(!isCalibratorOpen)}
          className="flex items-center justify-between w-full text-left font-mono font-bold text-xs uppercase tracking-wider text-text hover:text-amber cursor-pointer"
          id="btn-toggle-calibrator"
        >
          <span className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-amber shrink-0" />
            <span>02. Scoring Calibration Engine</span>
          </span>
          {isCalibratorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {isCalibratorOpen && (
          <div className="space-y-4 pt-1" id="calibrator-controls-container">
            {/* Presets Row */}
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-mono uppercase text-text-muted font-bold">What service are you selling? (Presets)</span>
              <div className="grid grid-cols-2 gap-1.5">
                {presets.map((preset) => {
                  const isCurrent =
                    weights.website === preset.weights.website &&
                    weights.reviews === preset.weights.reviews &&
                    weights.rating === preset.weights.rating &&
                    weights.phone === preset.weights.phone &&
                    weights.hours === preset.weights.hours;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset.weights)}
                      className={`px-2 py-1.5 text-[10px] font-mono uppercase tracking-wider border text-center transition-all cursor-pointer truncate ${
                        isCurrent
                          ? "bg-text text-bg border-border font-bold"
                          : "bg-surface-2 text-text border-border/60 hover:border-text"
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
              {/* Active Preset Description */}
              <div className="text-[10px] text-text-muted italic bg-surface-2/40 p-2.5 border border-border/40 mt-0.5">
                {(() => {
                  const currentPreset = presets.find(
                    (p) =>
                      weights.website === p.weights.website &&
                      weights.reviews === p.weights.reviews &&
                      weights.rating === p.weights.rating &&
                      weights.phone === p.weights.phone &&
                      weights.hours === p.weights.hours
                  );
                  return currentPreset
                    ? `Goal: ${currentPreset.description}`
                    : "Goal: Custom priorities selected below.";
                })()}
              </div>
            </div>

            {/* Sliders Container */}
            <div className="space-y-2.5 bg-surface-2/30 p-3 border border-border">
              <span className="text-[9px] font-mono uppercase text-text-muted font-bold block -mb-1">Customize Gaps Importance</span>
              {/* Slider 1: Website Status Gap */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                  <span>Importance: Missing Website</span>
                  <span className="font-bold text-text">{weights.website} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.website}
                  onChange={(e) => handleWeightChange("website", parseInt(e.target.value))}
                  className="w-full accent-amber bg-border h-1 appearance-none cursor-ew-resize rounded-none"
                />
              </div>

              {/* Slider 2: Review Volume Gap */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                  <span>Importance: Few Reviews</span>
                  <span className="font-bold text-text">{weights.reviews} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.reviews}
                  onChange={(e) => handleWeightChange("reviews", parseInt(e.target.value))}
                  className="w-full accent-teal bg-border h-1 appearance-none cursor-ew-resize rounded-none"
                />
              </div>

              {/* Slider 3: Average Rating Gap */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                  <span>Importance: Poor Ratings</span>
                  <span className="font-bold text-text">{weights.rating} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.rating}
                  onChange={(e) => handleWeightChange("rating", parseInt(e.target.value))}
                  className="w-full accent-red bg-border h-1 appearance-none cursor-ew-resize rounded-none"
                />
              </div>

              {/* Slider 4: Phone Contact Gap */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                  <span>Importance: No Phone Number</span>
                  <span className="font-bold text-text">{weights.phone} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.phone}
                  onChange={(e) => handleWeightChange("phone", parseInt(e.target.value))}
                  className="w-full accent-amber bg-border h-1 appearance-none cursor-ew-resize rounded-none"
                />
              </div>

              {/* Slider 5: Timings Gap */}
              <div className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-mono text-text-muted">
                  <span>Importance: No Operating Hours</span>
                  <span className="font-bold text-text">{weights.hours} pts</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={weights.hours}
                  onChange={(e) => handleWeightChange("hours", parseInt(e.target.value))}
                  className="w-full accent-text bg-border h-1 appearance-none cursor-ew-resize rounded-none"
                />
              </div>

              {/* Total normalization status */}
              <div className="flex justify-between items-center text-[9px] font-mono pt-1.5 border-t border-border/40 text-text-muted">
                <span>Sum of Core Gaps:</span>
                <span className={totalWeightSum === 100 ? "text-teal font-bold" : "text-amber font-bold"}>
                  {totalWeightSum} pts {totalWeightSum !== 100 && "(Auto-Normalized)"}
                </span>
              </div>
            </div>

            {/* Smart modifiers switches */}
            <div className="space-y-2 font-mono text-[10px]" id="smart-modifiers">
              {/* Modifier 1: Category Smart */}
              <button
                onClick={() => handleToggleOption("enableCategorySmart")}
                className="flex items-center gap-2 text-left w-full hover:text-amber cursor-pointer"
              >
                {weights.enableCategorySmart ? (
                  <CheckSquare className="w-4 h-4 text-amber shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-text-muted shrink-0" />
                )}
                <div>
                  <span className="block font-bold">SMART TYPE ADJUSTMENTS</span>
                  <span className="text-[9px] text-text-muted font-normal block mt-0.5 leading-snug">
                    Automatically adjusts priorities based on business type (e.g. Cafes need websites more, Dhabas need phone numbers more).
                  </span>
                </div>
              </button>

              {/* Modifier 2: Competitor Density */}
              <button
                onClick={() => handleToggleOption("enableCompetitorDensity")}
                className="flex items-center gap-2 text-left w-full hover:text-amber cursor-pointer pt-1"
              >
                {weights.enableCompetitorDensity ? (
                  <CheckSquare className="w-4 h-4 text-teal shrink-0" />
                ) : (
                  <Square className="w-4 h-4 text-text-muted shrink-0" />
                )}
                <div>
                  <span className="block font-bold">COMPETITION INTENSITY BOOST</span>
                  <span className="text-[9px] text-text-muted font-normal block mt-0.5 leading-snug">
                    Gives extra opportunity points to businesses that face high local competition.
                  </span>
                </div>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
