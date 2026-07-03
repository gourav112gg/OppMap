import { SeededBusiness } from "../data/bathinda_seeded";

export interface AuditReport {
  totalChecked: number;
  anomaliesDetected: number;
  errors: string[];
  warnings: string[];
}

/**
 * Diagnostic utility function to audit the F&B prospects dataset
 * for missing critical attributes, invalid values, and schema non-conformance.
 */
export function auditProspectDataset(businesses: SeededBusiness[]): AuditReport {
  const report: AuditReport = {
    totalChecked: businesses.length,
    anomaliesDetected: 0,
    errors: [],
    warnings: [],
  };

  businesses.forEach((business, index) => {
    const label = `"${business.name || 'Unnamed'}" (ID: ${business.id || 'N/A'}, index: ${index})`;
    let businessHasIssues = false;

    // 1. Critical Errors (Data that would break map/UI rendering or categorization)
    if (!business.id) {
      report.errors.push(`CRITICAL ERROR: Missing unique 'id' in record at index ${index}.`);
      businessHasIssues = true;
    }
    
    if (!business.name || business.name.trim() === "") {
      report.errors.push(`CRITICAL ERROR: Missing 'name' for ID: ${business.id || index}.`);
      businessHasIssues = true;
    }

    if (!business.category) {
      report.errors.push(`CRITICAL ERROR: Missing 'category' in ${label}.`);
      businessHasIssues = true;
    } else if (!["Cafe", "Restaurant", "Dhaba"].includes(business.category)) {
      report.errors.push(`CRITICAL ERROR: Invalid category '${business.category}' in ${label}. Allowed: Cafe, Restaurant, Dhaba.`);
      businessHasIssues = true;
    }

    if (!business.area || business.area.trim() === "") {
      report.errors.push(`CRITICAL ERROR: Missing 'area' in ${label}.`);
      businessHasIssues = true;
    }

    if (typeof business.lat !== "number" || isNaN(business.lat) || business.lat === 0) {
      report.errors.push(`CRITICAL ERROR: Missing or invalid latitude '${business.lat}' in ${label}.`);
      businessHasIssues = true;
    }

    if (typeof business.lng !== "number" || isNaN(business.lng) || business.lng === 0) {
      report.errors.push(`CRITICAL ERROR: Missing or invalid longitude '${business.lng}' in ${label}.`);
      businessHasIssues = true;
    }

    // 2. High Priority Warnings (Information gap that reduces intelligence rating quality)
    if (!business.phone || business.phone.trim() === "") {
      report.warnings.push(`WARNING: Missing direct 'phone' contact for ${label}.`);
      businessHasIssues = true;
    }

    if (!business.hours || business.hours.trim() === "") {
      report.warnings.push(`WARNING: Incomplete operating 'hours' timing for ${label}.`);
      businessHasIssues = true;
    }

    if (business.rating !== null && (business.rating < 0 || business.rating > 5)) {
      report.warnings.push(`WARNING: Out-of-bounds average 'rating' value (${business.rating}) for ${label}.`);
      businessHasIssues = true;
    }

    if (!business.websiteStatus) {
      report.warnings.push(`WARNING: Missing 'websiteStatus' state for ${label}.`);
      businessHasIssues = true;
    } else if (business.websiteStatus === "YES" && (!business.websiteUrl || business.websiteUrl.trim() === "")) {
      report.warnings.push(`WARNING: 'websiteStatus' is YES but 'websiteUrl' is empty for ${label}.`);
      businessHasIssues = true;
    }

    if (business.reviewCount < 0 || typeof business.reviewCount !== "number") {
      report.warnings.push(`WARNING: Invalid reviewCount (${business.reviewCount}) for ${label}.`);
      businessHasIssues = true;
    }

    if (businessHasIssues) {
      report.anomaliesDetected++;
    }
  });

  return report;
}

/**
 * Executes the diagnostics and outputs a styled report in the web console.
 */
export function runConsoleDiagnostics(businesses: SeededBusiness[]): void {
  const report = auditProspectDataset(businesses);

  console.groupCollapsed(
    `🔍 F&B PROSPECT DATASET DIAGNOSTIC REPORT: ${report.anomaliesDetected} / ${report.totalChecked} records with issues`
  );

  console.log(`%cTotal Prospects Checked: ${report.totalChecked}`, "font-weight: bold; color: #3b82f6;");
  console.log(`%cAnomalies Detected: ${report.anomaliesDetected}`, `font-weight: bold; color: ${report.anomaliesDetected > 0 ? '#f59e0b' : '#10b981'};`);

  if (report.errors.length > 0) {
    console.group(`❌ Critical Configuration Errors (${report.errors.length})`);
    report.errors.forEach((err) => console.error(err));
    console.groupEnd();
  } else {
    console.log("%c✓ Zero critical schema errors detected.", "color: #10b981; font-weight: bold;");
  }

  if (report.warnings.length > 0) {
    console.group(`⚠ Optimization Warnings (${report.warnings.length})`);
    report.warnings.forEach((warn) => console.warn(warn));
    console.groupEnd();
  } else {
    console.log("%c✓ Zero optimization Warnings detected. Dataset is fully populated!", "color: #10b981; font-weight: bold;");
  }

  console.groupEnd();
}
