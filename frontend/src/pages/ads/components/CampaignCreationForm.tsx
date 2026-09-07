import { useState, type FormEvent } from "react";
import type { NewAdvertisingCampaign } from "../api/requests";

export interface CampaignCreationFormProps {
  submitting: boolean;
  failure?: string;
  onCancel: () => void;
  onCreate: (campaign: NewAdvertisingCampaign) => Promise<void>;
}

export function CampaignCreationForm({
  submitting,
  failure,
  onCancel,
  onCreate,
}: CampaignCreationFormProps) {
  const [image, setImage] = useState<File>();

  async function submitAdvertisingCampaign(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await onCreate({
      name: String(fields.get("name") ?? "").trim(),
      objective: String(fields.get("objective") ?? "awareness"),
      budget: Number(fields.get("budget") ?? 0),
      bidAmount: Number(fields.get("bidAmount") ?? 2),
      targetSpecialty: String(fields.get("targetSpecialty") ?? "All"),
      targetLocation: String(fields.get("targetLocation") ?? "All"),
      headline: String(fields.get("headline") ?? "").trim(),
      bodyText: String(fields.get("bodyText") ?? "").trim(),
      callToAction: String(fields.get("callToAction") ?? "Learn More"),
      destinationUrl: String(fields.get("destinationUrl") ?? "").trim(),
      image,
    });
  }

  return (
    <section className="campaign-creation-panel">
      <div>
        <span className="campaign-kicker">New sponsored campaign</span>
        <h2>Create an advertising campaign</h2>
      </div>
      <form onSubmit={(event) => void submitAdvertisingCampaign(event)}>
        <label>Campaign name<input name="name" required /></label>
        <label>
          Objective
          <select name="objective" defaultValue="awareness">
            <option value="awareness">Brand awareness</option>
            <option value="traffic">Website traffic</option>
            <option value="engagement">Post engagement</option>
          </select>
        </label>
        <label>Total budget<input name="budget" type="number" min="1" step="0.01" required /></label>
        <label>Bid amount<input name="bidAmount" type="number" min="0.01" step="0.01" defaultValue="2" required /></label>
        <label>Target specialty<input name="targetSpecialty" defaultValue="All" /></label>
        <label>Target location<input name="targetLocation" defaultValue="All" /></label>
        <label className="campaign-wide-field">Headline<input name="headline" required /></label>
        <label className="campaign-wide-field">Message<textarea name="bodyText" rows={4} /></label>
        <label>Button text<input name="callToAction" defaultValue="Learn More" /></label>
        <label>Destination URL<input name="destinationUrl" type="url" placeholder="https://" /></label>
        <label className="campaign-wide-field">
          Creative image
          <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0])} />
        </label>
        {failure && <p className="campaign-form-error" role="alert">{failure}</p>}
        <div className="campaign-form-actions">
          <button type="button" className="campaign-secondary-button" onClick={onCancel}>Cancel</button>
          <button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create campaign"}</button>
        </div>
      </form>
    </section>
  );
}
