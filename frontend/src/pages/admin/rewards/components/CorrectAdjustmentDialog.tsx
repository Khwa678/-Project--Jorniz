import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Dialog, Select } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import { ADMIN_ADJUSTMENT_SOURCE_OPTIONS, directionForAdminSource, formatCoins, type AdminAdjustmentSource } from "../constants";
import type { RewardCorrectionInput, RewardLedgerEntry } from "../types";

export interface CorrectAdjustmentDialogProps {
  entry: RewardLedgerEntry | null;
  submitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (input: RewardCorrectionInput) => Promise<void> | void;
}

export function CorrectAdjustmentDialog({ entry, submitting, error, onClose, onSubmit }: CorrectAdjustmentDialogProps) {
  const [sourceType, setSourceType] = useState<AdminAdjustmentSource>("ADMIN_REWARD");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  useEffect(() => {
    if (!entry) return;
    setSourceType(entry.source_type === "ADMIN_REVOCATION" ? "ADMIN_REVOCATION" : "ADMIN_REWARD");
    setAmount(String(entry.amount));
    setReason(entry.reason || "");
    setRequestId(crypto.randomUUID());
  }, [entry?.id]);
  const numericAmount = Number(amount);
  const direction = directionForAdminSource(sourceType);
  const originalDelta = entry ? (entry.credit_debit === "CREDIT" ? entry.amount : -entry.amount) : 0;
  const replacementDelta = direction === "CREDIT" ? numericAmount : -numericAmount;
  const nextBalance = (entry?.current_balance ?? 0) - originalDelta + (Number.isFinite(replacementDelta) ? replacementDelta : 0);
  const valid = useMemo(() => Number.isInteger(numericAmount) && numericAmount > 0 && reason.trim().length > 0 && reason.trim().length <= 500 && nextBalance >= 0, [nextBalance, numericAmount, reason]);
  if (!entry) return null;
  function submit(event: FormEvent) { event.preventDefault(); if (!valid) return; void onSubmit({ source_type: sourceType, amount: numericAmount, reason: reason.trim(), request_id: requestId }); }
  return <Dialog.Root open onOpenChange={(open) => { if (!open && !submitting) onClose(); }}><Dialog.Portal><Dialog.Overlay className="admin-reward-dialog-overlay" /><Dialog.Content className="admin-reward-dialog"><Dialog.Title>Correct HU Coin adjustment</Dialog.Title><Dialog.Description>The original entry stays in history. Jorniz will reverse it and create the corrected replacement together.</Dialog.Description><form onSubmit={submit}><label><span>User</span><input value={`${entry.user_name} (${entry.user_email})`} disabled /></label><label><span>Source</span><Select.Root value={sourceType} onValueChange={(value) => setSourceType(value as AdminAdjustmentSource)} disabled={submitting}><Select.Trigger className="admin-reward-dialog-select"><Select.Value /></Select.Trigger><Select.Portal><Select.Content className="admin-reward-select-menu" position="popper"><Select.Viewport>{ADMIN_ADJUSTMENT_SOURCE_OPTIONS.map((option) => <Select.Item className="admin-reward-select-option" value={option.value} key={option.value}><Select.ItemText>{option.label}</Select.ItemText></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal></Select.Root></label><label><span>Amount</span><input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={submitting} /></label><label><span>Reason</span><textarea rows={4} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain the corrected adjustment" disabled={submitting} /></label><div className="admin-reward-preview"><span>Current balance <strong>{formatCoins(entry.current_balance)} HU Coins</strong></span><span>Corrected balance <strong>{formatCoins(nextBalance)} HU Coins</strong></span></div>{nextBalance < 0 ? <p className="admin-form-error">This correction would make the balance negative.</p> : null}{error ? <p className="admin-form-error">{error}</p> : null}<footer><Button variant="secondary" disabled={submitting} onClick={onClose}>Cancel</Button><Button type="submit" disabled={!valid || submitting}>{submitting ? "Saving..." : "Save correction"}</Button></footer></form></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
