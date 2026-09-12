import { Switch } from "radix-ui";

export interface UnavailableSettingToggleProps {
  id: string;
  label: string;
}

export function UnavailableSettingToggle({ id, label }: UnavailableSettingToggleProps) {
  return (
    <label className="unavailable-setting-toggle" htmlFor={id}>
      <span>{label}</span>
      <Switch.Root id={id} className="settings-switch" disabled>
        <Switch.Thumb className="settings-switch-thumb" />
      </Switch.Root>
    </label>
  );
}
