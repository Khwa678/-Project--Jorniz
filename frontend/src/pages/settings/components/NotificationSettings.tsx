export function NotificationSettings() {
  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Unavailable</span>
        <h2>Notification preferences</h2>
        <p>Jorniz does not currently expose an endpoint for saving notification preferences.</p>
      </div>
      <fieldset className="unavailable-settings-list" disabled>
        <label><input type="checkbox" /> New followers and connections</label>
        <label><input type="checkbox" /> Comments and reactions</label>
        <label><input type="checkbox" /> Appointment reminders</label>
        <label><input type="checkbox" /> Product and reward updates</label>
      </fieldset>
    </section>
  );
}
