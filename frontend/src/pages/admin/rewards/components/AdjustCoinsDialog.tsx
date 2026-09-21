import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Dialog, Select } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import { ADMIN_ADJUSTMENT_SOURCE_OPTIONS, directionForAdminSource, formatCoins, type AdminAdjustmentSource } from "../constants";
import type { RewardAdjustmentInput, RewardUser } from "../types";
import { RewardUserSelector } from "./RewardUserSelector";

export interface AdjustCoinsDialogProps {
  open: boolean;
  initialUser?: RewardUser;
  submitting: boolean;
  error: string;
  onOpenChange: (open: boolean) => void;
  onSubmit: (input: RewardAdjustmentInput) => Promise<void> | void;
}

export function AdjustCoinsDialog({ open, initialUser, submitting, error, onOpenChange, onSubmit }: AdjustCoinsDialogProps) {
  const [users, setUsers] = useState<RewardUser[]>([]);
  const [sourceType, setSourceType] = useState<AdminAdjustmentSource>("ADMIN_REWARD");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [requestId, setRequestId] = useState(() => crypto.randomUUID());
  useEffect(() => { if (open) { setUsers(initialUser ? [initialUser] : []); setSourceType("ADMIN_REWARD"); setAmount(""); setReason(""); setRequestId(crypto.randomUUID()); } }, [initialUser?.id, open]);
  const direction = directionForAdminSource(sourceType);
  const numericAmount = Number(amount);
  const currentBalance = Number(users[0]?.hu_coins ?? 0);
  const nextBalance = direction === "CREDIT" ? currentBalance + (Number.isFinite(numericAmount) ? numericAmount : 0) : currentBalance - (Number.isFinite(numericAmount) ? numericAmount : 0);
  const valid = useMemo(() => users.length === 1 && Number.isInteger(numericAmount) && numericAmount > 0 && reason.trim().length > 0 && reason.trim().length <= 500 && (direction === "CREDIT" || nextBalance >= 0), [direction, nextBalance, numericAmount, reason, users.length]);
  function submit(event: FormEvent) { event.preventDefault(); if (!valid) return; void onSubmit({ user_id: users[0].id, source_type: sourceType, amount: numericAmount, reason: reason.trim(), request_id: requestId }); }
  const action = direction === "CREDIT" ? "Reward" : "Revoke";
  return <Dialog.Root open={open} onOpenChange={(next) => { if (!submitting) onOpenChange(next); }}><Dialog.Portal><Dialog.Overlay className="admin-reward-dialog-overlay" /><Dialog.Content className="admin-reward-dialog"><Dialog.Title>Adjust HU Coins</Dialog.Title><Dialog.Description>Create an accountable credit or debit in the immutable ledger.</Dialog.Description><form onSubmit={submit}><label><span>User</span><RewardUserSelector selectedUsers={users} onSelectedUsersChange={setUsers} maxSelected={1} label={users[0]?.name || "Choose user"} disabled={submitting} /></label><label><span>Source</span><Select.Root value={sourceType} onValueChange={(value) => setSourceType(value as AdminAdjustmentSource)} disabled={submitting}><Select.Trigger className="admin-reward-dialog-select"><Select.Value /></Select.Trigger><Select.Portal><Select.Content className="admin-reward-select-menu" position="popper"><Select.Viewport>{ADMIN_ADJUSTMENT_SOURCE_OPTIONS.map((option) => <Select.Item className="admin-reward-select-option" value={option.value} key={option.value}><Select.ItemText>{option.label}</Select.ItemText></Select.Item>)}</Select.Viewport></Select.Content></Select.Portal></Select.Root></label><label><span>Amount</span><input type="number" min="1" step="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1000" disabled={submitting} /></label><label><span>Reason</span><textarea rows={4} maxLength={500} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Explain why this adjustment is required" disabled={submitting} /></label>{users[0] && numericAmount > 0 ? <div className="admin-reward-preview"><span>Current balance <strong>{formatCoins(currentBalance)} HU Coins</strong></span><span>Adjustment <strong className={direction === "CREDIT" ? "admin-reward-credit" : "admin-reward-debit"}>{direction === "CREDIT" ? "+" : "-"}{formatCoins(numericAmount)} HU Coins</strong></span><span>New balance <strong>{formatCoins(nextBalance)} HU Coins</strong></span></div> : null}{direction === "DEBIT" && nextBalance < 0 ? <p className="admin-form-error">A revocation cannot make the balance negative.</p> : null}{error ? <p className="admin-form-error">{error}</p> : null}<footer><Button variant="secondary" disabled={submitting} onClick={() => onOpenChange(false)}>Cancel</Button><Button type="submit" disabled={!valid || submitting}>{submitting ? "Submitting..." : `${action} ${formatCoins(numericAmount)} HU Coins`}</Button></footer></form></Dialog.Content></Dialog.Portal></Dialog.Root>;
}
