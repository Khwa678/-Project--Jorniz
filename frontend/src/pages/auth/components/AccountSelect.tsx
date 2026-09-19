import { Check, ChevronDown } from "lucide-react";
import { Select } from "radix-ui";

export interface AccountSelectOption {
  label: string;
  value: string;
}

export interface AccountSelectProps {
  ariaLabelledBy: string;
  options: readonly AccountSelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
}

export function AccountSelect({ ariaLabelledBy, options, value, onValueChange, disabled = false }: AccountSelectProps) {
  return (
    <Select.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <Select.Trigger className="account-select-trigger" aria-labelledby={ariaLabelledBy} disabled={disabled}>
        <Select.Value />
        <Select.Icon className="account-select-icon"><ChevronDown size={16} /></Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="account-select-content" position="popper" sideOffset={5}>
          <Select.Viewport className="account-select-viewport">
            {options.map((option) => (
              <Select.Item className="account-select-item" key={option.value} value={option.value}>
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator className="account-select-indicator"><Check size={15} /></Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}
