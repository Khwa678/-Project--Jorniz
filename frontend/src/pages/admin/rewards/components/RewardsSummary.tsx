import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Coins } from "lucide-react";
import { formatCompactNumber } from "../../../../lib/formatCompactNumber";
import type { RewardSummary } from "../types";

export function RewardsSummary({ summary, loading }: { summary: RewardSummary | null; loading: boolean }) {
  const cards = [
    { label: "Current user balances", value: summary?.current_user_balances, icon: Coins, tone: "balance" },
    { label: "Total credits", value: summary?.credits, icon: ArrowDownToLine, tone: "credit" },
    { label: "Total debits", value: summary?.debits, icon: ArrowUpFromLine, tone: "debit" },
    { label: "Balance mismatches", value: summary?.balance_mismatches, icon: AlertTriangle, tone: "warning" },
  ];
  return <section className="admin-rewards-summary" aria-label="Rewards summary">{cards.map(({ label, value, icon: Icon, tone }) => <article key={label} data-tone={tone}><span><Icon size={17} /></span><div><small>{label}</small><strong title={String(value ?? 0)}>{loading ? "..." : formatCompactNumber(value ?? 0)}</strong></div></article>)}</section>;
}
