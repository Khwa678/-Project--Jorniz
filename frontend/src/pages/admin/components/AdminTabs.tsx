import type { ReactNode } from "react";
import { Tabs } from "radix-ui";

export type AdminTab = "users" | "posts" | "rewards";

export interface AdminTabsProps {
  value: AdminTab;
  onValueChange: (value: AdminTab) => void;
  children: ReactNode;
}

export function AdminTabs({ value, onValueChange, children }: AdminTabsProps) {
  return (
    <Tabs.Root value={value} onValueChange={(nextValue) => onValueChange(nextValue as AdminTab)}>
      <Tabs.List className="admin-tabs" aria-label="Administrator sections">
        <Tabs.Trigger value="users">Users</Tabs.Trigger>
        <Tabs.Trigger value="posts">Posts</Tabs.Trigger>
        <Tabs.Trigger value="rewards">Rewards</Tabs.Trigger>
      </Tabs.List>
      {children}
    </Tabs.Root>
  );
}

export function AdminTabPanel({ value, children }: { value: AdminTab; children: ReactNode }) {
  return <Tabs.Content value={value}>{children}</Tabs.Content>;
}
