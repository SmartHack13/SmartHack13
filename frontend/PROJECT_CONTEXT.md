# MedMatch France — Complete Project Context & Technical Specification

> **Version:** 1.2.0  
> **Target Region:** France (Metropolitan & DROM-COM)  
> **Core Concept:** Objective, preference-driven healthcare matchmaking for French residents and international patients.

---

## 1. Executive Summary & Value Proposition

**Core Principle:**  
*"Don't just find doctors. Find the doctors that best match what matters to you."*

MedMatch France is a decision-support medical matching application. It explicitly avoids making claims about identifying the medically "best" doctor. Instead, it computes an objective **Match Score (0–100%)** based on:
1. **Location & Travel Time:** Real transit distance, walking distance, and urban commute estimates.
2. **Medical Specialty & Sub-Expertise:** Exact specialty alignment and clinical sub-specialties.
3. **Availability Speed:** Verified next available slot (today, tomorrow, within 3/7/14 days).
4. **Languages Spoken:** Multilingual coverage (French, English, Spanish, German, Arabic, Italian, Hindi, etc.) for international residents and expats.
5. **French Healthcare Tariff System:** Convention status (Secteur 1 without fee overrun, Secteur 2, Carte Vitale acceptance).
6. **AI Natural Language Prioritization:** Automatic translation of free-text user priorities into calibrated dynamic weights using Gemini 2.5 Flash.
7. **Live Verification & Grounding:** Real-time validation against verified French medical directories (Ameli Annuaire Santé, Doctolib, Maiia, Ordre des Médecins) via Google Search Grounding.

---

## 2. Architecture Overview

```
+-----------------------------------------------------------------------------------+
|                                 FRONTEND (SPA)                                    |
|  - React 18 + TypeScript + Tailwind CSS                                            |
|  - Step-by-Step Guided Wizard (Location, Specialty, Languages, Availability, Note)  |
|  - AI Dynamic Weight Fine-Tuner & Transparency Radar                              |
|  - Responsive Results Table & Interactive French Vector Map                       |
|  - Live Grounding Citations Drawer (GroundingMetadata Sources)                    |
|  - Instant Excel Export Engine (.xlsx) via SheetJS                                |
+-----------------------------------------------------------------------------------+
                                        |
                   +--------------------+--------------------+
                   |                                         |
                   v                                         v
+-------------------------------------+   +---------------------------------------+
|        GEMINI 2.5 FLASH AI          |   |       RANKING & GEO ENGINE (TS/PY)    |
| - Priority Interpreter (JSON Schema)|   | - Haversine Distance Calculation      |
| - Google Search Grounding for Live  |   | - Transit Time Estimation Curve       |
|   Directory Extraction & Citations  |   | - Multi-Criteria Weighted Match Score |
| - Dynamic Weight Normalization      |   | - Deterministic Badge & Reason Engine |
+-------------------------------------+   +---------------------------------------+
                                        |
                                        v
+-----------------------------------------------------------------------------------+
|                           PRODUCTION BACKEND (ROADMAP)                            |
|  - FastAPI / Node.js NestJS Backend                                               |
|  - PostgreSQL + PostGIS (RPPS / FINESS National Healthcare Registry)              |
|  - Live Availability Aggregator (Doctolib / Maiia / Qare / Keldoc APIs)           |
|  - Google Maps Platform (Geocoding API, Distance Matrix API, Places API)          |
+-----------------------------------------------------------------------------------+
```

---

## 3. Data Models & TypeScript Interfaces

