import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { SearchBar } from "./components/SearchBar";
import { AdminTabPanel, AdminTabs, type AdminTab } from "./components/AdminTabs";
import { ResponsiveTable } from "./components/ResponsiveTable";
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
  const [query, setQuery] = useState("");

  return (
    <main className="admin-page">
      <header className="workspace-page-heading">
        <div>
          <h1>Administrator</h1>
          <p className="workspace-page-tagline">Manage Jorniz users, posts, and platform access.</p>
        </div>
        <span className="admin-role-badge">
          <ShieldCheck size={16} />
          {readable(account.system_role ?? "admin")}
        </span>
      </header>

      <AdminTabs
        value={tab}
        onValueChange={(value) => {
          setTab(value);
          setQuery("");
        }}
      >
        <section className="admin-table-card">
          <div className="admin-table-toolbar">
            <SearchBar value={query} section={tab} onValueChange={setQuery} />
          </div>
          <AdminTabPanel value="users">
            <ResponsiveTable rows={[]} columns={[]} getRowId={() => ""} emptyMessage="User table columns and data will be added next." />
          </AdminTabPanel>
          <AdminTabPanel value="posts">
            <ResponsiveTable rows={[]} columns={[]} getRowId={() => ""} emptyMessage="Post table columns and data will be added next." />
          </AdminTabPanel>
        </section>
      </AdminTabs>
    </main>
  );
}
