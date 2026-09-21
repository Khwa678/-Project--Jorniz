import { useMemo, useState } from "react";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";
import { ResponsiveTable, type ResponsiveTableColumn } from "../../admin/components/ResponsiveTable";
import { SearchBar } from "../../admin/components/SearchBar";
import { TableColumnFilter } from "../../admin/components/TableColumnFilter";
import type { RewardLedgerEntry } from "../api/requests";
import "../../admin/styles.css";

export interface RewardLedgerProps {
  entries: RewardLedgerEntry[];
  account: SignedInAccount;
}

function readable(value: string): string {
  return value.toLowerCase().split("_").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

function dateTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Date unavailable" : new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function shortId(value: string): string {
  return value.length > 8 ? `${value.slice(0, 8)}...` : value;
}

export function RewardLedger({ entries, account }: RewardLedgerProps) {
  const [query, setQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([String(account.id)]);
  const [selectedDirections, setSelectedDirections] = useState<string[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

  const sourceOptions = useMemo(() => [...new Set(entries.map((entry) => entry.source))].sort().map((source) => ({ value: source, label: readable(source) })), [entries]);
  const statusOptions = useMemo(() => [...new Set(entries.map((entry) => entry.status))].sort().map((status) => ({ value: status, label: readable(status) })), [entries]);
  const filteredEntries = useMemo(() => {
    const search = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (selectedUserIds.length && !selectedUserIds.includes(entry.userId || String(account.id))) return false;
      if (selectedDirections.length && !selectedDirections.includes(entry.direction)) return false;
      if (selectedSources.length && !selectedSources.includes(entry.source)) return false;
      if (selectedStatuses.length && !selectedStatuses.includes(entry.status)) return false;
      if (!search) return true;
      return [entry.id, entry.userId, entry.source, entry.sourceId, entry.reason, entry.status, entry.amount, entry.balanceAfter]
        .some((value) => String(value).toLowerCase().includes(search));
    });
  }, [account.id, entries, query, selectedDirections, selectedSources, selectedStatuses, selectedUserIds]);

  const columns: ResponsiveTableColumn<RewardLedgerEntry>[] = [
    { id: "createdAt", label: "Date", sortable: true, sortValue: (entry) => new Date(entry.createdAt).getTime(), render: (entry) => <time dateTime={entry.createdAt}>{dateTime(entry.createdAt)}</time> },
    { id: "userId", label: <TableColumnFilter label="User ID" options={[{ value: String(account.id), label: shortId(String(account.id)), description: account.name }]} selectedValues={selectedUserIds} onSelectedValuesChange={setSelectedUserIds} searchPlaceholder="Search your user ID" />, render: (entry) => <span className="wallet-ledger-user-id" title={entry.userId || String(account.id)}>{shortId(entry.userId || String(account.id))}</span> },
    { id: "change", label: <TableColumnFilter label="Change" options={[{ value: "credit", label: "Credit" }, { value: "debit", label: "Debit" }]} selectedValues={selectedDirections} onSelectedValuesChange={setSelectedDirections} />, render: (entry) => <strong className={`wallet-ledger-change reward-entry-${entry.direction}`}>{entry.direction === "credit" ? "+" : "-"}{entry.amount.toLocaleString()} HU</strong> },
    { id: "balance", label: "Balance", sortable: true, sortValue: (entry) => entry.balanceAfter, render: (entry) => `${entry.balanceAfter.toLocaleString()} HU` },
    { id: "source", label: <TableColumnFilter label="Source" options={sourceOptions} selectedValues={selectedSources} onSelectedValuesChange={setSelectedSources} />, render: (entry) => <span className="wallet-ledger-source">{readable(entry.source)}</span> },
    { id: "reason", label: "Description", render: (entry) => <span className="wallet-ledger-reason" title={entry.reason || readable(entry.source)}>{entry.reason || readable(entry.source)}</span> },
    { id: "status", label: <TableColumnFilter label="Status" options={statusOptions} selectedValues={selectedStatuses} onSelectedValuesChange={setSelectedStatuses} />, render: (entry) => <span className="wallet-ledger-status">{readable(entry.status)}</span> },
  ];

  return (
    <section className="reward-ledger-card reward-ledger-table-card">
      <header className="wallet-ledger-heading"><div><h2>Reward activity</h2><p>Search and filter your HU Coin ledger.</p></div><span>{filteredEntries.length} entries</span></header>
      <div className="wallet-ledger-toolbar"><SearchBar value={query} section="reward activity" onValueChange={setQuery} /></div>
      <ResponsiveTable rows={filteredEntries} columns={columns} getRowId={(entry) => entry.id} emptyMessage="No reward activity matches these filters." defaultSortColumn="createdAt" defaultSortDirection="descending" />
    </section>
  );
}
