import type { RewardLedgerEntry } from "../api/requests";

export interface RewardLedgerProps {
  entries: RewardLedgerEntry[];
}

function readableSource(source: string): string {
  return source.replaceAll("_", " ").toLowerCase();
}

export function RewardLedger({ entries }: RewardLedgerProps) {
  if (entries.length === 0) {
    return (
      <section className="reward-ledger-card">
        <h2>Reward activity</h2>
        <p className="wallet-empty-state">No persisted reward entries are available yet.</p>
      </section>
    );
  }

  return (
    <section className="reward-ledger-card">
      <h2>Reward activity</h2>
      <div className="reward-ledger-list">
        {entries.map((entry) => (
          <article className="reward-ledger-row" key={entry.id}>
            <span className={"reward-entry-direction reward-entry-" + entry.direction}>
              {entry.direction === "credit" ? "+" : "-"}
            </span>
            <div>
              <strong>{readableSource(entry.source)}</strong>
              <small>
                {entry.createdAt ? new Date(entry.createdAt).toLocaleString() : "Date unavailable"}
              </small>
            </div>
            <div className="reward-entry-amount">
              <strong>
                {entry.direction === "credit" ? "+" : "-"}
                {entry.amount.toLocaleString()} HU
              </strong>
              <small>{entry.status}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
