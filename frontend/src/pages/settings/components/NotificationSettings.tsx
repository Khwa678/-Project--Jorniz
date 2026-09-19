import { UnavailableSettingToggle } from "./UnavailableSettingToggle";

const notificationChoices = [
  ["notification-connections", "New followers and connections"],
  ["notification-reactions", "Comments and reactions"],
  ["notification-appointments", "Appointment reminders"],
  ["notification-rewards", "Product and reward updates"],
  ["notification-email", "Email notifications"],
] as const;

export function NotificationSettings() {
  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Your updates</span>
        <h2>Notification preferences</h2>
        <p>Manage updates about your network, appointments, rewards, and account activity.</p>
      </div>
      <fieldset className="unavailable-settings-list" disabled>
        {notificationChoices.map(([id, label]) => (
          <UnavailableSettingToggle id={id} label={label} key={id} />
        ))}
      </fieldset>
    </section>
  );
}
