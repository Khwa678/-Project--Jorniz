import { useEffect, useState, type FormEvent } from "react";
import { ImageUploader } from "../../../components/image-uploader/ImageUploader";
import { Button } from "../../../components/ui/Button";
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
  onDeleteAvatar: () => Promise<void>;
}

export function ProfileSettings({
  account,
  saving,
  failure,
  confirmation,
  onSave,
  onDeleteAvatar,
}: ProfileSettingsProps) {
  const readable = account as ReadableAccount;
  const currentAvatarUrl = readable.avatar_url ?? readable.profile?.avatar ?? "";
  const [avatarUrl, setAvatarUrl] = useState(currentAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

  useEffect(() => { setAvatarUrl(currentAvatarUrl); }, [currentAvatarUrl]);

  async function submitProfileSettings(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const fields = new FormData(event.currentTarget);
    await onSave({
      name: String(fields.get("name") ?? "").trim(),
      bio: String(fields.get("bio") ?? "").trim(),
      avatarUrl,
      avatarFile,
      specialty: String(fields.get("specialty") ?? "").trim(),
      hospital: String(fields.get("hospital") ?? "").trim(),
      location: String(fields.get("location") ?? "").trim(),
    });
    setAvatarFile(null);
  }

  async function deleteAvatar() {
    try {
      await onDeleteAvatar();
      setAvatarFile(null);
      setAvatarUrl("");
    } catch {
      // The parent displays the request error.
    }
  }

  return (
    <section className="account-settings-section">
      <div className="settings-section-heading">
        <span>Persisted account data</span>
        <h2>Profile details</h2>
        <p>These fields are saved through the Jorniz profile endpoint.</p>
      </div>
      <form className="profile-settings-form" onSubmit={(event) => void submitProfileSettings(event)}>
        <div className="profile-settings-identity">
          <ImageUploader currentImageUrl={avatarUrl} name={readable.name ?? ""} selectedFile={avatarFile} disabled={saving} onFileChange={setAvatarFile} onRemove={deleteAvatar} />
          <div className="profile-settings-identity-fields">
            <label>
              Full name
              <input name="name" defaultValue={readable.name ?? ""} required />
            </label>
            <label>
              Avatar URL
              <input name="avatarUrl" type="url" value={avatarUrl} onChange={(event) => setAvatarUrl(event.target.value)} placeholder="https://" />
            </label>
            <label className="settings-wide-field">
              Specialty
              <input name="specialty" defaultValue={readable.specialty ?? readable.profile?.specialty ?? ""} />
            </label>
          </div>
        </div>
        <label>
          Hospital or organisation
          <input name="hospital" defaultValue={readable.hospital ?? readable.profile?.hospital ?? ""} />
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
          <Button type="submit" disabled={saving}>{saving ? "Saving..." : "Save profile"}</Button>
        </div>
      </form>
    </section>
  );
}
