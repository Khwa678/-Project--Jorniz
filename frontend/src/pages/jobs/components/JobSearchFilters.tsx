export interface JobSearchFiltersProps {
  jobType: string;
  location: string;
  searchText: string;
  availableLocations: string[];
  availableTypes: string[];
  onJobTypeChange: (value: string) => void;
  onLocationChange: (value: string) => void;
  onSearchChange: (value: string) => void;
}

export function JobSearchFilters({
  jobType,
  location,
  searchText,
  availableLocations,
  availableTypes,
  onJobTypeChange,
  onLocationChange,
  onSearchChange,
}: JobSearchFiltersProps) {
  return (
    <div className="hj-filters">
      <input value={searchText} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search title, organization or specialty" />
      <JobSelect
        ariaLabel="Filter by job type"
        value={jobType}
        onValueChange={onJobTypeChange}
        options={[{ label: "All job types", value: "All" }, ...availableTypes.map((value) => ({ label: value, value }))]}
      />
      <JobSelect
        ariaLabel="Filter by location"
        value={location}
        onValueChange={onLocationChange}
        options={[{ label: "All locations", value: "All" }, ...availableLocations.map((value) => ({ label: value, value }))]}
      />
    </div>
  );
}
import { JobSelect } from "./JobSelect";
