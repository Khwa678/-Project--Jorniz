import { useCallback, useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { Toast } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import type { AdminUserRewardRequest } from "../../types";
import { adjustHuCoins, correctRewardAdjustment, getRewardLedger, getRewardSummary, reverseRewardAdjustment } from "../api/rewards";
import type { RewardAdjustmentInput, RewardCorrectionInput, RewardDirection, RewardLedgerEntry, RewardReversalInput, RewardSummary, RewardUser } from "../types";
import { AdjustCoinsDialog } from "./AdjustCoinsDialog";
import { CorrectAdjustmentDialog } from "./CorrectAdjustmentDialog";
import { RewardDetailsDialog } from "./RewardDetailsDialog";
import { ReverseAdjustmentDialog } from "./ReverseAdjustmentDialog";
import { RewardsSummary } from "./RewardsSummary";
import { RewardsTable } from "./RewardsTable";
import { RewardsToolbar } from "./RewardsToolbar";
import "../styles.css";

const PAGE_SIZE = 25;
export interface RewardsPanelProps {
  systemRole: string;
  request: AdminUserRewardRequest | null;
}

export function RewardsPanel({ systemRole, request }: RewardsPanelProps) {
  const [entries, setEntries] = useState<RewardLedgerEntry[]>([]);
  const [summary, setSummary] = useState<RewardSummary | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<RewardUser[]>([]);
  const [selectedDirections, setSelectedDirections] = useState<RewardDirection[]>([]);
  const [selectedSources, setSelectedSources] = useState<string[]>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjusting, setAdjusting] = useState(false);
  const [adjustError, setAdjustError] = useState("");
  const [detailsEntry, setDetailsEntry] = useState<RewardLedgerEntry | null>(null);
  const [reverseEntry, setReverseEntry] = useState<RewardLedgerEntry | null>(null);
  const [reversing, setReversing] = useState(false);
  const [reverseError, setReverseError] = useState("");
  const [correctEntry, setCorrectEntry] = useState<RewardLedgerEntry | null>(null);
  const [correcting, setCorrecting] = useState(false);
  const [correctError, setCorrectError] = useState("");
  const [notice, setNotice] = useState("");
  const [toastOpen, setToastOpen] = useState(false);
  const canAdjust = ["admin", "finance_admin", "super_admin"].includes(systemRole);
  const canReverse = ["finance_admin", "super_admin"].includes(systemRole);
  const userIds = useMemo(() => selectedUsers.map((user) => user.id).join(","), [selectedUsers]);
  const directions = useMemo(() => selectedDirections.join(","), [selectedDirections]);
  const sources = useMemo(() => selectedSources.join(","), [selectedSources]);
  const showNotice = useCallback((message: string) => { setNotice(message); setToastOpen(false); window.setTimeout(() => setToastOpen(true), 0); }, []);

  useEffect(() => { const timer = window.setTimeout(() => { setDebouncedQuery(query.trim()); setPage(1); }, 250); return () => window.clearTimeout(timer); }, [query]);
  useEffect(() => { setPage(1); }, [directions, sources, userIds]);
  useEffect(() => {
    if (!request) return;
    setSelectedUsers([{ ...request.user, user_type: "general_user", system_role: "member", specialty: null, hu_coins: request.user.hu_coins }]);
    setPage(1);
    if (request.action === "adjust") {
      setAdjustError("");
      setAdjustOpen(true);
    }
  }, [request]);
  useEffect(() => {
    let active = true; setLoading(true); setError("");
    getRewardLedger({ q: debouncedQuery, user_ids: userIds || undefined, direction: directions || undefined, source_type: sources || undefined, page, page_size: PAGE_SIZE })
      .then((result) => { if (active) { setEntries(result.items); setTotal(result.total); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : "Reward activity could not be loaded."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [debouncedQuery, directions, page, refreshKey, sources, userIds]);
  useEffect(() => {
    let active = true; setSummaryLoading(true);
    getRewardSummary({ user_ids: userIds || undefined, direction: directions || undefined, source_type: sources || undefined })
      .then((result) => { if (active) setSummary(result); }).catch(() => { if (active) setSummary(null); }).finally(() => { if (active) setSummaryLoading(false); });
    return () => { active = false; };
  }, [directions, refreshKey, sources, userIds]);

  function withKnownBalance(user?: RewardUser): RewardUser | undefined {
    if (!user || Number.isFinite(user.hu_coins)) return user;
    const match = entries.find((entry) => entry.user_id === user.id);
    return match ? { ...user, hu_coins: match.current_balance } : user;
  }
  async function submitAdjustment(input: RewardAdjustmentInput) {
    setAdjusting(true); setAdjustError("");
    try { await adjustHuCoins(input); setAdjustOpen(false); showNotice("HU Coin adjustment recorded."); setRefreshKey((value) => value + 1); }
    catch (reason) { setAdjustError(reason instanceof Error ? reason.message : "The adjustment could not be recorded."); }
    finally { setAdjusting(false); }
  }
  async function submitReversal(input: RewardReversalInput) {
    if (!reverseEntry) return; setReversing(true); setReverseError("");
    try { await reverseRewardAdjustment(reverseEntry.id, input); setReverseEntry(null); showNotice("Adjustment reversed with a new ledger entry."); setRefreshKey((value) => value + 1); }
    catch (reason) { setReverseError(reason instanceof Error ? reason.message : "The adjustment could not be reversed."); }
    finally { setReversing(false); }
  }
  async function submitCorrection(input: RewardCorrectionInput) {
    if (!correctEntry) return; setCorrecting(true); setCorrectError("");
    try { await correctRewardAdjustment(correctEntry.id, input); setCorrectEntry(null); showNotice("Adjustment corrected with new ledger entries."); setRefreshKey((value) => value + 1); }
    catch (reason) { setCorrectError(reason instanceof Error ? reason.message : "The adjustment could not be corrected."); }
    finally { setCorrecting(false); }
  }
  function copy(value: string, label: string) { navigator.clipboard.writeText(value).then(() => showNotice(`${label} copied.`)).catch(() => setError(`${label} could not be copied.`)); }
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return <Toast.Provider duration={3000} swipeDirection="right"><section className="admin-rewards-section"><header className="admin-rewards-heading"><h2>Rewards</h2><p>Review HU Coin activity and make accountable balance adjustments.</p></header><RewardsSummary summary={summary} loading={summaryLoading} /><section className="admin-table-card"><RewardsToolbar query={query} canAdjust={canAdjust} onQueryChange={setQuery} onAdjust={() => { setAdjustError(""); setAdjustOpen(true); }} />{error ? <div className="admin-table-message admin-table-error" role="alert">{error}</div> : null}{loading ? <div className="admin-table-loading" role="status"><LoaderCircle size={22} /> Loading reward activity</div> : <RewardsTable entries={entries} canReverse={canReverse} selectedUsers={selectedUsers} selectedDirections={selectedDirections} selectedSources={selectedSources} onSelectedUsersChange={setSelectedUsers} onSelectedDirectionsChange={setSelectedDirections} onSelectedSourcesChange={setSelectedSources} onDetails={setDetailsEntry} onCorrect={(entry) => { setCorrectError(""); setCorrectEntry(entry); }} onReverse={(entry) => { setReverseError(""); setReverseEntry(entry); }} onCopy={copy} />}<footer className="admin-pagination"><span>{total ? `${(page - 1) * PAGE_SIZE + 1}-${Math.min(page * PAGE_SIZE, total)} of ${total}` : "0 entries"}</span><div><Button size="small" variant="secondary" disabled={page <= 1 || loading} onClick={() => setPage((value) => value - 1)}><ChevronLeft size={16} /></Button><span>Page {page} of {totalPages}</span><Button size="small" variant="secondary" disabled={page >= totalPages || loading} onClick={() => setPage((value) => value + 1)}><ChevronRight size={16} /></Button></div></footer></section></section><AdjustCoinsDialog open={adjustOpen} initialUser={withKnownBalance(selectedUsers.length === 1 ? selectedUsers[0] : undefined)} submitting={adjusting} error={adjustError} onOpenChange={(open) => { setAdjustOpen(open); if (!open) setAdjustError(""); }} onSubmit={submitAdjustment} /><RewardDetailsDialog entry={detailsEntry} onClose={() => setDetailsEntry(null)} onCopy={copy} /><CorrectAdjustmentDialog entry={correctEntry} submitting={correcting} error={correctError} onClose={() => { setCorrectEntry(null); setCorrectError(""); }} onSubmit={submitCorrection} /><ReverseAdjustmentDialog entry={reverseEntry} submitting={reversing} error={reverseError} onClose={() => { setReverseEntry(null); setReverseError(""); }} onSubmit={submitReversal} /><Toast.Root className="admin-reward-toast" open={toastOpen} onOpenChange={setToastOpen}><Toast.Description>{notice}</Toast.Description></Toast.Root><Toast.Viewport className="admin-reward-toast-viewport" /></Toast.Provider>;
}
