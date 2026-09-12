import { AlertDialog } from "radix-ui";
import { Button } from "../../../components/ui/Button";
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
  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Backend account controls</span>
        <h2>Sessions and account data</h2>
        <p>These actions call existing Jorniz endpoints and report their real result.</p>
      </div>

      <div className="signed-in-session-heading">
        <h3>Signed-in sessions</h3>
        <Button type="button" onClick={() => void onRefreshSessions()} disabled={sessionsLoading}>
          {sessionsLoading ? "Loading..." : "Refresh"}
        </Button>
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
        <Button type="button" onClick={() => void onExportAccount()} disabled={busyAction !== null}>
          {busyAction === "export" ? "Preparing export..." : "Export account data"}
        </Button>
        <Button type="button" disabled title="The backend currently returns Not Implemented">
          Enable two-factor authentication - unavailable
        </Button>
        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <Button type="button" className="deactivate-account-button" disabled={busyAction !== null}>
              {busyAction === "delete" ? "Deactivating..." : "Deactivate account"}
            </Button>
          </AlertDialog.Trigger>
          <AlertDialog.Portal>
            <AlertDialog.Overlay className="settings-dialog-overlay" />
            <AlertDialog.Content className="settings-confirm-dialog">
              <AlertDialog.Title>Deactivate this Jorniz account?</AlertDialog.Title>
              <AlertDialog.Description>
                This changes the account record and signs you out of the active account.
              </AlertDialog.Description>
              <div className="settings-dialog-actions">
                <AlertDialog.Cancel asChild><Button type="button">Cancel</Button></AlertDialog.Cancel>
                <AlertDialog.Action asChild>
                  <Button type="button" className="deactivate-account-button" onClick={() => void onDeactivateAccount()}>
                    Deactivate account
                  </Button>
                </AlertDialog.Action>
              </div>
            </AlertDialog.Content>
          </AlertDialog.Portal>
        </AlertDialog.Root>
      </div>
      {failure && <p className="settings-request-error" role="alert">{failure}</p>}
    </section>
  );
}
