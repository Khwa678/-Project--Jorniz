import { Copy } from "lucide-react";
import { Dialog } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import { formatCoins, readableRewardSource } from "../constants";
import type { RewardLedgerEntry } from "../types";

export function RewardDetailsDialog({ entry, onClose, onCopy }: { entry: RewardLedgerEntry | null; onClose: () => void; onCopy: (value: string, label: string) => void }) {
  if (!entry) return null;
  const rows = [["Ledger ID", entry.id], ["User", `${entry.user_name} (${entry.user_email})`], ["User ID", entry.user_id], ["Direction", entry.credit_debit], ["Amount", `${formatCoins(entry.amount)} HU Coins`], ["Balance before", formatCoins(entry.balance_before)], ["Balance after", formatCoins(entry.balance_after)], ["Current balance", formatCoins(entry.current_balance)], ["Source", readableRewardSource(entry.source_type)], ["Source ID", entry.source_id || "Not provided"], ["Actor", entry.actor_name || "System"], ["Actor ID", entry.actor_user_id || "System"], ["Reason", entry.reason || "Automated activity"], ["Status", entry.status], ["Created", entry.created_at]];
  return <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}><Dialog.Portal><Dialog.Overlay className="admin-reward-dialog-overlay" /><Dialog.Content className="admin-reward-dialog admin-reward-details"><Dialog.Title>Ledger entry details</Dialog.Title><Dialog.Description>Review the immutable balance event and its references.</Dialog.Description><dl>{rows.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}{label.endsWith("ID") && value !== "System" && value !== "Not provided" ? <button type="button" onClick={() => onCopy(value, label)} aria-label={`Copy ${label}`}><Copy size={13} /></button> : null}</dd></div>)}</dl><footer><Dialog.Close asChild><Button variant="secondary">Close</Button></Dialog.Close></footer></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
