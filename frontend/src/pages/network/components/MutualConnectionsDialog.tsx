import type { MutualConnection, ProfessionalConnection } from "../api/requests";

export interface MutualConnectionsDialogProps {
  connection: ProfessionalConnection | null;
  failure: string | null;
  loading: boolean;
  mutualConnections: MutualConnection[];
  onClose: () => void;
}

export function MutualConnectionsDialog({ connection, failure, loading, mutualConnections, onClose }: MutualConnectionsDialogProps) {
  if (!connection) return null;
  return (
    <div className="pn-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="pn-dialog" role="dialog" aria-modal="true" aria-labelledby="pn-mutual-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><span>Shared network</span><h2 id="pn-mutual-title">Mutual connections with {connection.name}</h2></div><button type="button" onClick={onClose}>Close</button></header>
        {loading ? <p>Loading mutual connections...</p> : failure ? <p className="pn-error" role="alert">{failure}</p> : mutualConnections.length === 0 ? <p className="pn-empty-line">No mutual connections found.</p> : mutualConnections.map((member) => (
          <article className="pn-person-row" key={member.id}><span className="pn-avatar">{member.name.slice(0, 1)}</span><div><strong>{member.name}</strong><small>{[member.specialty, member.hospital].filter(Boolean).join(" | ") || member.role || "Jorniz member"}</small></div></article>
        ))}
      </section>
    </div>
  );
}
