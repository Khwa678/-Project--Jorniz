import type { SignedInAccount } from "../../../lib/auth/accountTypes";

type NavigationAccount = SignedInAccount & {
  name?: string;
  email?: string;
  avatar_url?: string;
  specialty?: string;
  user_type?: string;
};

export interface NavigationMemberSummaryProps {
  account: SignedInAccount;
  onOpenAccountOptions?: () => void;
}

export function NavigationMemberSummary({
  account,
  onOpenAccountOptions,
}: NavigationMemberSummaryProps) {
  const readable = account as NavigationAccount;
  const name = readable.name || readable.email || "Signed-in member";
  const role = readable.specialty || readable.user_type || "Jorniz member";

  return (
    <div className="navigation-member-summary">
      {readable.avatar_url ? (
        <img src={readable.avatar_url} alt="" />
      ) : (
        <span className="navigation-member-initial" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="navigation-member-copy">
        <strong>{name}</strong>
        <small>{role}</small>
      </span>
      <button
        type="button"
        aria-label="Open account options"
        onClick={onOpenAccountOptions}
        disabled={!onOpenAccountOptions}
      >
        ...
      </button>
    </div>
  );
}
