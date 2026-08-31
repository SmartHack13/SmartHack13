import * as XLSX from 'xlsx';
import { DoctorMatchResult } from '../types';

export const exportResultsToExcel = (
  results: DoctorMatchResult[],
  searchSummary: string = 'MedMatch France Search Results'
) => {
  const formattedData = results.map((r) => ({
    Rank: r.rank,
    Doctor: `${r.doctor.title} ${r.doctor.name}`,
    Specialty: r.doctor.specialty,
    'Sub-Expertise': r.doctor.subSpecialties.join(', '),
    Languages: r.doctor.languages.join(', '),
    Location: `${r.doctor.address}, ${r.doctor.postalCode} ${r.doctor.city}`,
    'Nearest Transit': r.doctor.metroOrBus || 'N/A',
    'Distance (km)': r.distanceKm,
    'Estimated Travel Time': `${r.estimatedTravelTimeMinutes} mins`,
    'Earliest Availability': r.doctor.earliestSlot.display,
    'Match Score': `${r.matchScore}%`,
    Sector: r.doctor.sector,
    'Consultation Fee (€)': r.doctor.consultationFee,
    'Rating (Stars)': `${r.doctor.rating} / 5 (${r.doctor.reviewCount} reviews)`,
    'Why Matched': r.whyMatched,
    'Booking URL (Prototype)': r.doctor.mockBookingUrl,
    'Data Status': 'Prototype data for demonstration purposes only',
  }));

  const worksheet = XLSX.utils.json_to_sheet(formattedData);

  // Set column widths for clean readability
  worksheet['!cols'] = [
    { wch: 6 },  // Rank
    { wch: 24 }, // Doctor
    { wch: 18 }, // Specialty
    { wch: 30 }, // Sub-Expertise
    { wch: 20 }, // Languages
    { wch: 38 }, // Location
    { wch: 25 }, // Transit
    { wch: 14 }, // Distance
    { wch: 20 }, // Travel Time
    { wch: 20 }, // Earliest
    { wch: 12 }, // Match Score
    { wch: 24 }, // Sector
    { wch: 18 }, // Fee
    { wch: 18 }, // Rating
    { wch: 45 }, // Why Matched
    { wch: 40 }, // Booking URL
    { wch: 40 }, // Data Status
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Doctor Matches');

  // Generate file download
  XLSX.writeFile(workbook, 'MedMatch_France_Results.xlsx');
};
