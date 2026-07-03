import { SeededBusiness } from "../data/bathinda_seeded";

export type OpportunityTier = "HIGH" | "MEDIUM" | "LOW" | "HAS_WEBSITE";

export interface Recommendation {
  gap: string;
  action: string;
  impact: string;
  points: number;
}

export interface ScoreOutput {
  score: number;
  tier: OpportunityTier;
  recommendations: Recommendation[];
  projectedUpliftPct: number;
  explanation: string;
  scoringVersion: string;
  competitorCount: number;
  marketDensityStatus: "HIGH" | "MEDIUM" | "LOW";
  confidenceScore: number;
}

export interface ScoringWeights {
  website: number;
  reviews: number;
  rating: number;
  phone: number;
  hours: number;
  enableCategorySmart: boolean;
  enableCompetitorDensity: boolean;
}

export const DEFAULT_WEIGHTS: ScoringWeights = {
  website: 40,
  reviews: 20,
  rating: 20,
  phone: 10,
  hours: 10,
  enableCategorySmart: true,
  enableCompetitorDensity: true,
};

export function scoreBusiness(
  business: SeededBusiness,
  weights: ScoringWeights = DEFAULT_WEIGHTS,
  allBusinesses: SeededBusiness[] = []
): ScoreOutput {
  const recommendations: Recommendation[] = [];
  let score = 0;
  let projectedUpliftPct = 0;

  // 1. Dynamic Market Density Calculation (Competitor Density)
  const localCompetitors = allBusinesses.filter(
    (b) =>
      b.id !== business.id &&
      b.area === business.area &&
      b.category === business.category
  );
  const competitorCount = localCompetitors.length;
  
  let marketDensityStatus: "HIGH" | "MEDIUM" | "LOW" = "LOW";
  if (competitorCount >= 4) {
    marketDensityStatus = "HIGH";
  } else if (competitorCount >= 2) {
    marketDensityStatus = "MEDIUM";
  }

  // 2. Category-Smart Weight Calibration (Consumer Intent Personalization)
  let wWebsite = weights.website;
  let wReviews = weights.reviews;
  let wRating = weights.rating;
  let wPhone = weights.phone;
  let wHours = weights.hours;

  if (weights.enableCategorySmart) {
    if (business.category === "Cafe") {
      // Cafes depend heavily on visual website & aesthetics (Instagram-ability) and rating
      wWebsite = Math.round(weights.website * 1.15);
      wRating = Math.round(weights.rating * 1.1);
      wPhone = Math.round(weights.phone * 0.7);
    } else if (business.category === "Dhaba") {
      // Dhabas depend heavily on phone orders, delivery coordination, and business hours
      wPhone = Math.round(weights.phone * 1.5);
      wHours = Math.round(weights.hours * 1.3);
      wWebsite = Math.round(weights.website * 0.8);
    } else if (business.category === "Restaurant") {
      // Restaurants have highly balanced needs but heavy emphasis on high volume reviews
      wReviews = Math.round(weights.reviews * 1.2);
    }

    // Normalize weights to ensure they don't exceed logical proportions
    const totalW = wWebsite + wReviews + wRating + wPhone + wHours;
    const targetW = weights.website + weights.reviews + weights.rating + weights.phone + weights.hours;
    wWebsite = Math.round((wWebsite / totalW) * targetW);
    wReviews = Math.round((wReviews / totalW) * targetW);
    wRating = Math.round((wRating / totalW) * targetW);
    wPhone = Math.round((wPhone / totalW) * targetW);
    wHours = Math.round((wHours / totalW) * targetW);
  }

  // 3. Website Status Gap
  if (business.websiteStatus === "NO") {
    score += wWebsite;
    projectedUpliftPct += 25;
    recommendations.push({
      gap: "No Web Presence",
      action: `Build a modern, mobile-friendly landing page optimized for ${business.category}-specific local search intent.`,
      impact: "Critical (+25% Conversion Uplift)",
      points: wWebsite,
    });
  } else if (business.websiteStatus === "UNKNOWN") {
    score += Math.round(wWebsite * 0.5);
    projectedUpliftPct += 12;
    recommendations.push({
      gap: "Unverified Web Presence",
      action: "Claim, verify, and hook your official website domain to your Google Business Profile.",
      impact: "Medium (+12% Visibility Increase)",
      points: Math.round(wWebsite * 0.5),
    });
  }

  // 4. Review Count Gap & Authority Index
  const reviewCount = business.reviewCount;
  if (reviewCount < 50) {
    score += wReviews;
    projectedUpliftPct += 18;
    recommendations.push({
      gap: "Critical Low Review Volume",
      action: "Install a contactless, table-top NFC/QR feedback trigger to accelerate customer reviews past the crucial 100+ baseline.",
      impact: "High (+18% SEO Local Pack Share)",
      points: wReviews,
    });
  } else if (reviewCount >= 50 && reviewCount < 150) {
    score += Math.round(wReviews * 0.75);
    projectedUpliftPct += 10;
    recommendations.push({
      gap: "Sub-optimal Trust Volume",
      action: "Automate SMS feedback follow-ups to consistently obtain 15+ fresh reviews monthly to stay relevant.",
      impact: "Medium (+10% Traffic Velocity)",
      points: Math.round(wReviews * 0.75),
    });
  } else if (reviewCount >= 150 && reviewCount < 300) {
    score += Math.round(wReviews * 0.4);
    projectedUpliftPct += 5;
    recommendations.push({
      gap: "Maturing Review Velocity",
      action: "Keep search ranking supremacy by replying to existing reviews within 48 hours to signal active service.",
      impact: "Low-Medium (+5% Local Rank Boost)",
      points: Math.round(wReviews * 0.4),
    });
  }

  // 5. Rating Quality & Sentiment Index
  const rating = business.rating || 0;
  if (rating > 0 && rating < 3.8) {
    score += wRating;
    projectedUpliftPct += 20;
    recommendations.push({
      gap: "Sub-Standard Customer Rating",
      action: "Identify and resolve service or food bottlenecks highlighted in recent 1-star reviews. Immediately recover average to 4.2+.",
      impact: "Critical (+20% Customer Retention)",
      points: wRating,
    });
  } else if (rating >= 3.8 && rating < 4.2) {
    score += Math.round(wRating * 0.6);
    projectedUpliftPct += 10;
    recommendations.push({
      gap: "Average Rating Ceiling",
      action: "Address friction points. Launch a satisfaction rescue campaign to move average rating into the premium 4.4+ tier.",
      impact: "Medium (+10% Acquisition Rate)",
      points: Math.round(wRating * 0.6),
    });
  } else if (rating >= 4.2 && rating < 4.5) {
    score += Math.round(wRating * 0.25);
    projectedUpliftPct += 4;
    recommendations.push({
      gap: "Dormant Local Leader",
      action: "Unlock premium local organic placement by proactively raising ratings past the 4.5★ elite filter.",
      impact: "Low (+4% Organic Impressions)",
      points: Math.round(wRating * 0.25),
    });
  }

  // 6. Direct Phone Contact Gap
  if (!business.phone) {
    score += wPhone;
    projectedUpliftPct += 6;
    recommendations.push({
      gap: "Missing Lead Capture Line",
      action: "Integrate a primary phone number with click-to-call active links in your listings to capture delivery inquiries.",
      impact: "Medium (+6% Direct Sales Volume)",
      points: wPhone,
    });
  }

  // 7. Hours Definition Gap
  if (!business.hours) {
    score += wHours;
    projectedUpliftPct += 6;
    recommendations.push({
      gap: "Incomplete Working Hours",
      action: "Set precise daily and holiday timings to eliminate customer frustration and prevent loss of hungry prospects.",
      impact: "Medium (+6% Footfall Conversion)",
      points: wHours,
    });
  }

  // 8. Dynamic Competitor Urgency Modifier (Accuracy Multiplier)
  if (weights.enableCompetitorDensity && marketDensityStatus === "HIGH" && business.websiteStatus === "NO") {
    // Under high local saturation, the urgency is highly heightened! Add +10 to score
    score += 10;
    projectedUpliftPct += 8;
    
    // Boost the primary website recommendation priority
    const webRec = recommendations.find(r => r.gap === "No Web Presence" || r.gap === "Unverified Web Presence");
    if (webRec) {
      webRec.gap = `Saturated Market Core Gap: ${webRec.gap}`;
      webRec.action = `CRITICAL: There are ${competitorCount} direct local competitors in ${business.area} area. Launching a high-speed mobile website is mandatory to stop losing customers to them.`;
      webRec.points += 10;
    }
  }

  // Bound score strictly between 0 and 100
  score = Math.min(100, Math.max(0, score));

  // 9. Calculate confidence (Data Quality) score
  let completePoints = 0;
  if (business.lat && business.lng && business.lat !== 0 && business.lng !== 0) {
    completePoints += 20;
  }
  if (business.category) {
    completePoints += 20;
  }
  if (business.area && business.area.trim() !== "") {
    completePoints += 15;
  }
  if (business.phone && business.phone.trim() !== "") {
    completePoints += 15;
  }
  if (business.hours && business.hours.trim() !== "") {
    completePoints += 15;
  }
  if (business.websiteStatus && business.websiteStatus !== "UNKNOWN") {
    completePoints += 15;
  }
  const confidenceScore = completePoints;

  // Determine Tier based on calibrated score
  let tier: OpportunityTier = "LOW";
  if (business.websiteStatus === "YES") {
    tier = "HAS_WEBSITE";
  } else if (score >= 70) {
    tier = "HIGH";
  } else if (score >= 45) {
    tier = "MEDIUM";
  } else {
    tier = "LOW";
  }

  // Generate localized plain-language strategic evaluation
  let explanation = "";
  if (tier === "HAS_WEBSITE") {
    explanation = `${business.name} has already established a basic web presence with an active website, which lowers immediate conversion friction. However, optimizing reviews (current: ${business.rating}★ across ${business.reviewCount} reviews) and out-relying on competitor density in ${business.area} can unlock substantial organic capture.`;
  } else {
    const mainGap = recommendations[0]?.gap || "general optimizations";
    const saturationNote = marketDensityStatus === "HIGH" 
      ? ` Given high local saturation (${competitorCount} competitors in ${business.area}), acting on this is extremely critical to defend market share.`
      : "";
    explanation = `${business.name} exhibits a significant high-impact digital growth opportunity with an overall score of ${score}/100. The primary gap identified is '${mainGap}'.${saturationNote} Addressing these targets can drive an estimated ${projectedUpliftPct}% growth in local organic reach and physical visits.`;
  }

  return {
    score,
    tier,
    recommendations,
    projectedUpliftPct,
    explanation,
    scoringVersion: "v2.0-high-accuracy",
    competitorCount,
    marketDensityStatus,
    confidenceScore,
  };
}

