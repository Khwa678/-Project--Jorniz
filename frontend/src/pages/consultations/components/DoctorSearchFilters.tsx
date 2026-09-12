import { Check, ChevronDown } from "lucide-react";
import { Select, ToggleGroup } from "radix-ui";

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
      <Select.Root value={sortBy} onValueChange={(value) => onSortChange(value as DoctorSort)}>
        <Select.Trigger className="dc-sort-trigger" aria-label="Sort doctors">
          <Select.Value />
          <Select.Icon><ChevronDown aria-hidden="true" size={16} /></Select.Icon>
        </Select.Trigger>
        <Select.Portal>
          <Select.Content className="dc-sort-content" position="popper" sideOffset={6}>
            <Select.Viewport>
              {[
                ["rating", "Top rated"],
                ["price-low", "Lowest fee"],
                ["price-high", "Highest fee"],
                ["experience", "Most experienced"],
              ].map(([value, label]) => (
                <Select.Item className="dc-sort-item" key={value} value={value}>
                  <Select.ItemText>{label}</Select.ItemText>
                  <Select.ItemIndicator><Check aria-hidden="true" size={15} /></Select.ItemIndicator>
                </Select.Item>
              ))}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
      <ToggleGroup.Root
        aria-label="Doctor specialties"
        className="dc-specialties"
        type="single"
        value={selectedSpecialty}
        onValueChange={(value) => value && onSpecialtyChange(value)}
      >
        {["All", ...specialties].map((specialty) => (
          <ToggleGroup.Item
            aria-label={`Show ${specialty} doctors`}
            key={specialty}
            value={specialty}
          >
            {specialty}
          </ToggleGroup.Item>
        ))}
      </ToggleGroup.Root>
    </div>
  );
}
