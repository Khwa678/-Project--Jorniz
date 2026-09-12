import { UnavailableSettingToggle } from "./UnavailableSettingToggle";

const notificationChoices = [
  ["notification-connections", "New followers and connections"],
  ["notification-reactions", "Comments and reactions"],
  ["notification-appointments", "Appointment reminders"],
  ["notification-rewards", "Product and reward updates"],
] as const;

export function NotificationSettings() {
  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Unavailable</span>
        <h2>Notification preferences</h2>
        <p>Jorniz does not currently expose an endpoint for saving notification preferences.</p>
      </div>
      <fieldset className="unavailable-settings-list" disabled>
        {notificationChoices.map(([id, label]) => (
          <UnavailableSettingToggle id={id} label={label} key={id} />
        ))}
      </fieldset>
    </section>
  );
}
