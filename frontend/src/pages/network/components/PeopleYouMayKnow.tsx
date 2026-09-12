import { Button } from "../../../components/ui/Button";
import type { SuggestedConnection } from "../api/requests";
import { NetworkMemberAvatar } from "./NetworkMemberAvatar";

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
              <NetworkMemberAvatar avatarUrl={member.avatar_url} name={member.name} />
              <h3>{member.name}</h3>
              <p>{member.user_type || "Jorniz member"}</p>
              <Button size="small" disabled={connectingMemberId === member.id} onClick={() => onConnect(member)}>
                {connectingMemberId === member.id ? "Sending..." : "Connect"}
              </Button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
