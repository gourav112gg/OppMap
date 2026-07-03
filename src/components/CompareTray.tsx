import React from "react";
import { Sparkles, Trash2, ArrowRight, X } from "lucide-react";
import { SeededBusiness } from "../data/bathinda_seeded";

interface CompareTrayProps {
  compareList: SeededBusiness[];
  onRemove: (business: SeededBusiness) => void;
  onClear: () => void;
  onGenerateReport: () => void;
}

export default function CompareTray({
  compareList,
  onRemove,
  onClear,
  onGenerateReport,
}: CompareTrayProps) {
  if (compareList.length === 0) return null;

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[1050] w-full max-w-3xl px-4 animate-in fade-in slide-in-from-bottom-4 duration-300"
      id="compare-tray-capsule-wrapper"
    >
      <div
        className="bg-surface border-2 border-border p-4 rounded-none shadow-none flex flex-col md:flex-row items-center justify-between gap-4 text-text"
        id="compare-tray"
      >
        {/* Selection Stats */}
        <div className="flex items-center gap-3 w-full md:w-auto" id="tray-stats-container">
          <div className="bg-text p-1.5 rounded-none text-bg shrink-0 border border-border" id="tray-icon-box">
            <Sparkles className="w-4 h-4 text-amber" />
          </div>
          <div>
            <h4 className="font-mono font-bold text-xs uppercase tracking-wider text-text">
              Compare Shortlist
            </h4>
            <p className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
              {compareList.length} business{compareList.length > 1 ? "es" : ""} staged for pitch report
            </p>
          </div>
        </div>

        {/* Selected List Pills (Scrollable) */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full md:max-w-md py-1" id="tray-selected-scroll-container">
          {compareList.map((business) => (
            <div
              key={business.id}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-none bg-surface-2 border border-border text-[10px] text-text shrink-0 font-mono uppercase tracking-wider"
              id={`pill-compare-${business.id}`}
            >
              <span className="truncate max-w-[110px] font-bold">{business.name}</span>
              <button
                onClick={() => onRemove(business)}
                className="hover:text-red p-0.5 rounded-none transition-colors cursor-pointer"
                title={`Remove ${business.name}`}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 justify-end" id="tray-action-buttons">
          <button
            onClick={onClear}
            className="px-3 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-text-muted hover:text-red flex items-center gap-1 transition-colors cursor-pointer"
            id="btn-tray-clear-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>

          <button
            onClick={onGenerateReport}
            disabled={compareList.length < 1}
            className="px-4 py-2 bg-teal disabled:bg-surface-2 disabled:text-text-muted disabled:border-border disabled:cursor-not-allowed border border-border text-slate-950 font-bold text-[10px] font-mono uppercase tracking-widest rounded-none flex items-center gap-1.5 transition-all cursor-pointer hover:bg-teal-600"
            id="btn-tray-generate-report"
          >
            <span>Analyze & Compare</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