```typescript
export type AvailabilityOption =
  | 'today'
  | 'tomorrow'
  | 'within_3_days'
  | 'within_7_days'
  | 'within_2_weeks'
  | 'any';

export type SectorType =
  | 'Secteur 1'
  | 'Secteur 2 (Conventionné)'
  | 'Secteur 2 (Non conventionné)';

export interface AppointmentSlot {
  datetime: string;     // ISO timestamp
  display: string;      // e.g., "Today 16:30" or "Tomorrow 09:15"
  daysFromNow: number;  // 0 for today, 1 for tomorrow, etc.
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;                    // "Dr." or "Pr."
  gender: 'M' | 'F';
  rppsNumber?: string;              // Official 11-digit French RPPS ID
  specialty: string;                // e.g. "Dermatologist"
  subSpecialties: string[];         // e.g. ["Pediatric Dermatology", "Melanoma Screening"]
  languages: string[];              // e.g. ["French", "English"]
  city: string;
  postalCode: string;               // e.g. "75008"
  address: string;
  metroOrBus?: string;              // Nearest station e.g., "Métro Madeleine (Line 8, 12, 14)"
  lat: number;
  lng: number;
  rating: number;                   // 1.0 - 5.0
  reviewCount: number;
  sector: SectorType;
  consultationFee: number;          // Base fee in EUR (26.50 - 95.00)
  teleconsultationAvailable: boolean;
  carteVitaleAccepted: boolean;
  earliestSlot: AppointmentSlot;
  availableSlotsCountThisWeek: number;
  avatarUrl: string;
  bio: string;
  mockBookingUrl: string;
  isLiveGrounded?: boolean;
  groundingSources?: GroundingSource[];
  verificationNote?: string;
}

export interface InterpretedPreferences {
  specialty: string;
  languages: string[];
  availability_priority: 'very_high' | 'high' | 'medium' | 'low';
  distance_priority: 'very_high' | 'high' | 'medium' | 'low';
  maximum_travel_time_minutes: number;
  maximum_distance_km: number;
  rating_priority: 'high' | 'medium' | 'low';
  transport_mode: 'transit' | 'driving' | 'walking' | 'any';
  weights: {
    availability: number;   // 0.0 to 1.0 (sums to 1.0)
    specialty: number;
    language: number;
    distance: number;
    rating: number;
  };
  summary: string;
}

export interface DoctorMatchResult {
  doctor: Doctor;
  rank: number;
  matchScore: number;       // 0 - 100
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  scoreBreakdown: {
    availabilityScore: number;
    specialtyScore: number;
    languageScore: number;
    distanceScore: number;
    ratingScore: number;
  };
  badges: ('Earliest' | 'Best language match' | 'Closest' | 'Highly matched' | 'Secteur 1' | 'Live Grounded')[];
  whyMatched: string;
  whyRankOneReason?: string;
}
```

---

## 4. Transparent Ranking Algorithm

The default matching equation uses a multi-factor linear score model:

$$\text{MatchScore} = \min(99, \max(25, \sum (S_i \times W_i)))$$

### Factor Breakdown ($S_i \in [0, 100]$):

1. **Specialty & Expertise Score ($S_{\text{specialty}}$):**
   - Exact specialty match = $100$
   - Partial / Parent specialty match = $90$
   - Sub-specialty keyword match = $85$
   - Unmatched specialty = $30$

2. **Language Score ($S_{\text{language}}$):**
   - All user requested languages spoken = $100$
   - Partial language overlap = $70 + (\text{matched} / \text{total}) \times 25$
   - Language barrier (no requested non-French language) = $20$

3. **Availability Score ($S_{\text{availability}}$):**
   - Available **Today** ($0\text{ days}$) = $100$
   - Available **Tomorrow** ($1\text{ day}$) = $90$
   - Within $3\text{ days}$ = $80$
   - Within $7\text{ days}$ = $65$
   - Within $14\text{ days}$ = $45$
   - Over $14\text{ days}$ = $30$

4. **Distance & Travel Time Score ($S_{\text{distance}}$):**
   - $\le 10\text{ minutes}$ commute = $100$
   - $\le 20\text{ minutes}$ commute = $90$
   - $\le \text{MaxTravelTime}$ = $75$
   - Linear penalty decay for exceeding target transit time.

5. **Profile Quality & Rating ($S_{\text{rating}}$):**
   - $(\text{Rating} / 5.0) \times 100$

### Default Base Weights ($W_i$):
- $\text{Availability}: 40\%$
- $\text{Specialty Match}: 25\%$
- $\text{Language Match}: 15\%$
- $\text{Distance / Proximity}: 15\%$
- $\text{Rating / Quality}: 5\%$

