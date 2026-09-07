import type { SuggestedConnection } from "../api/requests";

export interface PeopleYouMayKnowProps {
  connectingMemberId: string | null;
  onConnect: (member: SuggestedConnection) => void;
  suggestions: SuggestedConnection[];
}

export function PeopleYouMayKnow({ connectingMemberId, onConnect, suggestions }: PeopleYouMayKnowProps) {
  return (
    <section className="pn-panel">
      <header><div><span>Discovery</span><h2>People you may know</h2></div></header>
      {suggestions.length === 0 ? <p className="pn-empty-line">No connection suggestions are available.</p> : (
        <div className="pn-grid">
          {suggestions.map((member) => (
            <article className="pn-person-card" key={member.id}>
              <span className="pn-avatar">{member.name.slice(0, 1).toUpperCase()}</span>
              <h3>{member.name}</h3>
              <p>{member.user_type || "Jorniz member"}</p>
              <button type="button" disabled={connectingMemberId === member.id} onClick={() => onConnect(member)}>
                {connectingMemberId === member.id ? "Sending..." : "Connect"}
              </button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
