import { useEffect, useRef, useState } from "react";
import { LogOut, MoreHorizontal, Settings } from "lucide-react";
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
  onSignOut: () => void;
}

export function NavigationMemberSummary({
  account,
  onOpenAccountOptions,
  onSignOut,
}: NavigationMemberSummaryProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const readable = account as NavigationAccount;
  const name = readable.name || readable.email || "Signed-in member";
  const role = readable.specialty || readable.user_type || "Jorniz member";

  useEffect(() => {
    if (!menuOpen) return;

    function closeFromOutside(event: PointerEvent) {
      if (!summaryRef.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    function closeFromEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("pointerdown", closeFromOutside);
    document.addEventListener("keydown", closeFromEscape);
    return () => {
      document.removeEventListener("pointerdown", closeFromOutside);
      document.removeEventListener("keydown", closeFromEscape);
    };
  }, [menuOpen]);

  return (
    <div className="navigation-member-summary" ref={summaryRef}>
      {readable.avatar_url ? (
        <img src={readable.avatar_url} alt="" />
      ) : (
        <span className="navigation-member-initial" aria-hidden="true">
          {name.charAt(0).toUpperCase()}
        </span>
      )}
      <span className="navigation-member-copy" data-full-name={name}>
        <strong>{name}</strong>
        <small>{role}</small>
      </span>
      <button
        type="button"
        className="navigation-member-options-trigger"
        aria-label="Open account options"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <MoreHorizontal aria-hidden="true" />
      </button>
      {menuOpen && (
        <div className="navigation-member-context-menu" role="menu">
          {onOpenAccountOptions && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setMenuOpen(false);
                onOpenAccountOptions();
              }}
            >
              <Settings aria-hidden="true" />
              Account settings
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            className="navigation-sign-out"
            onClick={() => {
              setMenuOpen(false);
              onSignOut();
            }}
          >
            <LogOut aria-hidden="true" />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
