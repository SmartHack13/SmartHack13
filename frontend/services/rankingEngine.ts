import { Doctor, SearchCriteria, InterpretedPreferences, DoctorMatchResult } from '../types';
import { CITY_COORDINATES } from '../data/mockDoctors';

// Haversine distance in kilometers
export const calculateDistanceKm = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Radius of the Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return Math.round(distance * 10) / 10;
};

// Estimate travel time (French urban transit / walking model)
export const estimateTravelTimeMinutes = (distanceKm: number): number => {
  if (distanceKm <= 1.0) return Math.max(5, Math.round(distanceKm * 12)); // walking ~5km/h
  if (distanceKm <= 5.0) return Math.round(8 + distanceKm * 3.5); // metro/bus
  if (distanceKm <= 15.0) return Math.round(15 + distanceKm * 2.2); // RER / metro
  return Math.round(25 + distanceKm * 1.8); // regional train / car
};

export const resolveUserCoordinates = (
  locationString: string,
  userLat?: number,
  userLng?: number
): { lat: number; lng: number; label: string } => {
  if (userLat !== undefined && userLng !== undefined) {
    return { lat: userLat, lng: userLng, label: locationString || 'Current Location' };
  }

  const query = (locationString || 'Paris 75008').toLowerCase().trim();

  // Exact or partial match in coordinates dict
  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (query.includes(key) || key.includes(query)) {
      return { lat: coords.lat, lng: coords.lng, label: coords.city };
    }
  }

  // Default to Paris 8th
  return { lat: 48.8724, lng: 2.3117, label: 'Paris 75008' };
};

export const rankDoctors = (
  doctors: Doctor[],
  criteria: SearchCriteria,
  preferences: InterpretedPreferences
): DoctorMatchResult[] => {
  const userCoords = resolveUserCoordinates(criteria.location, criteria.userLat, criteria.userLng);

  const rawResults = doctors.map((doc) => {
    const distKm = calculateDistanceKm(userCoords.lat, userCoords.lng, doc.lat, doc.lng);
    const travelTime = estimateTravelTimeMinutes(distKm);

    // 1. Specialty Score (0 - 100)
    let specialtyScore = 50;
    const targetSpec = (criteria.specialty || preferences.specialty || '').toLowerCase();
    const docSpec = doc.specialty.toLowerCase();

    if (docSpec === targetSpec) {
      specialtyScore = 100;
    } else if (docSpec.includes(targetSpec) || targetSpec.includes(docSpec)) {
      specialtyScore = 90;
    } else if (doc.subSpecialties.some((s) => s.toLowerCase().includes(targetSpec))) {
      specialtyScore = 85;
    } else {
      specialtyScore = 30; // Different specialty penalty
    }

    // 2. Language Score (0 - 100)
    let languageScore = 40;
    const requiredLanguages = criteria.languages.length > 0 ? criteria.languages : preferences.languages;
    if (requiredLanguages.length === 0) {
      languageScore = 90;
    } else {
      const matchCount = requiredLanguages.filter((reqLang) =>
        doc.languages.some((l) => l.toLowerCase() === reqLang.toLowerCase())
      ).length;
      if (matchCount === requiredLanguages.length) {
        languageScore = 100;
      } else if (matchCount > 0) {
        languageScore = 70 + (matchCount / requiredLanguages.length) * 25;
      } else {
        languageScore = 20; // Language barrier
      }
    }

    // 3. Availability Score (0 - 100)
    let availabilityScore = 50;
    const daysOffset = doc.earliestSlot.daysFromNow;
    if (daysOffset === 0) availabilityScore = 100; // Today
    else if (daysOffset === 1) availabilityScore = 90; // Tomorrow
    else if (daysOffset <= 3) availabilityScore = 80;
    else if (daysOffset <= 7) availabilityScore = 65;
    else if (daysOffset <= 14) availabilityScore = 45;
    else availabilityScore = 30;

    // 4. Distance / Travel Time Score (0 - 100)
    let distanceScore = 50;
    const maxTime = preferences.maximum_travel_time_minutes || 35;
    if (travelTime <= 10) distanceScore = 100;
    else if (travelTime <= 20) distanceScore = 90;
    else if (travelTime <= maxTime) distanceScore = 75;
    else if (travelTime <= maxTime * 1.5) distanceScore = 50;
    else distanceScore = Math.max(10, 100 - (travelTime / maxTime) * 50);

    // 5. Rating & Profile Score (0 - 100)
    const ratingScore = Math.min(100, Math.round((doc.rating / 5.0) * 100));

    // Weighted Overall Score
    const w = preferences.weights;
    const finalScore = Math.round(
      specialtyScore * w.specialty +
      languageScore * w.language +
      availabilityScore * w.availability +
      distanceScore * w.distance +
      ratingScore * w.rating
    );

    // Dynamic Badges
    const badges: DoctorMatchResult['badges'] = [];
    if (daysOffset === 0) badges.push('Earliest');
    if (languageScore >= 95 && requiredLanguages.some((l) => l !== 'French')) {
      badges.push('Best language match');
    }
    if (distKm <= 3.0) badges.push('Closest');
    if (finalScore >= 88) badges.push('Highly matched');
    if (doc.sector === 'Secteur 1') badges.push('Secteur 1');

    // Why matched generator
    const whyPoints: string[] = [];
    if (requiredLanguages.some((l) => doc.languages.includes(l))) {
      whyPoints.push(`${requiredLanguages.filter((l) => doc.languages.includes(l)).join(' & ')} spoken`);
    }
    if (daysOffset === 0) whyPoints.push('appointment available today');
    else if (daysOffset === 1) whyPoints.push('appointment available tomorrow');
    else if (daysOffset <= 3) whyPoints.push('available within 3 days');

    if (travelTime <= 20) whyPoints.push(`only ${travelTime} mins away (${distKm} km)`);
    if (doc.sector === 'Secteur 1') whyPoints.push('standard French tariff (Secteur 1)');

    const whyMatched =
      whyPoints.length > 0
        ? whyPoints.slice(0, 3).join(', ')
        : 'Meets core location and specialty criteria';

    return {
      doctor: doc,
      rank: 0,
      matchScore: Math.min(99, Math.max(25, finalScore)),
      distanceKm: distKm,
      estimatedTravelTimeMinutes: travelTime,
      scoreBreakdown: {
        availabilityScore,
        specialtyScore,
        languageScore,
        distanceScore,
        ratingScore,
      },
      badges,
      whyMatched,
    };
  });

  // Sort descending by Match Score
  rawResults.sort((a, b) => b.matchScore - a.matchScore);

  // Assign ranks & top rank explanation
  const ranked = rawResults.map((item, index) => {
    const rank = index + 1;
    let whyRankOneReason = undefined;
    if (rank === 1) {
      whyRankOneReason = `Ranked #1 because this doctor matches your ${item.doctor.languages.join('/')} language preference, offers earliest availability (${item.doctor.earliestSlot.display}), and is within ${item.estimatedTravelTimeMinutes} minutes travel time.`;
    }
    return {
      ...item,
      rank,
      whyRankOneReason,
    };
  });

  return ranked;
};
