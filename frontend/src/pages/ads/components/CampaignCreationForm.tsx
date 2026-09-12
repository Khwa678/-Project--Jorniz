import { useState, type FormEvent } from "react";
import { Dialog, Select } from "radix-ui";
import { Button } from "../../../components/ui/Button";
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
    <Dialog.Portal>
      <Dialog.Overlay className="campaign-dialog-overlay" />
      <Dialog.Content className="campaign-creation-panel">
        <div>
          <span className="campaign-kicker">New sponsored campaign</span>
          <Dialog.Title>Create an advertising campaign</Dialog.Title>
          <Dialog.Description className="campaign-dialog-description">
            Define the campaign, audience, budget, and sponsored creative.
          </Dialog.Description>
        </div>
        <form onSubmit={(event) => void submitAdvertisingCampaign(event)}>
          <label>Campaign name<input name="name" required /></label>
          <label>
            Objective
            <Select.Root name="objective" defaultValue="awareness">
              <Select.Trigger className="campaign-select-trigger" aria-label="Objective">
                <Select.Value />
                <Select.Icon aria-hidden="true">⌄</Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content className="campaign-select-content" position="popper" sideOffset={5}>
                  <Select.Viewport>
                    <Select.Item className="campaign-select-item" value="awareness"><Select.ItemText>Brand awareness</Select.ItemText></Select.Item>
                    <Select.Item className="campaign-select-item" value="traffic"><Select.ItemText>Website traffic</Select.ItemText></Select.Item>
                    <Select.Item className="campaign-select-item" value="engagement"><Select.ItemText>Post engagement</Select.ItemText></Select.Item>
                  </Select.Viewport>
                </Select.Content>
              </Select.Portal>
            </Select.Root>
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
            <Dialog.Close asChild>
              <Button type="button" className="campaign-secondary-button" onClick={onCancel}>Cancel</Button>
            </Dialog.Close>
            <Button type="submit" disabled={submitting}>{submitting ? "Creating…" : "Create campaign"}</Button>
          </div>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  );
}
