import { useState } from "react";

export interface SuggestedMember {
  id: string;
  name: string;
  description: string;
  avatarUrl?: string;
  verified?: boolean;
}

export interface SuggestedMembersCardProps {
  members: SuggestedMember[];
  onOpenAll?: () => void;
  onFollow?: (memberId: string) => Promise<void>;
}

export function SuggestedMembersCard({
  members,
  onOpenAll,
  onFollow,
}: SuggestedMembersCardProps) {
  const [pendingMemberId, setPendingMemberId] = useState("");
  const [followedMemberIds, setFollowedMemberIds] = useState<Set<string>>(new Set());
  const [failure, setFailure] = useState("");

  async function followSuggestedMember(memberId: string) {
    if (!onFollow) return;
    setPendingMemberId(memberId);
    setFailure("");
    try {
      await onFollow(memberId);
      setFollowedMemberIds((current) => new Set(current).add(memberId));
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The follow was not confirmed.");
    } finally {
      setPendingMemberId("");
    }
  }

  return (
    <section className="health-overview-card">
      <header className="overview-card-heading">
        <h2>Who to follow</h2>
        <button type="button" onClick={onOpenAll} disabled={!onOpenAll}>See all</button>
      </header>
      {members.length === 0 ? (
        <p className="overview-empty-state">No live member suggestions are available.</p>
      ) : (
        <div className="suggested-member-list">
          {members.map((member) => {
            const followed = followedMemberIds.has(member.id);
            return (
              <article key={member.id}>
                {member.avatarUrl ? (
                  <img src={member.avatarUrl} alt="" />
                ) : (
                  <span className="suggested-member-initial" aria-hidden="true">{member.name.charAt(0)}</span>
                )}
                <span>
                  <strong>{member.name}{member.verified ? " (verified)" : ""}</strong>
                  <small>{member.description}</small>
                </span>
                <button
                  type="button"
                  disabled={!onFollow || followed || pendingMemberId === member.id}
                  onClick={() => void followSuggestedMember(member.id)}
                >
                  {followed ? "Following" : pendingMemberId === member.id ? "Saving" : "Follow"}
                </button>
              </article>
            );
          })}
        </div>
      )}
      {failure && <p className="overview-request-error" role="alert">{failure}</p>}
    </section>
  );
}
