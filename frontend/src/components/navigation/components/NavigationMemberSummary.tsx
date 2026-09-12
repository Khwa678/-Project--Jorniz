import { LogOut, MoreHorizontal, Settings } from "lucide-react";
import { Avatar, DropdownMenu, Tooltip } from "radix-ui";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";
import { Button } from "../../ui/Button";

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
  const readable = account as NavigationAccount;
  const name = readable.name || readable.email || "Signed-in member";
  const role = readable.specialty || readable.user_type || "Jorniz member";

  return (
    <div className="navigation-member-summary">
      <Avatar.Root className="navigation-member-avatar">
        {readable.avatar_url && <Avatar.Image src={readable.avatar_url} alt={name} />}
        <Avatar.Fallback className="navigation-member-initial" delayMs={150}>
          {name.charAt(0).toUpperCase()}
        </Avatar.Fallback>
      </Avatar.Root>
      <Tooltip.Provider delayDuration={350}>
        <Tooltip.Root>
          <Tooltip.Trigger asChild>
            <span className="navigation-member-copy" tabIndex={0}>
              <strong>{name}</strong>
              <small>{role}</small>
            </span>
          </Tooltip.Trigger>
          <Tooltip.Portal>
            <Tooltip.Content className="navigation-member-tooltip" side="top" align="start" sideOffset={8}>
              {name}
              <Tooltip.Arrow className="navigation-member-tooltip-arrow" />
            </Tooltip.Content>
          </Tooltip.Portal>
        </Tooltip.Root>
      </Tooltip.Provider>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <Button className="navigation-member-options-trigger" size="small" variant="ghost" aria-label="Open account options">
            <MoreHorizontal aria-hidden="true" />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content className="navigation-member-context-menu" side="top" align="end" sideOffset={2}>
            {onOpenAccountOptions && (
              <DropdownMenu.Item onSelect={onOpenAccountOptions}>
                <Settings aria-hidden="true" />
                Account settings
              </DropdownMenu.Item>
            )}
            <DropdownMenu.Item className="navigation-sign-out" onSelect={onSignOut}>
              <LogOut aria-hidden="true" />
              Sign out
            </DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
