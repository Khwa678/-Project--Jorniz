import { useState } from "react";
import { Avatar } from "radix-ui";
import { Button } from "../../ui/Button";

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
        <Button variant="ghost" size="small" onClick={onOpenAll} disabled={!onOpenAll}>
          See all
        </Button>
      </header>
      {members.length === 0 ? (
        <p className="overview-empty-state">No live member suggestions are available.</p>
      ) : (
        <div className="suggested-member-list">
          {members.map((member) => {
            const followed = followedMemberIds.has(member.id);
            return (
              <article key={member.id}>
                <Avatar.Root className="suggested-member-avatar">
                  {member.avatarUrl && <Avatar.Image src={member.avatarUrl} alt="" />}
                  <Avatar.Fallback className="suggested-member-initial" delayMs={200} aria-hidden="true">
                    {member.name.trim().charAt(0).toUpperCase() || "?"}
                  </Avatar.Fallback>
                </Avatar.Root>
                <span>
                  <strong>{member.name}{member.verified ? " (verified)" : ""}</strong>
                  <small>{member.description}</small>
                </span>
                <Button
                  variant="secondary"
                  size="small"
                  disabled={!onFollow || followed || pendingMemberId === member.id}
                  onClick={() => void followSuggestedMember(member.id)}
                >
                  {followed ? "Following" : pendingMemberId === member.id ? "Saving" : "Follow"}
                </Button>
              </article>
            );
          })}
        </div>
      )}
      {failure && <p className="overview-request-error" role="alert">{failure}</p>}
    </section>
  );
}
