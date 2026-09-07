import type { ProfessionalConnection } from "../api/requests";

export interface ConnectionInvitationsProps {
  acceptingConnectionId: string | null;
  invitations: ProfessionalConnection[];
  onAccept: (invitation: ProfessionalConnection) => void;
}

export function ConnectionInvitations({ acceptingConnectionId, invitations, onAccept }: ConnectionInvitationsProps) {
  return (
    <section className="pn-panel">
      <header><div><span>Requests</span><h2>Connection invitations</h2></div><strong>{invitations.length}</strong></header>
      {invitations.length === 0 ? <p className="pn-empty-line">No pending invitations.</p> : invitations.map((invitation) => (
        <article className="pn-person-row" key={invitation.id}>
          <span className="pn-avatar">{invitation.name.slice(0, 1).toUpperCase()}</span>
          <div><strong>{invitation.name}</strong><small>{invitation.user_type || "Jorniz member"}</small></div>
          <button type="button" disabled={acceptingConnectionId === invitation.id} onClick={() => onAccept(invitation)}>
            {acceptingConnectionId === invitation.id ? "Accepting..." : "Accept"}
          </button>
          <button type="button" className="pn-disabled-action" disabled title="No backend endpoint is available to reject an invitation.">Reject unavailable</button>
        </article>
      ))}
    </section>
  );
}
