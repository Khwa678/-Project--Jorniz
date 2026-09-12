import { Tooltip } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import type { ProfessionalConnection } from "../api/requests";
import { NetworkMemberAvatar } from "./NetworkMemberAvatar";

export interface ConnectionInvitationsProps {
  acceptingConnectionId: string | null;
  invitations: ProfessionalConnection[];
  onAccept: (invitation: ProfessionalConnection) => void;
}

export function ConnectionInvitations({ acceptingConnectionId, invitations, onAccept }: ConnectionInvitationsProps) {
  return (
    <Tooltip.Provider delayDuration={300}>
    <section className="pn-panel">
      <header><div><span>Requests</span><h2>Connection invitations</h2></div><strong>{invitations.length}</strong></header>
      {invitations.length === 0 ? <p className="pn-empty-line">No pending invitations.</p> : invitations.map((invitation) => (
        <article className="pn-person-row" key={invitation.id}>
          <NetworkMemberAvatar avatarUrl={invitation.avatar_url} name={invitation.name} />
          <div><strong>{invitation.name}</strong><small>{invitation.user_type || "Jorniz member"}</small></div>
          <Button size="small" disabled={acceptingConnectionId === invitation.id} onClick={() => onAccept(invitation)}>
            {acceptingConnectionId === invitation.id ? "Accepting..." : "Accept"}
          </Button>
          <Tooltip.Root>
            <Tooltip.Trigger asChild>
              <span tabIndex={0}>
                <Button size="small" variant="secondary" className="pn-disabled-action" disabled>Reject unavailable</Button>
              </span>
            </Tooltip.Trigger>
            <Tooltip.Portal>
              <Tooltip.Content className="pn-unavailable" sideOffset={6}>
                No backend endpoint is available to reject an invitation.
              </Tooltip.Content>
            </Tooltip.Portal>
          </Tooltip.Root>
        </article>
      ))}
    </section>
    </Tooltip.Provider>
  );
}
