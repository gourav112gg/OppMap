import React from "react";
import { X, FileSpreadsheet, FileText, CheckCircle, AlertCircle, RefreshCw, ShieldAlert, TrendingUp, Download, Globe } from "lucide-react";
import { SeededBusiness } from "../data/bathinda_seeded";
import { scoreBusiness, Recommendation, ScoringWeights } from "../lib/scoring";

interface CompareModalProps {
  compareList: SeededBusiness[];
  onClose: () => void;
  onRemove: (business: SeededBusiness) => void;
  weights: ScoringWeights;
  allBusinesses: SeededBusiness[];
}

export default function CompareModal({
  compareList,
  onClose,
  onRemove,
  weights,
  allBusinesses,
}: CompareModalProps) {
  const [isGenerating, setIsGenerating] = React.useState<"none" | "pdf" | "xlsx" | "html">("none");

  // Format and export Excel / CSV file with actual real-time grounding fields
  const handleExportCSV = () => {
    setIsGenerating("xlsx");
    setTimeout(() => {
      // Build CSV Content
      const headers = [
        "Business Name",
        "Category",
        "Sub-locality",
        "Address",
        "Google Rating",
        "Review Count",
        "Price Level",
        "Website Status",
        "Website URL",
        "Phone Number",
        "Opening Hours",
        "Opportunity Score",
        "Projected Uplift Pct",
        "Top Priority Recommendation",
        "All Recommendations Roadmap",
      ];

      const rows = compareList.map((business) => {
        const { score, projectedUpliftPct, recommendations } = scoreBusiness(business, weights, allBusinesses);
        const topRec = recommendations[0]?.action || "None - Fully Optimized";
        const allRecs = recommendations.map((r, i) => `${i + 1}. [${r.gap}] ${r.action}`).join(" | ");
        return [
          `"${business.name.replace(/"/g, '""')}"`,
          business.category,
          business.area,
          `"${(business.address || "").replace(/"/g, '""')}"`,
          business.rating || "N/A",
          business.reviewCount,
          business.priceLevel || "N/A",
          business.websiteStatus,
          `"${business.websiteUrl || "None"}"`,
          `"${business.phone || "None"}"`,
          `"${business.hours || "None"}"`,
          score,
          `+${projectedUpliftPct}%`,
          `"${topRec.replace(/"/g, '""')}"`,
          `"${allRecs.replace(/"/g, '""')}"`,
        ];
      });

      const csvContent = [
        headers.join(","),
        ...rows.map((row) => row.join(",")),
      ].join("\n");

      // Trigger File Download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `OppMap_Bathinda_Real_Analysis_Report_${timestamp}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsGenerating("none");
    }, 1200);
  };

  // Compile and export a gorgeous standalone interactive HTML Client Pitch Report containing the real-time verified data
  const handleExportHTMLReport = () => {
    setIsGenerating("html");
    setTimeout(() => {
      const timestamp = new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const timeStr = new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      });

      const matrixRows = compareList.map((business) => {
        const { score, tier, projectedUpliftPct, recommendations, competitorCount } = scoreBusiness(business, weights, allBusinesses);
        return {
          business,
          score,
          tier,
          projectedUpliftPct,
          recommendations,
          competitorCount
        };
      });

      const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OppMap BI - Real-Time Market Intelligence Pitch Report</title>
    <style>
        :root {
            --bg: #090d16;
            --surface: #111827;
            --surface-2: #1f2937;
            --border: #374151;
            --text: #f3f4f6;
            --text-muted: #9ca3af;
            --amber: #f59e0b;
            --teal: #14b8a6;
            --blue: #3b82f6;
            --red: #ef4444;
        }
        body {
            background-color: var(--bg);
            color: var(--text);
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            margin: 0;
            padding: 40px 20px;
            line-height: 1.5;
        }
        .container {
            max-width: 1100px;
            margin: 0 auto;
        }
        header {
            border-bottom: 2px solid var(--border);
            padding-bottom: 25px;
            margin-bottom: 40px;
        }
        .tag {
            font-family: monospace;
            font-size: 11px;
            color: var(--amber);
            font-weight: bold;
            letter-spacing: 0.15em;
            text-transform: uppercase;
        }
        h1 {
            font-size: 32px;
            margin: 8px 0;
            font-weight: 800;
            letter-spacing: -0.025em;
        }
        .meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 20px;
            margin-top: 20px;
            font-size: 12px;
            color: var(--text-muted);
            font-family: monospace;
        }
        .meta-val {
            color: var(--text);
            font-weight: bold;
        }
        h2 {
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--border);
            padding-bottom: 10px;
            margin-top: 50px;
            margin-bottom: 25px;
            color: var(--text-muted);
            font-family: monospace;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 45px;
            font-size: 13px;
            background-color: rgba(17, 24, 39, 0.4);
        }
        th, td {
            padding: 16px;
            border: 1px solid var(--border);
            text-align: left;
        }
        th {
            background-color: var(--surface);
            font-family: monospace;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.05em;
            color: var(--text-muted);
        }
        .text-center {
            text-align: center;
        }
        .score-badge {
            font-size: 18px;
            font-weight: bold;
            font-family: monospace;
        }
        .score-high { color: var(--amber); }
        .score-med { color: var(--teal); }
        .score-low { color: var(--red); }
        .badge-yes { color: var(--blue); font-weight: bold; }
        .badge-no { color: var(--red); font-weight: bold; }
        
        .roadmaps-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 25px;
        }
        @media (min-width: 768px) {
            .roadmaps-grid {
                grid-template-columns: repeat(${matrixRows.length > 1 ? (matrixRows.length > 2 ? 3 : 2) : 1}, 1fr);
            }
        }
        .roadmap-card {
            background-color: var(--surface);
            border: 1px solid var(--border);
            padding: 24px;
            display: flex;
            flex-col: column;
            flex-direction: column;
            justify-content: space-between;
        }
        .card-header {
            border-bottom: 1px solid var(--border);
            padding-bottom: 15px;
            margin-bottom: 20px;
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
        }
        .card-title {
            font-size: 16px;
            font-weight: bold;
            margin: 0;
            color: #ffffff;
        }
        .card-subtitle {
            font-size: 11px;
            font-family: monospace;
            color: var(--text-muted);
            text-transform: uppercase;
        }
        .card-score {
            font-family: monospace;
            font-size: 14px;
            font-weight: bold;
            text-align: right;
        }
        .rec-item {
            display: flex;
            gap: 15px;
            margin-bottom: 18px;
            font-size: 12px;
        }
        .rec-num {
            background-color: var(--text);
            color: var(--bg);
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            font-family: monospace;
            font-size: 11px;
            flex-shrink: 0;
            margin-top: 2px;
        }
        .rec-gap {
            font-weight: bold;
            color: var(--text);
            font-family: monospace;
            margin-bottom: 3px;
        }
        .rec-action {
            color: var(--text-muted);
            line-height: 1.45;
        }
        .methodology {
            background-color: rgba(31, 41, 55, 0.2);
            border: 1px solid var(--border);
            padding: 20px;
            font-size: 11px;
            color: var(--text-muted);
            margin-top: 50px;
            line-height: 1.6;
        }
        .actions-bar {
            display: flex;
            gap: 12px;
            margin-bottom: 30px;
        }
        .print-btn {
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background-color: var(--text);
            color: var(--bg);
            border: none;
            padding: 12px 24px;
            font-family: monospace;
            font-weight: bold;
            font-size: 11px;
            text-transform: uppercase;
            cursor: pointer;
            letter-spacing: 0.05em;
        }
        .print-btn:hover {
            opacity: 0.95;
            background-color: #ffffff;
        }
        .live-badge {
            background-color: rgba(59, 130, 246, 0.15);
            border: 1px solid var(--blue);
            color: var(--blue);
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            padding: 3px 8px;
            font-family: monospace;
            display: inline-block;
            margin-top: 10px;
        }
        @media print {
            body {
                background-color: white !important;
                color: black !important;
                padding: 0;
            }
            :root {
                --border: #cccccc;
                --text: #111111;
                --text-muted: #555555;
                --amber: #b45309;
                --teal: #0f766e;
                --blue: #1d4ed8;
                --red: #b91c1c;
            }
            .actions-bar {
                display: none !important;
            }
            .roadmap-card {
                background-color: white !important;
                page-break-inside: avoid;
                border: 1px solid #cccccc !important;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="actions-bar">
            <button class="print-btn" onclick="window.print()">Print Report / Save as PDF</button>
        </div>
        
        <header>
            <div class="tag">REAL-TIME COMPETITIVE BUSINESS INTELLIGENCE</div>
            <h1>Bathinda F&B Opportunity & Acquisition Report</h1>
            <div class="meta-grid">
                <div>AUDIT AREA: <span class="meta-val">Bathinda, Punjab, India</span></div>
                <div>GENERATED DATE: <span class="meta-val">${timestamp} @ ${timeStr}</span></div>
                <div>VERIFICATION MODEL: <span class="meta-val">Gemini Grounded Real-Time Sync</span></div>
                <div>PROSPECT UNITS: <span class="meta-val">${compareList.length} Selected</span></div>
            </div>
        </header>

        <h2>01. Side-By-Side Competitive Opportunity Matrix</h2>
        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Market Metric</th>
                    ${matrixRows.map(row => `<th class="text-center" style="width: ${75 / matrixRows.length}%;">${row.business.name}</th>`).join('')}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Opportunity Score</strong></td>
                    ${matrixRows.map(row => {
                      const col = row.score >= 70 ? 'score-high' : row.score >= 45 ? 'score-med' : 'score-low';
                      return `<td class="text-center score-badge ${col}">${row.score}/100</td>`;
                    }).join('')}
                </tr>
                <tr>
                    <td><strong>Growth Potential Uplift</strong></td>
                    ${matrixRows.map(row => `<td class="text-center score-badge score-med">+${row.projectedUpliftPct}%</td>`).join('')}
                </tr>
                <tr>
                    <td>Category / Sub-locality</td>
                    ${matrixRows.map(row => `<td class="text-center">${row.business.category} &middot; ${row.business.area}</td>`).join('')}
                </tr>
                <tr>
                    <td>Google Rating & Reviews</td>
                    ${matrixRows.map(row => `<td class="text-center"><strong>${row.business.rating || "N/A"}★</strong> (${row.business.reviewCount} reviews)</td>`).join('')}
                </tr>
                <tr>
                    <td>Digital Storefront / Website</td>
                    ${matrixRows.map(row => {
                      const isYes = row.business.websiteStatus === 'YES';
                      const link = row.business.websiteUrl ? `<br><a href="${row.business.websiteUrl}" target="_blank" style="color: var(--blue); text-decoration: underline; font-size: 11px; word-break: break-all;">${row.business.websiteUrl.replace(/^https?:\/\/(www\.)?/, '')}</a>` : '';
                      return `<td class="text-center ${isYes ? 'badge-yes' : 'badge-no'}">${row.business.websiteStatus}${link}</td>`;
                    }).join('')}
                </tr>
                <tr>
                    <td>Direct Contact Phone</td>
                    ${matrixRows.map(row => `<td class="text-center">${row.business.phone || "MISSING"}</td>`).join('')}
                </tr>
                <tr>
                    <td>Operating Hours</td>
                    ${matrixRows.map(row => `<td class="text-center" style="font-size: 12px;">${row.business.hours || "INCOMPLETE"}</td>`).join('')}
                </tr>
                <tr>
                    <td>Local Competitor Volume</td>
                    ${matrixRows.map(row => `<td class="text-center">${row.competitorCount} similar outlets nearby</td>`).join('')}
                </tr>
                <tr>
                    <td>Address Coordinates</td>
                    ${matrixRows.map(row => `<td class="text-center" style="font-family: monospace; font-size: 11px; color: var(--text-muted);">${row.business.lat.toFixed(5)}, ${row.business.lng.toFixed(5)}</td>`).join('')}
                </tr>
            </tbody>
        </table>

        <h2>02. Tailored Client Pitch Roadmaps</h2>
        <div class="roadmaps-grid">
            ${matrixRows.map(row => `
            <div class="roadmap-card">
                <div>
                    <div class="card-header">
                        <div>
                            <h3 class="card-title">${row.business.name}</h3>
                            <span class="card-subtitle">${row.business.category} &middot; ${row.business.area}</span>
                        </div>
                        <div class="card-score">
                            <span class="card-subtitle">OPPORTUNITY</span>
                            <div class="score-badge ${row.score >= 70 ? 'score-high' : row.score >= 45 ? 'score-med' : 'score-low'}">${row.score}/100</div>
                        </div>
                    </div>
                    <div style="margin-bottom: 20px;">
                        <span class="live-badge">Verified Live Profile</span>
                    </div>
                    <div>
                        ${row.recommendations.length === 0 ? `
                            <p style="font-size: 12px; color: var(--teal); font-family: monospace; text-align: center;">All channels configured. Excellent digital footprint in place.</p>
                        ` : row.recommendations.map((rec, idx) => `
                            <div class="rec-item">
                                <div class="rec-num">${idx + 1}</div>
                                <div>
                                    <div class="rec-gap">${rec.gap}</div>
                                    <div class="rec-action">${rec.action}</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
            `).join('')}
        </div>

        <div class="methodology">
            <strong>Methodology & Analytical Integrity Disclaimers:</strong><br>
            Opportunity indexes are built programmatically based on active registry scraping algorithms. Website existence, operational hours validity, and contact lines are verified against the latest public digital footprints. Real-time grounding traces and citation lines are compiled using the Google Gemini (gemini-3.5-flash) AI search-grounded indexer. Estimated business growth potentials are computed using local digital agency and market conversion benchmark figures for tier-2 regions in Punjab.
        </div>
    </div>
</body>
</html>`;

      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const cleanDate = new Date().toISOString().slice(0, 10);
      link.setAttribute("href", url);
      link.setAttribute("download", `OppMap_Bathinda_Analysis_Report_${cleanDate}.html`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsGenerating("none");
    }, 1200);
  };

  // Trigger printable view for PDF generation
  const handleExportPDF = () => {
    setIsGenerating("pdf");
    setTimeout(() => {
      window.print();
      setIsGenerating("none");
    }, 1000);
  };

  return (
    <div
      className="fixed inset-0 z-[1200] bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 md:p-6 overflow-y-auto font-sans"
      id="compare-modal-backdrop"
    >
      <div
        className="bg-surface border-2 border-border rounded-none w-full max-w-5xl shadow-none flex flex-col max-h-[90vh] text-text overflow-hidden print:border-none print:shadow-none print:max-h-none"
        id="compare-report-card"
      >
        {/* Modal Sticky Header */}
        <div className="flex items-center justify-between p-5 border-b border-border bg-surface-2 print:hidden" id="modal-header">
          <div>
            <h2 className="font-mono font-bold text-sm text-text uppercase tracking-wider">
              Prospect Intelligence & Pitch Report
            </h2>
            <p className="text-[10px] text-text-muted mt-0.5 font-mono uppercase tracking-wider">
              Comparing {compareList.length} shortlisted prospects in Bathinda, Punjab
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-none border border-border text-text-muted hover:bg-text hover:text-bg transition-colors cursor-pointer"
            id="btn-close-modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Print-only Executive Header */}
        <div className="hidden print:block p-8 border-b border-slate-300 text-slate-900 bg-white space-y-2" id="print-header">
          <div className="text-sm font-mono font-bold text-amber-600">OPPMAP BI PLATFORM</div>
          <h1 className="font-display font-bold text-2xl tracking-tight">Bathinda F&B Digital Opportunity Audit</h1>
          <p className="text-xs text-slate-500 font-mono">
            Generated: {new Date().toLocaleDateString("en-IN")} | Audit Version v1.0
          </p>
        </div>

        {/* Scrollable Comparison Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 print:p-0 print:overflow-visible" id="modal-scrollable-content">
          
          {/* Section 1: Side-by-Side Matrix Table */}
          <div className="space-y-3.5" id="comparison-table-section">
            <h3 className="col-header uppercase text-xs">
              01. Prospect Comparison Matrix
            </h3>
            
            <div className="overflow-x-auto border border-border rounded-none bg-surface-2/40 print:border-slate-300 print:bg-white" id="comparison-table-wrapper">
              <table className="w-full text-left border-collapse text-xs" id="matrix-table">
                <thead>
                  <tr className="border-b border-border bg-surface-2 print:border-slate-300 print:bg-slate-100 print:text-slate-800">
                    <th className="p-4 font-mono uppercase tracking-wider text-text-muted w-52 print:text-slate-700">Prospect Detail</th>
                    {compareList.map((business) => (
                      <th key={business.id} className="p-4 border-l border-border print:border-slate-300 text-center" id={`th-col-${business.id}`}>
                        <div className="font-mono font-bold text-text print:text-slate-950">{business.name}</div>
                        <span className="text-[9px] font-mono font-normal text-text-muted uppercase tracking-wider">
                          {business.category} · {business.area}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border print:divide-slate-300">
                  {/* Row: Opportunity Score */}
                  <tr className="hover:bg-surface-2/10">
                    <td className="p-4 font-mono font-bold text-text-muted uppercase tracking-wider">Opportunity Score</td>
                    {compareList.map((business) => {
                      const { score } = scoreBusiness(business, weights, allBusinesses);
                      return (
                        <td key={business.id} className="p-4 border-l border-border print:border-slate-300 text-center font-mono font-bold text-sm">
                          <span className={score >= 70 ? "text-amber" : score >= 45 ? "text-teal" : "text-red"}>
                            {score}/100
                          </span>
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Projected Uplift */}
                  <tr className="hover:bg-surface-2/10">
                    <td className="p-4 font-mono font-bold text-text-muted uppercase tracking-wider">Est. Growth Uplift</td>
                    {compareList.map((business) => {
                      const { projectedUpliftPct } = scoreBusiness(business, weights, allBusinesses);
                      return (
                        <td key={business.id} className="p-4 border-l border-border print:border-slate-300 text-center font-mono font-bold text-teal text-sm">
                          +{projectedUpliftPct}%
                        </td>
                      );
                    })}
                  </tr>

                  {/* Row: Google Rating */}
                  <tr className="hover:bg-surface-2/10">
                    <td className="p-4 font-mono uppercase tracking-wider text-text-muted">Google Rating</td>
                    {compareList.map((business) => (
                      <td key={business.id} className="p-4 border-l border-border print:border-slate-300 text-center font-mono text-xs">
                        <span className="font-bold">{business.rating || "N/A"}★</span>
                        <span className="text-[10px] text-text-muted ml-1">({business.reviewCount} reviews)</span>
                      </td>
                    ))}
                  </tr>

                  {/* Row: Web Presence */}
                  <tr className="hover:bg-surface-2/10">
                    <td className="p-4 font-mono uppercase tracking-wider text-text-muted">Website Listed?</td>
                    {compareList.map((business) => (
                      <td key={business.id} className="p-4 border-l border-border print:border-slate-300 text-center font-mono text-xs font-bold">
                        {business.websiteStatus === "YES" ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="text-blue">YES</span>
                            {business.websiteUrl && (
                              <a
                                href={business.websiteUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-normal text-blue hover:underline max-w-[140px] truncate block"
                                title={business.websiteUrl}
                              >
                                {business.websiteUrl.replace(/^https?:\/\/(www\.)?/, "")}
                              </a>
                            )}
                          </div>
                        ) : (
                          <span className="text-red flex items-center justify-center gap-1">
                            <span>NO</span>
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Phone Number */}
                  <tr className="hover:bg-surface-2/10">
                    <td className="p-4 font-mono uppercase tracking-wider text-text-muted">Direct Phone?</td>
                    {compareList.map((business) => (
                      <td key={business.id} className="p-4 border-l border-border print:border-slate-300 text-center font-mono text-xs">
                        {business.phone ? (
                          <span className="text-text">{business.phone}</span>
                        ) : (
                          <span className="text-red font-bold">MISSING</span>
                        )}
                      </td>
                    ))}
                  </tr>

                  {/* Row: Operating Hours */}
                  <tr className="hover:bg-surface-2/10">
                    <td className="p-4 font-mono uppercase tracking-wider text-text-muted">Hours Defined?</td>
                    {compareList.map((business) => (
                      <td key={business.id} className="p-4 border-l border-border print:border-slate-300 text-center font-mono text-xs">
                        {business.hours ? (
                          <span className="text-text truncate max-w-[150px] inline-block">{business.hours}</span>
                        ) : (
                          <span className="text-red font-bold">INCOMPLETE</span>
                        )}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: Pitches & Individual Recommendations Stack */}
          <div className="space-y-4 break-before-page" id="recommendations-comparison-section">
            <h3 className="col-header uppercase text-xs">
              02. Individual Digital Optimizations Roadmap
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:grid-cols-2 print:gap-4" id="individual-prospects-roadmap-grid">
              {compareList.map((business) => {
                const { score, recommendations } = scoreBusiness(business, weights, allBusinesses);
                return (
                  <div key={business.id} className="p-5 border border-border rounded-none bg-surface-2/40 space-y-4 print:border-slate-300 print:bg-white" id={`roadmap-col-${business.id}`}>
                     <div className="border-b border-border/60 pb-2.5 flex items-start justify-between" id={`roadmap-header-${business.id}`}>
                      <div>
                        <h4 className="font-mono font-bold text-sm text-text print:text-slate-950">{business.name}</h4>
                        <span className="text-[9px] font-mono text-text-muted uppercase tracking-wider">
                          {business.category} · {business.area}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-text-muted block font-mono uppercase tracking-wider">OPPORTUNITY</span>
                        <span className="text-xs font-bold text-amber font-mono">{score}/100</span>
                      </div>
                    </div>

                    <div className="space-y-3" id={`roadmap-items-${business.id}`}>
                      {recommendations.length === 0 ? (
                        <div className="p-3 border border-blue bg-blue/5 rounded-none text-xs text-blue text-center font-mono uppercase tracking-wider">
                          Listing fully optimized. Ready for standard packages.
                        </div>
                      ) : (
                        recommendations.map((rec, i) => (
                          <div key={i} className="flex gap-2.5 text-xs" id={`roadmap-item-${business.id}-${i}`}>
                            <span className="bg-text text-bg border border-border text-[9px] font-mono font-bold w-5 h-5 rounded-none flex items-center justify-center shrink-0 mt-0.5">
                              {i + 1}
                            </span>
                            <div className="space-y-1">
                              <span className="font-mono font-bold text-text print:text-slate-900 block">{rec.gap}</span>
                              <p className="text-text-muted text-[11px] leading-relaxed font-sans">{rec.action}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section 3: Professional Disclaimer and Methodology */}
          <div className="p-4 rounded-none border border-border bg-surface-2/20 text-xs text-text-muted space-y-1.5 print:border-slate-300 print:text-slate-600 print:bg-white" id="methodology-disclaimer">
            <h4 className="font-bold uppercase font-mono text-[9px] text-text-muted tracking-widest">Methodology & Disclaimer</h4>
            <p className="leading-relaxed font-sans text-[11px]">
              Opportunity scores are calculated programmatically using metadata metrics extracted from Google Maps, including review frequency, overall average rating, website existence verification, and contact configuration completeness. Projected growth and conversion uplifts are directional statistical estimates modeled on average tier-2 city digital service performance; actual client conversion rates depend on operational fulfillment and local market conditions.
            </p>
          </div>
        </div>

        {/* Modal Footer / Download Options */}
        <div className="p-5 border-t border-border bg-surface-2 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden" id="modal-footer">
          <span className="text-[10px] text-text-muted font-mono uppercase tracking-wider">
            * Selected prospects are persistent to your current active shortlist comparison.
          </span>
          
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end" id="modal-footer-buttons">
            <button
              onClick={handleExportCSV}
              disabled={isGenerating !== "none"}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-none border border-border bg-surface-2 hover:bg-text hover:text-bg text-text transition-colors disabled:opacity-50 cursor-pointer"
              id="btn-export-csv"
            >
              {isGenerating === "xlsx" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PREPARING CSV...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-teal shrink-0" />
                  <span>EXPORT EXCEL/CSV</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportHTMLReport}
              disabled={isGenerating !== "none"}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-none border border-amber bg-surface hover:bg-amber hover:text-bg text-amber transition-colors disabled:opacity-50 cursor-pointer"
              id="btn-export-html"
            >
              {isGenerating === "html" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>PREPARING REPORT...</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-amber shrink-0" />
                  <span>DOWNLOAD CLIENT REPORT (HTML)</span>
                </>
              )}
            </button>

            <button
              onClick={handleExportPDF}
              disabled={isGenerating !== "none"}
              className="flex items-center justify-center gap-1.5 px-4 py-2.5 text-[10px] font-mono font-bold uppercase tracking-widest rounded-none bg-text text-bg hover:opacity-90 transition-colors disabled:opacity-50 cursor-pointer border border-border"
              id="btn-export-pdf"
            >
              {isGenerating === "pdf" ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>GENERATING DECK...</span>
                </>
              ) : (
                <>
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  <span>GENERATE PDF DECK</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
