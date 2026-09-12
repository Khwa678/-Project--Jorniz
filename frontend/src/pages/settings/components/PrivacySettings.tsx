import { UnavailableSettingToggle } from "./UnavailableSettingToggle";

const privacyChoices = [
  ["privacy-discovery", "Show profile in discovery"],
  ["privacy-activity", "Show professional activity"],
  ["privacy-messages", "Allow direct message requests"],
] as const;

export function PrivacySettings() {
  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Unavailable</span>
        <h2>Privacy choices</h2>
        <p>Privacy controls are shown for planning only and cannot yet be saved by the backend.</p>
      </div>
      <fieldset className="unavailable-settings-list" disabled>
        {privacyChoices.map(([id, label]) => (
          <UnavailableSettingToggle id={id} label={label} key={id} />
        ))}
      </fieldset>
    </section>
  );
}
