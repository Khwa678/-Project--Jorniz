import { useState, type FormEvent } from "react";
import type { SignedInAccount } from "../../../lib/auth/accountTypes";
import type { ProfileSettingsInput } from "../api/requests";

type ReadableAccount = SignedInAccount & {
  name?: string;
  bio?: string;
  avatar_url?: string;
  specialty?: string;
  hospital?: string;
  location?: string;
};

export interface ProfileSettingsProps {
  account: SignedInAccount;
  saving: boolean;
  failure?: string;
  confirmation?: string;
  onSave: (input: ProfileSettingsInput) => Promise<void>;
}

export function ProfileSettings({
  account,
  saving,
  failure,
  confirmation,
  onSave,
}: ProfileSettingsProps) {
  const readable = account as ReadableAccount;
  const [avatarUrl, setAvatarUrl] = useState(readable.avatar_url ?? "");

  async function submitProfileSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await onSave({
      name: String(fields.get("name") ?? "").trim(),
      bio: String(fields.get("bio") ?? "").trim(),
      avatarUrl,
      specialty: String(fields.get("specialty") ?? "").trim(),
      hospital: String(fields.get("hospital") ?? "").trim(),
      location: String(fields.get("location") ?? "").trim(),
    });
  }

  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Persisted account data</span>
        <h2>Profile details</h2>
        <p>These fields are saved through the Jorniz profile endpoint.</p>
      </div>
      <form className="profile-settings-form" onSubmit={(event) => void submitProfileSettings(event)}>
        <label>
          Full name
          <input name="name" defaultValue={readable.name ?? ""} required />
        </label>
        <label>
          Avatar URL
          <input
            name="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(event) => setAvatarUrl(event.target.value)}
            placeholder="https://"
          />
        </label>
        <label>
          Specialty
          <input name="specialty" defaultValue={readable.specialty ?? ""} />
        </label>
        <label>
          Hospital or organisation
          <input name="hospital" defaultValue={readable.hospital ?? ""} />
        </label>
        <label>
          Location
          <input name="location" defaultValue={readable.location ?? ""} />
        </label>
        <label className="settings-wide-field">
          Bio
          <textarea name="bio" rows={5} defaultValue={readable.bio ?? ""} />
        </label>
        {failure && <p className="settings-request-error" role="alert">{failure}</p>}
        {confirmation && <p className="settings-request-confirmation" role="status">{confirmation}</p>}
        <div className="settings-form-actions">
          <button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</button>
        </div>
      </form>
    </section>
  );
}
