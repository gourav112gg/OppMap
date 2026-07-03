import React from "react";
import { X, Star, Globe, Phone, Clock, MapPin, ArrowUpRight, TrendingUp, Check, Plus, AlertTriangle, ShieldCheck, Users } from "lucide-react";
import { SeededBusiness } from "../data/bathinda_seeded";
import { scoreBusiness, OpportunityTier, ScoringWeights } from "../lib/scoring";

interface BusinessDetailProps {
  business: SeededBusiness | null;
  onClose: () => void;
  compareList: SeededBusiness[];
  onToggleCompare: (business: SeededBusiness, e: React.MouseEvent) => void;
  weights: ScoringWeights;
  allBusinesses: SeededBusiness[];
  onEnrich: (businessId: string) => Promise<void>;
  isEnriching: boolean;
  lastSources?: string[];
}

export default function BusinessDetail({
  business,
  onClose,
  compareList,
  onToggleCompare,
  weights,
  allBusinesses,
  onEnrich,
  isEnriching,
  lastSources = [],
}: BusinessDetailProps) {
  if (!business) return null;

  const {
    score,
    tier,
    recommendations,
    explanation,
    projectedUpliftPct,
    competitorCount,
    marketDensityStatus,
    confidenceScore,
  } = scoreBusiness(business, weights, allBusinesses);
  const isInCompare = compareList.some((b) => b.id === business.id);

  // Styling helper for score coloring
  const getScoreColorClass = (score: number) => {
    if (score >= 70) return "text-amber border-amber bg-amber/5";
    if (score >= 45) return "text-teal border-teal bg-teal/5";
    return "text-red border-red bg-red/5";
  };

  const getTierLabel = (tier: OpportunityTier) => {
    switch (tier) {
      case "HIGH":
        return "HIGH ACQUISITION OPPORTUNITY";
      case "MEDIUM":
        return "MEDIUM ACQUISITION OPPORTUNITY";
      case "LOW":
        return "LOW ACQUISITION OPPORTUNITY";
      case "HAS_WEBSITE":
        return "ESTABLISHED WEB PRESENCE";
      default:
        return "AUDIT PROGRESS";
    }
  };

  return (
    <div
      className="fixed inset-y-0 right-0 z-[1100] w-full max-w-lg bg-surface border-l border-border shadow-none flex flex-col font-sans transition-all duration-300 transform translate-x-0"
      id="business-detail-container"
    >
      {/* Detail Panel Header */}
      <div className="flex items-center justify-between p-5 border-b border-border bg-surface-2" id="detail-header-row">
        <div>
          <span className="text-[10px] font-bold tracking-widest text-amber uppercase font-mono">
            OPPMAP PROSPECT INTEL
          </span>
          <h2 className="font-mono font-bold text-lg text-text leading-tight tracking-tight mt-0.5">
            {business.name}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-none border border-border text-text-muted hover:bg-text hover:text-bg transition-colors cursor-pointer"
          id="btn-close-detail"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Audit Body */}
      <div className="flex-1 overflow-y-auto p-5 space-y-6" id="detail-scrollable-body">
        
        {/* Core Opportunity Stat Board */}
        <div className="grid grid-cols-2 gap-3" id="stat-board-grid">
          {/* Radial score box */}
          <div className={`p-4 rounded-none border flex flex-col items-center justify-center text-center ${getScoreColorClass(score)}`} id="stat-box-score">
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Opportunity Score</span>
            <div className="text-3xl font-bold mt-1 font-mono flex items-baseline">
              <span>{score}</span>
              <span className="text-[10px] text-text-muted font-normal">/100</span>
            </div>
            <div className="text-[9px] font-bold font-mono tracking-wider mt-1.5 opacity-90 uppercase border-t border-border/25 pt-1 w-full text-center">
              {getTierLabel(tier)}
            </div>
          </div>

          {/* Projected Growth box */}
          <div className="p-4 rounded-none border border-border bg-surface-2 flex flex-col items-center justify-center text-center" id="stat-box-uplift">
            <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">Projected Uplift</span>
            <div className="text-3xl font-bold mt-1 text-teal flex items-center justify-center font-mono">
              <TrendingUp className="w-5 h-5 mr-1 shrink-0" />
              <span>+{projectedUpliftPct}%</span>
            </div>
            <div className="text-[9px] font-bold font-mono tracking-wider mt-1.5 text-text-muted uppercase border-t border-border/25 pt-1 w-full text-center">
              EST. GROWTH GAIN
            </div>
          </div>
        </div>

        {/* Real-time Web Search Grounding trigger - Disabled/Hidden for isolation
        <div className="p-4 bg-blue/5 border border-blue/20 flex flex-col gap-2.5 rounded-none" id="realtime-web-intel-sync-box">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-blue font-bold font-mono text-[10px] uppercase tracking-wider">
              <Globe className="w-3.5 h-3.5 animate-pulse" />
              <span>Real-Time Web Verification</span>
            </div>
            <span className="text-[8px] bg-blue/10 text-blue px-1.5 py-0.5 border border-blue/30 font-mono uppercase tracking-wider">
              Search Grounded
            </span>
          </div>
          <p className="text-[11px] text-text-muted leading-relaxed font-sans">
            Verify, correct, and enrich this business's contact information, rating, and website URL live using Gemini Search Grounding.
          </p>

          <button
            disabled={isEnriching}
            onClick={() => onEnrich(business.id)}
            className="w-full py-2 bg-blue text-slate-950 font-bold font-mono text-[10px] uppercase tracking-wider rounded-none hover:bg-blue/90 transition-colors disabled:opacity-50 inline-flex items-center justify-center gap-1.5 cursor-pointer"
          >
            {isEnriching ? (
              <>
                <div className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                <span>Syncing Live Web Registry...</span>
              </>
            ) : (
              <>
                <Globe className="w-3.5 h-3.5" />
                <span>Verify & Sync Live Data</span>
              </>
            )}
          </button>

          {lastSources && lastSources.length > 0 && (
            <div className="mt-1 pt-2 border-t border-blue/20 flex flex-col gap-1 font-mono text-[9px] text-text-muted">
              <span className="uppercase text-blue/80 font-bold tracking-wider">Checked Citations:</span>
              <div className="flex flex-col gap-0.5 truncate">
                {lastSources.map((src, i) => (
                  <a
                    key={i}
                    href={src}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-blue hover:underline text-left truncate flex items-center gap-1"
                  >
                    <span>[{i + 1}]</span>
                    <span className="truncate">{src}</span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
        */}

        {/* Dynamic Market Satiation & Data Completeness Telemetry */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="telemetry-intel-board">
          <div className="p-3 border border-border bg-surface-2/40 flex items-center justify-between text-xs font-mono" id="market-density-intel">
            <div className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="text-text-muted text-[9px] uppercase tracking-wider">Local Rival Density</span>
            </div>
            <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase tracking-wider ${
              marketDensityStatus === "HIGH" 
                ? "bg-red/10 text-red border-red/40" 
                : marketDensityStatus === "MEDIUM" 
                ? "bg-amber/10 text-amber border-amber/40" 
                : "bg-teal/10 text-teal border-teal/40"
            }`}>
              {marketDensityStatus} ({competitorCount})
            </span>
          </div>

          <div className="p-3 border border-border bg-surface-2/40 flex items-center justify-between text-xs font-mono" id="data-quality-intel">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-text-muted shrink-0" />
              <span className="text-text-muted text-[9px] uppercase tracking-wider">Data Completeness</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-12 bg-border h-1 rounded-none overflow-hidden hidden sm:block">
                <div 
                  className={`h-full ${
                    confidenceScore >= 80 ? "bg-teal" : confidenceScore >= 50 ? "bg-amber" : "bg-red"
                  }`}
                  style={{ width: `${confidenceScore}%` }}
                />
              </div>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 border uppercase tracking-wider ${
                confidenceScore >= 80 
                  ? "bg-teal/10 text-teal border-teal/40" 
                  : confidenceScore >= 50 
                  ? "bg-amber/10 text-amber border-amber/40" 
                  : "bg-red/10 text-red border-red/40"
              }`}>
                {confidenceScore}%
              </span>
            </div>
          </div>
        </div>

        {/* Narrative / Audit Summary paragraph */}
        <div className="p-4 rounded-none border border-border bg-surface-2/60 relative overflow-hidden" id="audit-summary-narrative">
          <h4 className="col-header uppercase mb-2 tracking-wider flex items-center gap-1.5 border-none pb-0 text-xs">
            Audit Assessment
          </h4>
          <p className="text-xs text-text leading-relaxed font-sans">{explanation}</p>
        </div>

        {/* Actionable Recommendations List */}
        <div className="space-y-3" id="recommendations-block">
          <h4 className="col-header text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
            Prioritized Growth Roadmap ({recommendations.length} Gaps)
          </h4>
          
          {recommendations.length === 0 ? (
            <div className="p-4 rounded-none border border-blue bg-blue/5 text-center" id="no-gaps-state">
              <p className="text-xs text-blue font-mono uppercase font-bold tracking-wider">Listing Fully Optimized</p>
              <p className="text-xs text-text-muted mt-1 leading-relaxed">This business already maintains an active website and complete contact configurations.</p>
            </div>
          ) : (
            <div className="space-y-2.5" id="recommendations-list">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-3 rounded-none border border-border bg-surface-2 flex items-start gap-3 hover:bg-text hover:text-bg group/rec transition-colors" id={`rec-item-${idx}`}>
                  <div className="bg-text text-bg border border-border text-[10px] font-mono font-bold w-6 h-6 rounded-none flex items-center justify-center shrink-0 group-hover/rec:bg-bg group-hover/rec:text-text" id={`rec-points-${idx}`}>
                    +{rec.points}
                  </div>
                  <div className="space-y-1 flex-1" id={`rec-content-${idx}`}>
                    <div className="flex items-center gap-1.5 flex-wrap justify-between" id={`rec-meta-${idx}`}>
                      <h5 className="text-xs font-mono font-bold leading-tight group-hover/rec:text-bg">{rec.gap}</h5>
                      <span className="text-[8px] bg-surface border border-border text-teal px-1 rounded-none font-mono uppercase tracking-widest shrink-0">
                        {rec.impact}
                      </span>
                    </div>
                    <p className="text-[11px] text-text-muted group-hover/rec:text-bg/85 leading-relaxed font-sans">{rec.action}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Core Profile Details Grid (Address, Hours, Phone) */}
        <div className="space-y-3 pt-4 border-t border-border/60" id="profile-details-block">
          <h4 className="col-header text-xs font-mono font-bold text-text-muted uppercase tracking-wider">
            Google Maps Business Profile
          </h4>
          
          <div className="grid grid-cols-1 gap-2.5 text-xs text-text" id="details-fields">
            {/* Address */}
            <div className="flex items-start gap-2.5 p-3 rounded-none bg-surface-2/40 border border-border" id="detail-address">
              <MapPin className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] text-text-muted block font-mono uppercase tracking-wider">Full Address</span>
                <span className="text-xs">{business.address}</span>
              </div>
            </div>

            {/* Operating Hours */}
            <div className="flex items-start gap-2.5 p-3 rounded-none bg-surface-2/40 border border-border" id="detail-hours">
              <Clock className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] text-text-muted block font-mono uppercase tracking-wider">Business Hours</span>
                <span className="text-xs font-mono">{business.hours || "Not Specified / Incomplete"}</span>
              </div>
            </div>

            {/* Phone Number */}
            <div className="flex items-start gap-2.5 p-3 rounded-none bg-surface-2/40 border border-border" id="detail-phone">
              <Phone className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] text-text-muted block font-mono uppercase tracking-wider">Contact Phone</span>
                <span className="text-xs font-mono">{business.phone || "No Contact Number Available"}</span>
              </div>
            </div>

            {/* Website Link */}
            <div className="flex items-start gap-2.5 p-3 rounded-none bg-surface-2/40 border border-border" id="detail-website">
              <Globe className="w-3.5 h-3.5 text-text-muted shrink-0 mt-0.5" />
              <div>
                <span className="text-[9px] text-text-muted block font-mono uppercase tracking-wider">Official Website</span>
                {business.websiteUrl ? (
                  <a
                    href={business.websiteUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-blue hover:underline inline-flex items-center gap-0.5 font-mono"
                  >
                    <span>{business.websiteUrl}</span>
                    <ArrowUpRight className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-xs text-red font-mono font-medium">None Listed on Maps</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Detail Panel Footer / Shortlist Actions */}
      <div className="p-5 border-t border-border bg-surface-2 flex items-center justify-between" id="detail-footer-actions">
        <button
          onClick={(e) => onToggleCompare(business, e)}
          className={`w-full py-3 px-4 rounded-none flex items-center justify-center gap-2 font-mono font-bold text-xs uppercase tracking-widest border border-border transition-all cursor-pointer ${
            isInCompare
              ? "bg-teal text-slate-950 hover:bg-teal-600"
              : "bg-text text-bg hover:opacity-90"
          }`}
          id="btn-detail-compare-toggle"
        >
          {isInCompare ? (
            <>
              <Check className="w-4 h-4 stroke-[3]" />
              <span>STAGED FOR COMPARE</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>ADD TO SHORTLIST</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
