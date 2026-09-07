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
      <select value={jobType} onChange={(event) => onJobTypeChange(event.target.value)}>
        <option value="All">All job types</option>
        {availableTypes.map((value) => <option value={value} key={value}>{value}</option>)}
      </select>
      <select value={location} onChange={(event) => onLocationChange(event.target.value)}>
        <option value="All">All locations</option>
        {availableLocations.map((value) => <option value={value} key={value}>{value}</option>)}
      </select>
    </div>
  );
}
