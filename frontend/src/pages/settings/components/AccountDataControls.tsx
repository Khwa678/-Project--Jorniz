import type { SignedInSession } from "../api/requests";

export interface AccountDataControlsProps {
  sessions: SignedInSession[];
  sessionsLoading: boolean;
  busyAction: "export" | "delete" | null;
  failure?: string;
  onRefreshSessions: () => Promise<void>;
  onExportAccount: () => Promise<void>;
  onDeactivateAccount: () => Promise<void>;
}

export function AccountDataControls({
  sessions,
  sessionsLoading,
  busyAction,
  failure,
  onRefreshSessions,
  onExportAccount,
  onDeactivateAccount,
}: AccountDataControlsProps) {
  async function confirmAccountDeactivation() {
    if (!window.confirm("Deactivate this Jorniz account? This changes the account record.")) return;
    await onDeactivateAccount();
  }

  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Backend account controls</span>
        <h2>Sessions and account data</h2>
        <p>These actions call existing Jorniz endpoints and report their real result.</p>
      </div>

      <div className="signed-in-session-heading">
        <h3>Signed-in sessions</h3>
        <button type="button" onClick={() => void onRefreshSessions()} disabled={sessionsLoading}>
          {sessionsLoading ? "Loading..." : "Refresh"}
        </button>
      </div>
      {sessions.length === 0 && !sessionsLoading ? (
        <p className="settings-empty-state">No active sessions were returned.</p>
      ) : (
        <div className="signed-in-session-list">
          {sessions.map((session) => (
            <article key={session.id}>
              <strong>{session.deviceInfo}</strong>
              <span>{session.ipAddress}</span>
              <small>{session.createdAt ? new Date(session.createdAt).toLocaleString() : "Date unavailable"}</small>
            </article>
          ))}
        </div>
      )}

      <div className="account-data-actions">
        <button type="button" onClick={() => void onExportAccount()} disabled={busyAction !== null}>
          {busyAction === "export" ? "Preparing export..." : "Export account data"}
        </button>
        <button type="button" disabled title="The backend currently returns Not Implemented">
          Enable two-factor authentication - unavailable
        </button>
        <button
          type="button"
          className="deactivate-account-button"
          onClick={() => void confirmAccountDeactivation()}
          disabled={busyAction !== null}
        >
          {busyAction === "delete" ? "Deactivating..." : "Deactivate account"}
        </button>
      </div>
      {failure && <p className="settings-request-error" role="alert">{failure}</p>}
    </section>
  );
}
