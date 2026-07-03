# OppMap BI: Bathinda Market Intelligence & Opportunity Analytics Dashboard

**OppMap BI** is a premium, high-fidelity competitive intelligence and digital gap analysis dashboard designed for digital agencies, marketers, and consultants targeting local food establishments (Cafes, Restaurants, and Dhabas) in **Bathinda, Punjab, India**.

It translates live internet footprints, user ratings, review densities, and physical geolocations into structured client acquisition opportunities, calculated through a category-smart gap analysis engine powered by **Google Gemini 3.5 Flash** with active **Google Search Grounding**.

---

## 🚀 Key Capabilities & Live Features

- **📊 Digital Opportunity Scoring Matrix**: Programmatically scores local businesses from `0` to `100` based on digital absence (lack of official website, poor ratings, missing contact numbers, or truncated operational hours).
- **🧠 Category-Smart Weight Calibration**: Adapts priorities automatically—Dhabas focus heavily on mobile lines and extended hours, Cafes focus on reviews and visual websites, and Restaurants prioritize brand reputation.
- **📍 Competitor Density Modeler**: Automatically identifies market saturation levels in sub-localities (e.g., *Civil Lines, Model Town, GT Road*) and applies point-modifiers to help clients beat local competition.
- **🌐 Real-Time Google Search Grounding**: Allows users to select any business and trigger live verification. The server polls Google Search Grounding to find verified official website links, hours, ratings, and phones in real-time.
- **🛡️ High-Fidelity Sandbox Fallback**: If rate limits are met or keys are invalid, a smart local sandbox engine simulates actual verification inputs, ensuring a seamless interface flow.
- **🔍 Active Web Discovery**: Discover unlisted local establishments on-the-fly. Key in a category and sub-locality, scrape the live web, and append fresh coordinates directly into the active dashboard list.
- **📥 Standalone Interactive HTML Pitch Reports**: Select up to 3 businesses to compare side-by-side, then export and download a completely standalone interactive client pitch report (HTML format) with embedded styles, printable layouts, and detailed roadmap advice. Or, grab a quick structured `.csv` format file.

---

## 📂 System Architecture & Main Files

```bash
├── package.json               # Full-stack commands: dev (tsx), build (esbuild bundle), start
├── server.ts                  # TypeScript Express gateway connecting Gemini Search Grounding
├── DOCUMENTATION.md           # Elaborate system overview & mathematical calibrations
├── src/
│   ├── main.tsx               # App entry point
│   ├── App.tsx                # Primary state engine, LocalStorage sync, & API connectors
│   ├── index.css              # Global styles, typography imports, and Tailwind v4 variables
│   ├── data/
│   │   └── bathinda_seeded.ts # Master initial database with hand-curated places
│   ├── lib/
│   │   ├── scoring.ts         # High-precision market gap scoring algorithm
│   │   └── diagnostics.ts     # Data-quality verification telemetry
│   └── components/            # UI Components
│       ├── Navbar.tsx         # Unified search, theme, and real-time clock
│       ├── FilterPanel.tsx    # Left weight matrices, category filter, and sliders
│       ├── BusinessList.tsx   # Middle-panel scrollable list of business cards
│       ├── MapContainer.tsx   # Left/Main geographic visualizer mapping coordinates
│       ├── BusinessDetail.tsx # Right detail drawer with live verification sync and citations
│       ├── CompareTray.tsx    # Bottom competitive shortlist overlay
│       └── CompareModal.tsx   # Side-by-side comparison matrix with CSV & HTML client downloads
```

---

## 🛠️ Setup & Development Guide

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Your API Keys
Create a `.env` file in the root of the project:
```env
GEMINI_API_KEY=your_gemini_api_key_here
```
*(No frontend prefixing required; API calls are safely proxied through our custom server.ts backend).*

### 3. Run Development Environment
```bash
npm run dev
```
*This boots the custom full-stack Express server on port `3000` with hot-reloading asset compilation handled directly by Vite.*

### 4. Build for Production
To bundle assets for a lightning-fast production deploy:
```bash
npm run build
```
*Compiles the frontend SPA to static files in `/dist` and bundles the entire Express server into a standalone `/dist/server.cjs` file.*

### 5. Launch Production Build
```bash
npm start
```

---
*Developed with modern web crafts by the Google AI Studio Build Coding Agent.*
