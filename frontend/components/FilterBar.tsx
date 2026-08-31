import React from 'react';
import { Filter, ArrowUpDown, RefreshCw, CheckCircle2 } from 'lucide-react';
import { FilterOptions, SortField } from '../types';
import { AVAILABLE_LANGUAGES } from '../data/mockDoctors';

interface FilterBarProps {
  filterOptions: FilterOptions;
  onChangeFilters: (updated: FilterOptions) => void;
  sortField: SortField;
  onChangeSort: (sort: SortField) => void;
  totalResultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filterOptions,
  onChangeFilters,
  sortField,
  onChangeSort,
  totalResultsCount,
}) => {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Filter inputs */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 uppercase tracking-wider">
            <Filter className="w-4 h-4 text-blue-600" />
            <span>Refine ({totalResultsCount})</span>
          </div>

          {/* Max Travel Time */}
          <div className="flex items-center gap-1 text-xs">
            <label htmlFor="filter-travel-time" className="text-slate-500">Max Time:</label>
            <select
              id="filter-travel-time"
              value={filterOptions.maxTravelTimeMinutes}
              onChange={(e) =>
                onChangeFilters({
                  ...filterOptions,
                  maxTravelTimeMinutes: Number(e.target.value),
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={15}>15 mins</option>
              <option value={30}>30 mins</option>
              <option value={45}>45 mins</option>
              <option value={60}>60 mins</option>
              <option value={120}>Any distance</option>
            </select>
          </div>

          {/* Language filter */}
          <div className="flex items-center gap-1 text-xs">
            <label htmlFor="filter-language" className="text-slate-500">Language:</label>
            <select
              id="filter-language"
              value={filterOptions.selectedLanguage}
              onChange={(e) =>
                onChangeFilters({
                  ...filterOptions,
                  selectedLanguage: e.target.value,
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Languages</option>
              {AVAILABLE_LANGUAGES.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>

          {/* Earliest Availability */}
          <div className="flex items-center gap-1 text-xs">
            <label htmlFor="filter-availability" className="text-slate-500">Earliest:</label>
            <select
              id="filter-availability"
              value={filterOptions.maxDaysUntilAppointment}
              onChange={(e) =>
                onChangeFilters({
                  ...filterOptions,
                  maxDaysUntilAppointment: Number(e.target.value),
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value={0}>Today only</option>
              <option value={1}>Within 24h (Tomorrow)</option>
              <option value={3}>Within 3 days</option>
              <option value={7}>Within 7 days</option>
              <option value={30}>Any date</option>
            </select>
          </div>

          {/* French Tariff Sector Filter */}
          <div className="flex items-center gap-1 text-xs">
            <label htmlFor="filter-tariff" className="text-slate-500">Tariff:</label>
            <select
              id="filter-tariff"
              value={filterOptions.sectorFilter}
              onChange={(e) =>
                onChangeFilters({
                  ...filterOptions,
                  sectorFilter: e.target.value as FilterOptions['sectorFilter'],
                })
              }
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-800 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="all">All Sectors</option>
              <option value="secteur1">Secteur 1 (No fee overrun)</option>
              <option value="secteur2">Secteur 2</option>
            </select>
          </div>
        </div>

        {/* Sorting Dropdown */}
        <div className="flex items-center gap-2 text-xs self-end lg:self-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-400" />
          <label htmlFor="sort-field" className="text-slate-500 font-medium">Sort By:</label>
          <select
            id="sort-field"
            value={sortField}
            onChange={(e) => onChangeSort(e.target.value as SortField)}
            className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-bold text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="best_match">Best Match Score (Default)</option>
            <option value="earliest">Earliest Appointment</option>
            <option value="closest">Closest Distance</option>
            <option value="travel_time">Shortest Travel Time</option>
            <option value="rating">Highest Rating</option>
          </select>
        </div>
      </div>
    </div>
  );
};
