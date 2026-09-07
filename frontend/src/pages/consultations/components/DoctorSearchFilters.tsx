export type DoctorSort = "rating" | "price-low" | "price-high" | "experience";

export interface DoctorSearchFiltersProps {
  searchText: string;
  selectedSpecialty: string;
  sortBy: DoctorSort;
  specialties: string[];
  onSearchChange: (value: string) => void;
  onSortChange: (value: DoctorSort) => void;
  onSpecialtyChange: (value: string) => void;
}

export function DoctorSearchFilters({
  searchText,
  selectedSpecialty,
  sortBy,
  specialties,
  onSearchChange,
  onSortChange,
  onSpecialtyChange,
}: DoctorSearchFiltersProps) {
  return (
    <div className="dc-filters">
      <input
        aria-label="Search doctors"
        value={searchText}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search doctor, specialty, hospital or location"
      />
      <select value={sortBy} onChange={(event) => onSortChange(event.target.value as DoctorSort)}>
        <option value="rating">Top rated</option>
        <option value="price-low">Lowest fee</option>
        <option value="price-high">Highest fee</option>
        <option value="experience">Most experienced</option>
      </select>
      <div className="dc-specialties" aria-label="Doctor specialties">
        {["All", ...specialties].map((specialty) => (
          <button
            type="button"
            className={selectedSpecialty === specialty ? "is-active" : ""}
            key={specialty}
            onClick={() => onSpecialtyChange(specialty)}
          >
            {specialty}
          </button>
        ))}
      </div>
    </div>
  );
}
