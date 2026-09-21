import { useMemo, useState } from "react";
import { Check, ListFilter, LoaderCircle, Search } from "lucide-react";
import { Checkbox, Popover } from "radix-ui";

export interface TableColumnFilterOption {
  value: string;
  label: string;
  description?: string;
}

export interface TableColumnFilterProps {
  label: string;
  options: readonly TableColumnFilterOption[];
  selectedValues: readonly string[];
  onSelectedValuesChange: (values: string[]) => void;
  searchPlaceholder?: string;
  loading?: boolean;
  error?: string;
  emptyMessage?: string;
  onSearchValueChange?: (value: string) => void;
}

export function TableColumnFilter({
  label,
  options,
  selectedValues,
  onSelectedValuesChange,
  searchPlaceholder = `Search ${label.toLowerCase()}`,
  loading = false,
  error = "",
  emptyMessage = "No items found.",
  onSearchValueChange,
}: TableColumnFilterProps) {
  const [query, setQuery] = useState("");
  const selected = useMemo(() => new Set(selectedValues), [selectedValues]);
  const visibleOptions = useMemo(() => {
    if (onSearchValueChange || !query.trim()) return options;
    const search = query.trim().toLowerCase();
    return options.filter((option) => `${option.label} ${option.description ?? ""}`.toLowerCase().includes(search));
  }, [onSearchValueChange, options, query]);

  function changeSearch(value: string) {
    setQuery(value);
    onSearchValueChange?.(value);
  }

  function toggle(value: string, checked: boolean) {
    const next = new Set(selectedValues);
    checked ? next.add(value) : next.delete(value);
    onSelectedValuesChange([...next]);
  }

  function selectVisible() {
    onSelectedValuesChange([...new Set([...selectedValues, ...visibleOptions.map((option) => option.value)])]);
  }

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <button className="admin-column-filter-trigger" type="button" data-active={selectedValues.length > 0 || undefined}>
          <span>{label}</span>
          <ListFilter size={14} />
          {selectedValues.length ? <strong>{selectedValues.length}</strong> : null}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content className="admin-column-filter-popover" align="start" sideOffset={6}>
          <label className="admin-column-filter-search">
            <Search size={14} />
            <input autoFocus type="search" value={query} onChange={(event) => changeSearch(event.target.value)} placeholder={searchPlaceholder} />
          </label>
          <div className="admin-column-filter-options">
            {loading ? <p><LoaderCircle className="admin-column-filter-spinner" size={16} /> Loading</p> : null}
            {error ? <p className="admin-column-filter-error">{error}</p> : null}
            {!loading && !error && !visibleOptions.length ? <p>{emptyMessage}</p> : null}
            {!loading && !error ? visibleOptions.map((option) => (
              <label className="admin-column-filter-option" key={option.value}>
                <Checkbox.Root checked={selected.has(option.value)} onCheckedChange={(checked) => toggle(option.value, checked === true)}>
                  <Checkbox.Indicator><Check size={12} /></Checkbox.Indicator>
                </Checkbox.Root>
                <span><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</span>
              </label>
            )) : null}
          </div>
          {selectedValues.length ? (
            <footer className="admin-column-filter-actions">
              <button type="button" onClick={selectVisible}>Select all</button>
              <button type="button" onClick={() => onSelectedValuesChange([])}>Select none</button>
            </footer>
          ) : null}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
