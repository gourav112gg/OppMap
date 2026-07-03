import React from "react";
import { Star, Globe, Phone, Clock, Plus, Check } from "lucide-react";
import { SeededBusiness, BATHINDA_BUSINESSES } from "../data/bathinda_seeded";
import { scoreBusiness, OpportunityTier, ScoringWeights } from "../lib/scoring";

interface BusinessListProps {
  businesses: SeededBusiness[];
  selectedBusiness: SeededBusiness | null;
  onSelectBusiness: (business: SeededBusiness) => void;
  compareList: SeededBusiness[];
  onToggleCompare: (business: SeededBusiness, e: React.MouseEvent) => void;
  weights: ScoringWeights;
}

export default function BusinessList({
  businesses,
  selectedBusiness,
  onSelectBusiness,
  compareList,
  onToggleCompare,
  weights,
}: BusinessListProps) {
  const getTierBadgeStyles = (tier: OpportunityTier) => {
    switch (tier) {
      case "HIGH":
        return "bg-amber/10 text-amber border-amber/40";
      case "MEDIUM":
        return "bg-teal/10 text-teal border-teal/40";
      case "LOW":
        return "bg-red/10 text-red border-red/40";
      case "HAS_WEBSITE":
        return "bg-blue/10 text-blue border-blue/40";
      default:
        return "bg-text-muted/10 text-text-muted border-border";
    }
  };

  const getTierLabel = (tier: OpportunityTier, score: number) => {
    switch (tier) {
      case "HIGH":
        return `HIGH OPP: ${score}`;
      case "MEDIUM":
        return `MED OPP: ${score}`;
      case "LOW":
        return `LOW OPP: ${score}`;
      case "HAS_WEBSITE":
        return `WEBSITE ACTIVE: ${score}`;
      default:
        return `SCORE: ${score}`;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col bg-surface text-text transition-colors duration-200" id="business-list-scrollable">
      <div className="flex items-center justify-between px-1 pb-2 border-b border-border/40 text-[10px] font-mono uppercase tracking-wider text-text-muted" id="results-meta">
        <span>PROSPECTS: {businesses.length}</span>
        <span>SORTED BY SCORE</span>
      </div>

      <div className="flex flex-col border-t border-l border-r border-border" id="business-rows-grid">
        {businesses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4 bg-surface-2 border-b border-border" id="empty-results-state">
            <p className="text-xs font-mono uppercase tracking-wider text-text-muted">No matching metrics.</p>
            <p className="text-[11px] text-text-muted mt-1 font-sans">Adjust console filters to refresh pipeline.</p>
          </div>
        ) : (
          businesses.map((business, index) => {
            const { score, tier, confidenceScore } = scoreBusiness(business, weights, BATHINDA_BUSINESSES);
            const isSelected = selectedBusiness?.id === business.id;
            const isInCompare = compareList.some((b) => b.id === business.id);

            const rowRank = String(index + 1).padStart(2, "0");

            return (
              <div
                key={business.id}
                onClick={() => onSelectBusiness(business)}
                className={`p-4 border-b border-border bg-surface-2 transition-all duration-150 cursor-pointer group flex flex-col justify-between gap-3 rounded-none relative ${
                  isSelected
                    ? "bg-text text-bg border-l-4 border-l-amber"
                    : isInCompare
                    ? "bg-teal/5 border-l-4 border-l-teal"
                    : "hover:bg-text hover:text-bg"
                }`}
                id={`business-card-${business.id}`}
              >
                <div className="flex justify-between items-start gap-2" id="card-header-row">
                  <div className="flex items-start gap-2" id="card-info-block">
                    {/* Rank counter */}
                    <span className={`font-mono text-xs font-bold mr-1 select-none mt-0.5 ${isSelected ? "text-bg/60" : "text-text-muted group-hover:text-bg/60"}`}>
                      {rowRank}
                    </span>
                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap" id="card-badges">
                        <span className={`text-[9px] uppercase tracking-wider font-mono px-1 border border-border bg-surface/40 ${isSelected ? "text-text bg-bg" : "text-text-muted group-hover:text-bg group-hover:bg-text"}`}>
                          {business.category}
                        </span>
                        <span className={`text-[9px] font-mono tracking-wider px-1.5 border rounded-none ${isSelected ? "bg-bg text-text border-border" : getTierBadgeStyles(tier)}`}>
                          {getTierLabel(tier, score)}
                        </span>
                        <span 
                          className={`text-[9px] font-mono tracking-wider px-1.5 border ${
                            isSelected 
                              ? "bg-bg/10 text-bg border-bg/30" 
                              : confidenceScore >= 80 
                              ? "bg-teal/10 text-teal border-teal/40" 
                              : confidenceScore >= 50 
                              ? "bg-amber/10 text-amber border-amber/40" 
                              : "bg-red/10 text-red border-red/40"
                          }`}
                          title={`Data Completeness Score: ${confidenceScore}%`}
                        >
                          DQ: {confidenceScore}%
                        </span>
                      </div>
                      <h3 className={`font-mono font-bold text-sm mt-1.5 leading-snug tracking-tight transition-colors ${isSelected ? "text-bg" : "text-text group-hover:text-bg"}`}>
                        {business.name}
                      </h3>
                      <p className={`text-[10px] font-sans mt-0.5 ${isSelected ? "text-bg/80" : "text-text-muted group-hover:text-bg/80"}`}>
                        {business.area}
                      </p>
                    </div>
                  </div>

                  {/* Compare Checkbox Button */}
                  <button
                    onClick={(e) => onToggleCompare(business, e)}
                    className={`w-7 h-7 rounded-none flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                      isInCompare
                        ? "bg-teal border-teal text-slate-950 hover:bg-teal-600 hover:border-teal-600"
                        : isSelected
                        ? "bg-bg border-border text-text hover:bg-bg/95"
                        : "bg-surface border-border text-text-muted hover:border-amber hover:text-amber group-hover:border-bg group-hover:text-bg"
                    }`}
                    title={isInCompare ? "Remove from comparison shortlist" : "Add to comparison shortlist"}
                    id={`btn-compare-${business.id}`}
                  >
                    {isInCompare ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Card Footer: Metadata Grid */}
                <div className={`pt-2.5 border-t flex items-center justify-between text-[10px] font-mono tracking-tight ${isSelected ? "border-bg/25" : "border-border/40"}`} id="card-footer-row">
                  {/* Google Ratings */}
                  <div className="flex items-center gap-1" title="Google Maps Rating" id="footer-rating">
                    <Star className={`w-3 h-3 ${isSelected ? "fill-bg text-bg" : "fill-amber text-amber"}`} />
                    <span className={`font-bold ${isSelected ? "text-bg" : "text-text group-hover:text-bg"}`}>{business.rating || "N/A"}★</span>
                    <span className={isSelected ? "text-bg/60" : "text-text-muted group-hover:text-bg/60"}>({business.reviewCount})</span>
                  </div>

                  {/* Web presence status indicator */}
                  <div className="flex items-center gap-1" id="footer-web-indicator">
                    <Globe className={`w-3 h-3 ${isSelected ? "text-bg" : business.websiteStatus === "YES" ? "text-blue" : "text-red"}`} />
                    <span className={`uppercase font-bold ${isSelected ? "text-bg" : business.websiteStatus === "YES" ? "text-text group-hover:text-bg" : "text-red"}`}>
                      {business.websiteStatus === "YES" ? "Website" : "No Web"}
                    </span>
                  </div>

                  {/* Price Level */}
                  <div className={isSelected ? "text-bg/80" : "text-text-muted group-hover:text-bg/80"} id="footer-price">
                    <span>Price: <span className={`font-bold ${isSelected ? "text-bg" : "text-text group-hover:text-bg"}`}>{business.priceLevel || "N/A"}</span></span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
