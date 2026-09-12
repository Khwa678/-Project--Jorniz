import { RadioGroup } from "radix-ui";

const appearanceChoices = [
  ["light", "Light"],
  ["dark", "Dark"],
  ["device", "Use device setting"],
] as const;

export function AppearanceSettings() {
  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Unavailable</span>
        <h2>Appearance</h2>
        <p>A persisted appearance preference endpoint has not been implemented.</p>
      </div>
      <RadioGroup.Root
        className="appearance-choice-list"
        defaultValue="light"
        aria-label="Appearance preference"
        disabled
      >
        {appearanceChoices.map(([value, label]) => (
          <label className="appearance-choice" key={value}>
            <RadioGroup.Item className="appearance-radio" value={value}>
              <RadioGroup.Indicator className="appearance-radio-indicator" />
            </RadioGroup.Item>
            <span>{label}</span>
          </label>
        ))}
      </RadioGroup.Root>
    </section>
  );
}
