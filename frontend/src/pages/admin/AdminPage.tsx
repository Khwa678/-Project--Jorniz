import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { AdminTabPanel, AdminTabs, type AdminTab } from "./components/AdminTabs";
import { UsersPanel } from "./components/UsersPanel";
import { PostsPanel } from "./posts/components/PostsPanel";
import { RewardsPanel } from "./rewards/components/RewardsPanel";
import type { AdminUserRewardRequest } from "./types";
import "./styles.css";

function readable(value: string): string {
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export interface AdminPageProps {
  account: SignedInAccount;
}

export function AdminPage({ account }: AdminPageProps) {
  const [tab, setTab] = useState<AdminTab>("users");
  const [rewardRequest, setRewardRequest] = useState<AdminUserRewardRequest | null>(null);

  function openRewardWorkflow(request: AdminUserRewardRequest) {
    setRewardRequest(request);
    setTab("rewards");
  }

  return (
    <main className="admin-page">
      <header className="workspace-page-heading">
        <div>
          <div className="admin-title-row">
            <h1>Administrator</h1>
            <span className="admin-role-badge">
              <ShieldCheck size={16} />
              {readable(account.system_role ?? "admin")}
            </span>
          </div>
          <p className="workspace-page-tagline">Manage Jorniz users, posts, and platform access.</p>
        </div>
      </header>

      <AdminTabs value={tab} onValueChange={setTab}>
        <AdminTabPanel value="users">
          <UsersPanel
            canManageRoles={account.system_role === "admin" || account.system_role === "super_admin"}
            onRewardAction={openRewardWorkflow}
          />
        </AdminTabPanel>
        <AdminTabPanel value="posts">
          <PostsPanel canEdit={account.system_role === "admin" || account.system_role === "super_admin"} />
        </AdminTabPanel>
        <AdminTabPanel value="rewards">
          <RewardsPanel systemRole={account.system_role ?? "admin"} request={rewardRequest} />
        </AdminTabPanel>
      </AdminTabs>
    </main>
  );
}