*(Weights are dynamically rebalanced by Gemini 2.5 Flash according to natural language instructions and user fine-tuning).*

---

## 5. Gemini 2.5 Flash Integrations

### 5.1 Natural Language Priority Interpretation (Structured JSON)

**Model:** `gemini-2.5-flash`  
**System Instruction:**
```
You are an expert French healthcare matching assistant.
Analyze user search instructions to extract their implicit and explicit priorities.
Generate realistic priority weights that always sum up to 1.0 (availability, specialty, language, distance, rating).
- If urgent / ASAP: set availability weight >= 0.50.
- If language emphasized (e.g., English): ensure language weight >= 0.25.
- If user gives travel limits: extract maximum_travel_time_minutes.
- Output clean JSON conforming to the schema.
```

### 5.2 Live Grounded Directory Search (Google Search Grounding)

**Model:** `gemini-2.5-flash`  
**Configuration:**
```typescript
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY, vertexai: true });
const response = await ai.models.generateContent({
  model: 'gemini-2.5-flash',
  contents: prompt,
  config: {
    tools: [{ googleSearch: {} }],
  },
});
// Mandatory: Extract Grounding URLs
const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
```

---

## 6. French Healthcare System Domain Rules

When building or expanding MedMatch France:
1. **RPPS Identifier:** Every licensed doctor in France possesses an 11-digit RPPS (Répertoire Partagé des Professionnels de Santé) number.
2. **Secteur 1 (Conventionné):** Doctors apply standard state-negotiated rates (e.g. 26.50€ for GP, 31.50€ for Dermatologist). No unexpected overruns (*sans dépassement d'honoraires*).
3. **Secteur 2 (Honoraires Libres):** Doctors can charge higher consultation fees (e.g. 70€ - 120€). Partially reimbursed by *Sécurité Sociale* and private top-up insurance (*Mutuelle*).
4. **Carte Vitale:** French green electronic health card for direct third-party refund processing.
5. **Médecin Traitant:** The declared primary general practitioner required under the French coordinated care pathway (*Parcours de soins coordonnés*).

---

## 7. Production Backend Integration Guide

To convert this prototype into a full-scale production system:

1. **Database Schema (PostgreSQL + PostGIS):**
   ```sql
   CREATE TABLE doctors (
     id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
     rpps_id VARCHAR(11) UNIQUE NOT NULL,
     full_name VARCHAR(150) NOT NULL,
     specialty_code VARCHAR(50) NOT NULL,
     sector VARCHAR(30) NOT NULL,
     location GEOGRAPHY(Point, 4326) NOT NULL,
     address TEXT NOT NULL,
     postal_code VARCHAR(10) NOT NULL,
     city VARCHAR(100) NOT NULL,
     languages TEXT[] NOT NULL,
     teleconsultation BOOLEAN DEFAULT false,
     carte_vitale BOOLEAN DEFAULT true,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   CREATE INDEX idx_doctors_geo ON doctors USING GIST(location);
   ```

2. **Availability Sync:**
   - Connect via authorized webhooks or polling connectors with scheduling providers (Doctolib Pro API, Maiia API, Qare API).

3. **Routing & Distances:**
   - Integrate Google Routes API / Distance Matrix API with `mode=transit` and `departure_time=now` for realistic transit durations across RATP, SNCF, TCL, and RTM networks.

---

## 8. Excel Export Specification (.xlsx)

The spreadsheet download (`MedMatch_France_Results.xlsx`) contains:
- **Columns:** Rank, Doctor, Specialty, Sub-Expertise, Languages, Location, Nearest Transit, Distance (km), Estimated Travel Time, Earliest Availability, Match Score, Sector, Fee (€), Rating, Why Matched, Booking URL, Data Status.
- Generated client-side using SheetJS (`xlsx`) for instant offline-capable reports.

---

## 9. Regulatory & Legal Safeguards

- **No Medical Advice Disclaimer:** Prominently displayed on all cards, banners, and modal views.
- **Data Minimization (GDPR/RGPD):** Never ask for or store medical history, diagnosis codes, prescription details, or sensitive symptoms. Only capture scheduling criteria, preferred language, and geographical location.
