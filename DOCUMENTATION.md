# OppMap BI: Bathinda Market Intelligence & Opportunity Analytics Dashboard
## Technical Documentation & Feature Manual

Welcome to **OppMap BI**, a premium, high-fidelity full-stack competitive intelligence and digital opportunity exploration dashboard customized specifically for local food establishments (Cafes, Restaurants, and Dhabas) in **Bathinda, Punjab, India**.

This document outlines the system architecture, core scoring methodologies, UI layout, full-stack endpoints, and real-time integration workflows.

---

## 1. System Overview & Tech Stack

The application is built on a high-performance modern web framework optimized for real-time analysis:
- **Client Interface**: React 18+ powered by **Vite** and styled using **Tailwind CSS** for a high-contrast, beautiful Swiss-modern design.
- **Micro-Animations**: Staggered fades and state transitions implemented with **Motion** (`motion/react`).
- **Interactive Visualizations**: High-fidelity charts, maps, and spatial grid systems tracking geolocations, ratings, and density.
- **Full-Stack Orchestration**: **Express.js** custom Node server running on port `3000` via TypeScript execution (`tsx`).
- **Real-Time Intelligence**: **Google Gemini (gemini-3.5-flash)** using the `@google/genai` TypeScript SDK combined with **Google Search Grounding** to perform live web queries, citation tracing, and registry scraping.
- **Client Persistence**: Premium offline-first experience with dynamic state synchronization using React state and **LocalStorage** persistence.

---

## 2. Core Features Explained

### 📊 Feature 1: Digital Opportunity Scoring Algorithm (`/src/lib/scoring.ts`)
The core value proposition of OppMap BI is to mathematically calculate digital "gaps" in local businesses to find high-value targets for digital agencies or consulting. It scores each business from `0` to `100` on opportunity intensity:
- **Higher Score = More Gaps / Higher Digital Opportunity** (e.g. no website, poor ratings, or missing contact info).
- **Tiers**:
  - `HAS_WEBSITE`: Already possesses a digital storefront. Low immediate barrier.
  - `HIGH` Opportunity (Score $\ge$ 70): Extreme gaps. Urgent digital uplift candidate.
  - `MEDIUM` Opportunity (Score 45-69): Moderate gaps. Good candidate for optimization.
  - `LOW` Opportunity (Score < 45): Very active and well-digitized locally.

### 🧠 Feature 2: Category-Smart Weight Calibration
The algorithm recognizes that consumer purchase intent varies by business category:
- **Cafes**: Focuses heavily on aesthetics, web visibility (Instagram/Visual website impact), and rating score ($1.15\times$ and $1.1\times$ multipliers).
- **Dhabas**: Emphasizes phone-based contact lines ($1.5\times$ multiplier) and daily operating hours ($1.3\times$ multiplier) for on-the-road deliveries.
- **Restaurants**: Highly balanced distribution with special emphasis on high-volume reviews and reputation indices ($1.2\times$ multiplier).

### 📍 Feature 3: Competitor Density & Market Satiation
Computes active competitor density in the same sub-locality (e.g., *Civil Lines, Model Town, GT Road, Rose Garden Area, Dhobi Bazaar*).
- If competitor density is **High** ($\ge 4$ competitors in the same area and category) and the business lacks a website, the algorithm boosts its opportunity score by **+10 points** and flags a `🚨 Saturated Market Core Gap` warning, signaling that they are losing massive organic market share to neighbors.

### 🌐 Feature 4: Real-time Gemini Search Grounding Verification
Users can select any business and click **"Verify & Sync Live Data"** in the details drawer:
- Calls the Express `/api/realtime/enrich` endpoint.
- Triggers **Gemini 3.5 Flash** with active Google Search Grounding to scour the live web for the business's official website, phone, operating hours, ratings, and review counts.
- Captures and displays verified digital citations and source links (checked domains, directories, etc.).
- Integrates a **Resilient Sandbox Fallback Engine**: If the Gemini API key is missing, invalid, or rate-limited, the system automatically runs a high-fidelity mock-verification parser, feeding back realistic data so the interface remains fully operational.

