import { useEffect, useState, type FormEvent } from "react";
import { AlertDialog } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import { formatCoins } from "../constants";
import type { RewardLedgerEntry, RewardReversalInput } from "../types";

export interface ReverseAdjustmentDialogProps { entry: RewardLedgerEntry | null; submitting: boolean; error: string; onClose: () => void; onSubmit: (input: RewardReversalInput) => Promise<void> | void; }
export function ReverseAdjustmentDialog({ entry, submitting, error, onClose, onSubmit }: ReverseAdjustmentDialogProps) {
  const [reason, setReason] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  useEffect(() => { setReason(""); setRequestId(crypto.randomUUID()); }, [entry?.id]);
  if (!entry) return null;
  function submit(event: FormEvent) { event.preventDefault(); const value = reason.trim(); if (!value) return; void onSubmit({ reason: value, request_id: requestId }); }
  return <AlertDialog.Root open onOpenChange={(open) => { if (!open && !submitting) onClose(); }}><AlertDialog.Portal><AlertDialog.Overlay className="admin-reward-dialog-overlay" /><AlertDialog.Content className="admin-reward-dialog"><AlertDialog.Title>Reverse this adjustment?</AlertDialog.Title><AlertDialog.Description>This creates an opposite ledger entry for {formatCoins(entry.amount)} HU Coins. It does not edit or delete the original.</AlertDialog.Description><form onSubmit={submit}><label><span>Reason</span><textarea autoFocus rows={4} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this adjustment must be reversed" disabled={submitting} /></label>{error ? <p className="admin-form-error">{error}</p> : null}<footer><AlertDialog.Cancel asChild><Button variant="secondary" disabled={submitting}>Cancel</Button></AlertDialog.Cancel><Button type="submit" variant="danger" disabled={submitting || !reason.trim()}>{submitting ? "Reversing..." : "Reverse adjustment"}</Button></footer></form></AlertDialog.Content></AlertDialog.Portal></AlertDialog.Root>;
}
