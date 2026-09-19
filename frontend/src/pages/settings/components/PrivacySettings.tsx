import { Switch } from "radix-ui";
import { AccountSelect } from "../../auth/components/AccountSelect";

const visibilityOptions = [
  "Everyone on Jorniz",
  "Verified professionals",
  "Connections",
  "Only me",
].map((value) => ({ label: value, value }));

const messageOptions = [
  "Everyone on Jorniz",
  "Verified professionals",
  "Connections",
  "Nobody",
].map((value) => ({ label: value, value }));

export interface PrivacySettingsProps {
  accountType?: string;
}

export function PrivacySettings({ accountType }: PrivacySettingsProps) {
  const doctorDefaults = accountType === "doctor";
  const profileVisibility = doctorDefaults ? "Everyone on Jorniz" : "Verified professionals";
  const activityVisibility = doctorDefaults ? "Everyone on Jorniz" : "Connections";
  const messageRequests = doctorDefaults ? "Everyone on Jorniz" : "Verified professionals";

  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Privacy</span>
        <h2>Privacy choices</h2>
        <p>Choose who can discover your profile, see your activity, and contact you.</p>
      </div>
      <div className="privacy-settings-list">
        <div className="privacy-setting-row">
          <div><strong>Profile visibility</strong><small>Control who can discover and open your profile.</small></div>
          <AccountSelect ariaLabelledBy="privacy-profile-label" options={visibilityOptions} value={profileVisibility} onValueChange={() => undefined} disabled />
          <span id="privacy-profile-label" className="privacy-setting-accessible-label">Profile visibility</span>
        </div>
        <div className="privacy-setting-row">
          <div><strong>Activity visibility</strong><small>Control who can see your participation across Jorniz.</small></div>
          <AccountSelect ariaLabelledBy="privacy-activity-label" options={visibilityOptions} value={activityVisibility} onValueChange={() => undefined} disabled />
          <span id="privacy-activity-label" className="privacy-setting-accessible-label">Activity visibility</span>
        </div>
        <div className="privacy-setting-row">
          <div><strong>Message requests</strong><small>Choose who can start a new conversation with you.</small></div>
          <AccountSelect ariaLabelledBy="privacy-messages-label" options={messageOptions} value={messageRequests} onValueChange={() => undefined} disabled />
          <span id="privacy-messages-label" className="privacy-setting-accessible-label">Message requests</span>
        </div>
        <div className="privacy-setting-row privacy-setting-switch-row">
          <div><strong>Public web visibility</strong><small>Allow your profile to appear outside Jorniz.</small></div>
          <Switch.Root className="settings-switch" checked={doctorDefaults} disabled aria-label="Public web visibility">
            <Switch.Thumb className="settings-switch-thumb" />
          </Switch.Root>
        </div>
      </div>
      <p className="privacy-settings-note">These preferences will become editable when privacy controls are available.</p>
    </section>
  );
}
