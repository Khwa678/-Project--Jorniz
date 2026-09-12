import { Dialog } from "radix-ui";
import { Button } from "../../../components/ui/Button";
import type { MutualConnection, ProfessionalConnection } from "../api/requests";
import { NetworkMemberAvatar } from "./NetworkMemberAvatar";

export interface MutualConnectionsDialogProps {
  connection: ProfessionalConnection | null;
  failure: string | null;
  loading: boolean;
  mutualConnections: MutualConnection[];
  onClose: () => void;
}

export function MutualConnectionsDialog({ connection, failure, loading, mutualConnections, onClose }: MutualConnectionsDialogProps) {
  return (
    <Dialog.Root open={connection !== null} onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Dialog.Overlay className="pn-dialog-backdrop" />
        <Dialog.Content className="pn-dialog" aria-describedby={undefined}>
          <header>
            <div><span>Shared network</span><Dialog.Title id="pn-mutual-title">Mutual connections with {connection?.name}</Dialog.Title></div>
            <Dialog.Close asChild><Button size="small" variant="secondary">Close</Button></Dialog.Close>
          </header>
          {loading ? <p>Loading mutual connections...</p> : failure ? <p className="pn-error" role="alert">{failure}</p> : mutualConnections.length === 0 ? <p className="pn-empty-line">No mutual connections found.</p> : mutualConnections.map((member) => (
            <article className="pn-person-row" key={member.id}>
              <NetworkMemberAvatar avatarUrl={member.avatar_url} name={member.name} />
              <div><strong>{member.name}</strong><small>{[member.specialty, member.hospital].filter(Boolean).join(" | ") || member.role || "Jorniz member"}</small></div>
            </article>
          ))}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
