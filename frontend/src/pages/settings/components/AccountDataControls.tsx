import { AlertDialog } from "radix-ui";
import { Download, RefreshCw, ShieldCheck, Trash2, UserX } from "lucide-react";
import { Button } from "../../../components/ui/Button";
import type { SignedInSession } from "../api/requests";

export interface AccountDataControlsProps {
  sessions: SignedInSession[];
  sessionsLoading: boolean;
  clearingSessionId: string | null;
  clearingOtherSessions: boolean;
  busyAction: "export" | "delete" | null;
  failure?: string;
  confirmation?: string;
  onRefreshSessions: () => Promise<void>;
  onClearSession: (sessionId: string) => Promise<void>;
  onClearOtherSessions: () => Promise<void>;
  onExportAccount: () => Promise<void>;
  onDeactivateAccount: () => Promise<void>;
}

export function AccountDataControls({
  sessions,
  sessionsLoading,
  clearingSessionId,
  clearingOtherSessions,
  busyAction,
  failure,
  confirmation,
  onRefreshSessions,
  onClearSession,
  onClearOtherSessions,
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
        <div className="signed-in-session-actions">
          <Button className="session-icon-button" size="small" variant="secondary" type="button" title="Refresh sessions" aria-label="Refresh sessions" onClick={() => void onRefreshSessions()} disabled={sessionsLoading}>
            <RefreshCw className={sessionsLoading ? "is-loading" : ""} size={17} />
          </Button>
          <Button className="session-icon-button" size="small" variant="danger" type="button" title="Clear list of sessions" aria-label="Clear list of sessions" onClick={() => void onClearOtherSessions()} disabled={sessionsLoading || clearingOtherSessions || sessions.length <= 1}>
            <Trash2 size={17} />
          </Button>
        </div>
      </div>
      {sessions.length === 0 && !sessionsLoading ? (
        <p className="settings-empty-state">No active sessions were returned.</p>
      ) : (
        <div className="signed-in-session-list">
          {sessions.map((session) => (
            <article key={session.id}>
              <div className="signed-in-session-details">
                <strong>{session.deviceInfo}{session.isCurrent ? " (Current)" : ""}</strong>
                <span>{session.ipAddress}</span>
                <small>{session.createdAt ? new Date(session.createdAt).toLocaleString() : "Date unavailable"}</small>
              </div>
              <Button className="session-icon-button" size="small" variant="danger" type="button" title={session.isCurrent ? "Current session cannot be cleared" : "Clear session"} aria-label={session.isCurrent ? "Current session cannot be cleared" : "Clear session"} onClick={() => void onClearSession(session.id)} disabled={session.isCurrent || clearingSessionId === session.id}>
                <Trash2 size={16} />
              </Button>
            </article>
          ))}
        </div>
      )}
      {confirmation && <p className="settings-request-confirmation" role="status">{confirmation}</p>}

      <div className="account-data-actions">
        <Button type="button" onClick={() => void onExportAccount()} disabled={busyAction !== null}>
          <Download size={17} />
          {busyAction === "export" ? "Preparing export..." : "Export account data"}
        </Button>
        <Button type="button" disabled title="The backend currently returns Not Implemented">
          <ShieldCheck size={17} />
          Enable two-factor authentication
        </Button>
        <AlertDialog.Root>
          <AlertDialog.Trigger asChild>
            <Button type="button" className="deactivate-account-button" disabled={busyAction !== null}>
              <UserX size={17} />
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
