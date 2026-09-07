import type { ProfessionalConnection } from "../api/requests";

export interface FirstDegreeConnectionsProps {
  connections: ProfessionalConnection[];
  onViewMutualConnections: (connection: ProfessionalConnection) => void;
}

export function FirstDegreeConnections({ connections, onViewMutualConnections }: FirstDegreeConnectionsProps) {
  return (
    <section className="pn-panel">
      <header><div><span>Your circle</span><h2>First-degree connections</h2></div><strong>{connections.length}</strong></header>
      {connections.length === 0 ? <p className="pn-empty-line">You do not have accepted connections yet.</p> : (
        <div className="pn-grid">
          {connections.map((connection) => (
            <article className="pn-person-card" key={connection.id}>
              <span className="pn-avatar">{connection.name.slice(0, 1).toUpperCase()}</span>
              <h3>{connection.name}</h3>
              <p>{connection.user_type || "Jorniz member"}</p>
              <button type="button" onClick={() => onViewMutualConnections(connection)}>View mutual connections</button>
              <span className="pn-unavailable">Removing a connection is not available yet.</span>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
