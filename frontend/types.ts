export type AvailabilityOption =
  | 'today'
  | 'tomorrow'
  | 'within_3_days'
  | 'within_7_days'
  | 'within_2_weeks'
  | 'any';

export type FrenchCity =
  | 'Paris'
  | 'Lyon'
  | 'Marseille'
  | 'Toulouse'
  | 'Bordeaux'
  | 'Lille'
  | 'Nantes'
  | 'Strasbourg'
  | 'Nice'
  | string;

export type SectorType = 'Secteur 1' | 'Secteur 2 (Conventionné)' | 'Secteur 2 (Non conventionné)' | 'Conventionné Secteur 1' | 'Secteur 2';

export interface AppointmentSlot {
  datetime: string; // ISO string
  display: string;  // e.g. "Today 16:30" or "Live verified: Next available"
  daysFromNow: number;
}

export interface GroundingSource {
  title: string;
  url: string;
}

export interface Doctor {
  id: string;
  name: string;
  title: string;
  gender: 'M' | 'F';
  rppsNumber?: string;
  specialty: string;
  subSpecialties: string[];
  languages: string[];
  city: FrenchCity;
  postalCode: string;
  address: string;
  metroOrBus?: string;
  lat: number;
  lng: number;
  rating: number;
  reviewCount: number;
  sector: SectorType;
  consultationFee: number;
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

export interface SearchCriteria {
  location: string;
  userLat?: number;
  userLng?: number;
  specialty: string;
  languages: string[];
  availabilityPreference: AvailabilityOption;
  naturalLanguagePriority: string;
  searchMode: 'live_grounded' | 'demo';
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
    availability: number;
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
  matchScore: number; // 0 - 100
  distanceKm: number;
  estimatedTravelTimeMinutes: number;
  scoreBreakdown: {
    availabilityScore: number;
    specialtyScore: number;
    languageScore: number;
    distanceScore: number;
    ratingScore: number;
  };
  badges: ('Earliest' | 'Best language match' | 'Closest' | 'Highly matched' | 'Secteur 1' | 'Live Grounded' | 'Verified')[];
  whyMatched: string;
  whyRankOneReason?: string;
}

export interface FilterOptions {
  maxDistanceKm: number;
  maxTravelTimeMinutes: number;
  selectedLanguage: string;
  maxDaysUntilAppointment: number;
  minMatchScore: number;
  sectorFilter: 'all' | 'secteur1' | 'secteur2';
  teleconsultOnly: boolean;
}

export type SortField = 'best_match' | 'earliest' | 'closest' | 'travel_time' | 'rating';
