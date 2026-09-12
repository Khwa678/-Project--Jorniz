import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";

export interface JobSelectOption {
  label: string;
  value: string;
}

export interface JobSelectProps {
  ariaLabel: string;
  options: JobSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
}

export function JobSelect({ ariaLabel, options, value, onValueChange }: JobSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange}>
      <Select.Trigger className="hj-select-trigger" aria-label={ariaLabel}>
        <Select.Value />
        <Select.Icon><ChevronDown aria-hidden="true" size={16} /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="hj-select-content" position="popper" sideOffset={6}>
          <Select.Viewport>
            {options.map((option) => (
              <Select.Item className="hj-select-item" key={option.value} value={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator><Check aria-hidden="true" size={15} /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