### 🔍 Feature 5: Live Business Discovery Engine
Discover active, unlisted establishments directly from the live web:
- Choose a category and sub-locality, and hit **"Discover Live Places"**.
- Queries the live web for real-world restaurants or cafes in Bathinda.
- Intelligently parses results into the dashboard, assigns coordinates, calculates metrics, and prepends them to the active listings list.
- Automatically saves new items into **LocalStorage** so they persist upon page reloads.

### 🎛️ Feature 6: Dynamic Weight Configurator & Filter Matrix
Allows complete visual control over market models:
- **Sliders** to adjust individual channel weights (Website value, Reviews, Ratings, Phone, Hours).
- **Toggles** to enable or disable Category-Smart Calibration and Competitor Density.
- **Interactive Search & Sub-Locality Filters** to segment Bathinda by region.

### ⚖️ Feature 7: Business Comparison Matrix
- Add up to 3 businesses to a persistent comparison tray.
- Launches a gorgeous full-screen side-by-side comparison spreadsheet showing exact spatial differences, coordinates, contact status, opportunity tier, and custom generated recommendations side-by-side.

---

## 3. Directory & File Structure

```bash
├── package.json               # Configures dev (tsx), build (esbuild server.ts), and start
├── server.ts                  # Full-stack Express.js gateway with Gemini Search Grounding API
├── metadata.json              # App capabilities, permissions, and registration
├── tsconfig.json              # TypeScript compilation specifications
├── vite.config.ts             # Vite client build configuration
├── src/
│   ├── main.tsx               # App bootstrapper
│   ├── App.tsx                # Primary layout, filtering, state sync, & API connectors
│   ├── index.css              # Global styles, fonts, and Tailwind directives
│   ├── components/            # UI Components
│   │   ├── Navbar.tsx         # Search bar, UTC real-time clock, theme triggers
│   │   ├── FilterPanel.tsx    # Left panel slider weights and active filters
│   │   ├── BusinessList.tsx   # Middle-panel scrollable list of business cards
│   │   ├── BusinessDetail.tsx # Right detail drawer with live verification sync and citations
│   │   ├── MapContainer.tsx   # Map visualizer mapping coordinates of local places
│   │   ├── CompareTray.tsx    # Bottom sticky tray for selected competitor comparisons
│   │   └── CompareModal.tsx   # Matrix overlay showing details side-by-side
│   ├── data/
│   │   └── bathinda_seeded.ts # Master initial database with rich, hand-curated places
│   └── lib/
│       ├── scoring.ts         # High-precision market gap calculation algorithm
│       └── diagnostics.ts     # Self-checking dataset telemetry audits
```

---

## 4. Full-Stack Endpoints (`/server.ts`)

### `GET /api/config`
Retrieves whether the backend has successfully registered a valid `GEMINI_API_KEY`.
- **Response**: `{ hasApiKey: boolean }`

### `POST /api/realtime/enrich`
Queries Google Search Grounding to verify details of a specific business name.
- **Request Body**: `{ id, name, category, area, address }`
- **Output**: Detailed JSON describing official telephone, hours, rating, and website URL, alongside a list of verified web sources.

### `POST /api/realtime/discover`
Discovers up to 5 real-world businesses in Bathinda using live Google search grounding.
- **Request Body**: `{ category, area }`
- **Output**: Returns an array of newly mapped businesses complete with geographic estimates, ratings, hours, and contact lines ready to be merged into the client's LocalStorage database.

---

## 5. Setup and Development

1. **Install Dependencies**:
   ```bash
   npm install
   ```
2. **Add Your Secrets**:
   Create a `.env` file at the root or configure your workspace secret settings:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```
3. **Boot Development Environment**:
   ```bash
   npm run dev
   ```
   *Runs the Custom Express TSX server on port 3000.*

4. **Production Build**:
   ```bash
   npm run build
   ```
   *Compiles client assets via Vite to `/dist` and bundles the Express server to a standalone `/dist/server.cjs` file.*

5. **Start Production Container**:
   ```bash
   npm start
   ```

---
*Created with care by Google AI Studio Build Coding Agent.*
