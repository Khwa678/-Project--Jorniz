export function PrivacySettings() {
  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Unavailable</span>
        <h2>Privacy choices</h2>
        <p>Privacy controls are shown for planning only and cannot yet be saved by the backend.</p>
      </div>
      <fieldset className="unavailable-settings-list" disabled>
        <label><input type="checkbox" /> Show profile in discovery</label>
        <label><input type="checkbox" /> Show professional activity</label>
        <label><input type="checkbox" /> Allow direct message requests</label>
      </fieldset>
    </section>
  );
}
