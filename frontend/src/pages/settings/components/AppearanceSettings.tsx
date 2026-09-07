export function AppearanceSettings() {
  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Unavailable</span>
        <h2>Appearance</h2>
        <p>A persisted appearance preference endpoint has not been implemented.</p>
      </div>
      <div className="appearance-choice-list" aria-disabled="true">
        <button type="button" disabled>Light</button>
        <button type="button" disabled>Dark</button>
        <button type="button" disabled>Use device setting</button>
      </div>
    </section>
  );
}
