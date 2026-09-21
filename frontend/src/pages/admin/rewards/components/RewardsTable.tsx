import type { ReactElement } from "react";
import { Copy, Eye, MoreHorizontal, Pencil, RotateCcw } from "lucide-react";
import { DropdownMenu, Tooltip } from "radix-ui";
import { Button } from "../../../../components/ui/Button";
import { TableColumnFilter } from "../../components/TableColumnFilter";
import { ResponsiveTable, type ResponsiveTableColumn } from "../../components/ResponsiveTable";
import { REWARD_DIRECTION_OPTIONS, REWARD_SOURCE_OPTIONS, formatCoins, readableRewardSource } from "../constants";
import type { RewardDirection, RewardLedgerEntry, RewardUser } from "../types";
import { RewardUserColumnFilter } from "./RewardUserColumnFilter";

function shortId(value: string) { return value.length > 8 ? `${value.slice(0, 8)}...` : value; }
function dateTime(value: string) { const date = new Date(value); return Number.isNaN(date.getTime()) ? { date: "Unknown", time: "" } : { date: new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(date), time: new Intl.DateTimeFormat(undefined, { hour: "numeric", minute: "2-digit" }).format(date) }; }
function HoverTooltip({ content, children }: { content: string; children: ReactElement }) { return <Tooltip.Root><Tooltip.Trigger asChild>{children}</Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="admin-reward-tooltip" sideOffset={6}>{content}<Tooltip.Arrow className="admin-reward-tooltip-arrow" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root>; }
function canCorrectEntry(entry: RewardLedgerEntry, canReverse: boolean) { return canReverse && (entry.can_reverse ?? (["ADMIN_REWARD", "ADMIN_REVOCATION"].includes(entry.source_type) && !entry.reversal_of_id && !entry.reversed_by_id)); }

export interface RewardsTableProps {
  entries: RewardLedgerEntry[];
  canReverse: boolean;
  onDetails: (entry: RewardLedgerEntry) => void;
  onCorrect: (entry: RewardLedgerEntry) => void;
  onReverse: (entry: RewardLedgerEntry) => void;
  onCopy: (value: string, label: string) => void;
  selectedUsers: RewardUser[];
  selectedDirections: RewardDirection[];
  selectedSources: string[];
  onSelectedUsersChange: (users: RewardUser[]) => void;
  onSelectedDirectionsChange: (directions: RewardDirection[]) => void;
  onSelectedSourcesChange: (sources: string[]) => void;
}

export function RewardsTable(props: RewardsTableProps) {
  const columns: ResponsiveTableColumn<RewardLedgerEntry>[] = [
    { id: "created_at", label: "Date", render: (entry) => { const value = dateTime(entry.created_at); return <time className="admin-reward-date" dateTime={entry.created_at}><strong>{value.date}</strong>{value.time ? <span>{value.time}</span> : null}</time>; } },
    { id: "user", label: <RewardUserColumnFilter selectedUsers={props.selectedUsers} onSelectedUsersChange={props.onSelectedUsersChange} />, render: (entry) => <div className="admin-reward-person"><HoverTooltip content={entry.user_name || "Unknown user"}><strong>{entry.user_name || "Unknown user"}</strong></HoverTooltip><HoverTooltip content={entry.user_email || "No email supplied"}><span>{entry.user_email || "No email supplied"}</span></HoverTooltip><HoverTooltip content={entry.user_id}><button type="button" onClick={() => props.onCopy(entry.user_id, "User ID")}><span>{shortId(entry.user_id)}</span><Copy size={11} /></button></HoverTooltip></div> },
    { id: "change", label: <TableColumnFilter label="Change" options={REWARD_DIRECTION_OPTIONS.filter((option) => option.value !== "all")} selectedValues={props.selectedDirections} onSelectedValuesChange={(values) => props.onSelectedDirectionsChange(values as RewardDirection[])} />, render: (entry) => <strong className={`admin-reward-change admin-reward-${entry.credit_debit.toLowerCase()}`}>{entry.credit_debit === "CREDIT" ? "+" : "-"}{formatCoins(entry.amount)}</strong> },
    { id: "current_balance", label: "Current balance", render: (entry) => `${formatCoins(entry.current_balance)} HU` },
    { id: "balance_after", label: "Balance", render: (entry) => `${formatCoins(entry.balance_after)} HU` },
    { id: "source", label: <TableColumnFilter label="Source" options={REWARD_SOURCE_OPTIONS.filter((option) => option.value !== "all")} selectedValues={props.selectedSources} onSelectedValuesChange={props.onSelectedSourcesChange} />, render: (entry) => canCorrectEntry(entry, props.canReverse) ? <button type="button" className="admin-reward-source admin-reward-source-button" onClick={() => props.onCorrect(entry)} aria-label={`Correct ${readableRewardSource(entry.source_type)} adjustment`}>{readableRewardSource(entry.source_type)}</button> : <span className="admin-reward-source">{readableRewardSource(entry.source_type)}</span> },
    { id: "actor", label: "Actor", render: (entry) => <div className="admin-reward-person admin-reward-actor"><strong>{entry.actor_name || "System"}</strong>{entry.actor_email ? <span>{entry.actor_email}</span> : null}</div> },
    { id: "reason", label: "Reason", render: (entry) => <span className="admin-reward-reason" title={entry.reason ?? ""}>{entry.reason || "Automated activity"}</span> },
    { id: "reference", label: "Reference", render: (entry) => { const reference = entry.source_id || entry.id; return <HoverTooltip content={reference}><button className="admin-reward-reference" type="button" onClick={() => props.onCopy(reference, entry.source_id ? "Source ID" : "Ledger ID")}><span>{shortId(reference)}</span><Copy size={11} /></button></HoverTooltip>; } },
  ];
  return <Tooltip.Provider delayDuration={300}><ResponsiveTable rows={props.entries} columns={columns} getRowId={(entry) => entry.id} emptyMessage="No reward activity matches these filters." renderActions={(entry) => {
    const reversible = canCorrectEntry(entry, props.canReverse);
    return <DropdownMenu.Root><DropdownMenu.Trigger asChild><Button className="admin-row-menu-trigger" variant="ghost" size="small" aria-label={`Actions for ledger entry ${entry.id}`}><MoreHorizontal size={18} /></Button></DropdownMenu.Trigger><DropdownMenu.Portal><DropdownMenu.Content className="admin-row-menu" align="end" sideOffset={5}><DropdownMenu.Item className="admin-row-menu-item" onSelect={() => props.onDetails(entry)}><Eye size={15} /> View details</DropdownMenu.Item>{reversible ? <DropdownMenu.Item className="admin-row-menu-item" onSelect={() => props.onCorrect(entry)}><Pencil size={15} /> Correct adjustment</DropdownMenu.Item> : null}{reversible ? <DropdownMenu.Item className="admin-row-menu-item danger" onSelect={() => props.onReverse(entry)}><RotateCcw size={15} /> Reverse adjustment</DropdownMenu.Item> : null}</DropdownMenu.Content></DropdownMenu.Portal></DropdownMenu.Root>;
  }} /></Tooltip.Provider>;
}
