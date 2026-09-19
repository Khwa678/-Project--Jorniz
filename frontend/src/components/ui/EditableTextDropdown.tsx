import { useId, useMemo, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";
import { Popover } from "radix-ui";
import "./editable-text-dropdown.css";

export interface EditableTextDropdownProps {
  value: string;
  options: readonly string[];
  onValueChange: (value: string) => void;
  name?: string;
  placeholder?: string;
  ariaLabelledBy?: string;
  disabled?: boolean;
  required?: boolean;
}

export function EditableTextDropdown({
  value,
  options,
  onValueChange,
  name,
  placeholder,
  ariaLabelledBy,
  disabled = false,
  required = false,
}: EditableTextDropdownProps) {
  const listId = useId();
  const controlRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [contentWidth, setContentWidth] = useState<number>();
  const query = value.trim().toLowerCase();
  const filteredOptions = useMemo(() => {
    if (!query) return [...options];
    return options.filter((option) => option.toLowerCase().includes(query));
  }, [options, query]);

  function selectOption(option: string) {
    onValueChange(option);
    setOpen(false);
  }

  function changeOpen(nextOpen: boolean) {
    if (nextOpen) setContentWidth(controlRef.current?.getBoundingClientRect().width);
    setOpen(nextOpen);
  }

  return (
    <Popover.Root open={open} onOpenChange={changeOpen}>
      <Popover.Anchor asChild>
        <div className="editable-text-dropdown" ref={controlRef}>
          <input
            name={name}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls={listId}
            aria-labelledby={ariaLabelledBy}
            onFocus={() => changeOpen(true)}
            onChange={(event) => {
              onValueChange(event.target.value);
              changeOpen(true);
            }}
          />
          <button
            className="editable-text-dropdown-toggle"
            type="button"
            disabled={disabled}
            aria-label="Show suggestions"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => changeOpen(true)}
          >
            <ChevronDown size={16} />
          </button>
        </div>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content
          className="editable-text-dropdown-content"
          align="start"
          sideOffset={5}
          style={{ width: contentWidth }}
          onOpenAutoFocus={(event) => event.preventDefault()}
        >
          <div id={listId} className="editable-text-dropdown-list" role="listbox">
            {filteredOptions.length ? filteredOptions.map((option) => (
              <button
                className="editable-text-dropdown-option"
                type="button"
                role="option"
                aria-selected={option === value}
                key={option}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => selectOption(option)}
              >
                <span>{option}</span>
                {option === value ? <Check size={15} /> : null}
              </button>
            )) : (
              <div className="editable-text-dropdown-custom">
                Keep <strong>{value.trim()}</strong> as a custom value
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
