import { useCallback, useEffect, useState } from "react";
import { Tabs } from "radix-ui";
import { Button } from "../../components/ui/Button";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import { AccountDataControls } from "./components/AccountDataControls";
import { AppearanceSettings } from "./components/AppearanceSettings";
import { NotificationSettings } from "./components/NotificationSettings";
import { PrivacySettings } from "./components/PrivacySettings";
import { ProfileSettings } from "./components/ProfileSettings";
import {
  clearOtherSignedInSessions,
  clearSignedInSession,
  deactivateAccount,
  deleteProfileImage,
  exportAccountData,
  loadSignedInSessions,
  saveProfileSettings,
  type ProfileSettingsInput,
  type SignedInSession,
} from "./api/requests";
import "./styles.css";

type SettingsSection = "profile" | "notifications" | "privacy" | "appearance" | "account-data";

export interface AccountSettingsPageProps {
  account: SignedInAccount;
  onAccountUpdated: (account: SignedInAccount) => void;
  onAccountDeactivated?: () => void;
  onSignOut: () => void;
}

export function AccountSettingsPage({
  account,
  onAccountUpdated,
  onAccountDeactivated,
  onSignOut,
}: AccountSettingsPageProps) {
  const [section, setSection] = useState<SettingsSection>("profile");
  const [sessions, setSessions] = useState<SignedInSession[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [clearingSessionId, setClearingSessionId] = useState<string | null>(null);
  const [clearingOtherSessions, setClearingOtherSessions] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [busyAction, setBusyAction] = useState<"export" | "delete" | null>(null);
  const [failure, setFailure] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const refreshSignedInSessions = useCallback(async () => {
    setSessionsLoading(true);
    setFailure("");
    try {
      setSessions(await loadSignedInSessions());
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Signed-in sessions could not be loaded.");
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (section === "account-data" && sessions.length === 0) {
      void refreshSignedInSessions();
    }
  }, [refreshSignedInSessions, section, sessions.length]);

  async function persistProfile(input: ProfileSettingsInput) {
    setSavingProfile(true);
    setFailure("");
    setConfirmation("");
    try {
      const updatedAccount = await saveProfileSettings(input);
      onAccountUpdated(updatedAccount);
      setConfirmation("Profile saved by the Jorniz backend.");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The profile was not saved.");
    } finally {
      setSavingProfile(false);
    }
  }

  async function clearSession(sessionId: string) {
    setClearingSessionId(sessionId);
    setFailure("");
    setConfirmation("");
    try {
      await clearSignedInSession(sessionId);
      await refreshSignedInSessions();
      setConfirmation("Session cleared.");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The session could not be cleared.");
    } finally {
      setClearingSessionId(null);
    }
  }

  async function clearOtherSessions() {
    setClearingOtherSessions(true);
    setFailure("");
    setConfirmation("");
    try {
      await clearOtherSignedInSessions();
      await refreshSignedInSessions();
      setConfirmation("Other sessions cleared.");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Other sessions could not be cleared.");
    } finally {
      setClearingOtherSessions(false);
    }
  }

  async function removeProfileImage() {
    setSavingProfile(true);
    setFailure("");
    setConfirmation("");
    try {
      const updatedAccount = await deleteProfileImage();
      onAccountUpdated(updatedAccount);
      setConfirmation("Profile image removed.");
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The profile image was not removed.");
      throw error;
    } finally {
      setSavingProfile(false);
    }
  }

  async function downloadAccountExport() {
    setBusyAction("export");
    setFailure("");
    try {
      const accountExport = await exportAccountData();
      const file = new Blob([JSON.stringify(accountExport, null, 2)], { type: "application/json" });
      const address = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = address;
      link.download = "jorniz-account-export.json";
      link.click();
      URL.revokeObjectURL(address);
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "Account data could not be exported.");
    } finally {
      setBusyAction(null);
    }
  }

  async function submitAccountDeactivation() {
    setBusyAction("delete");
    setFailure("");
    try {
      await deactivateAccount();
      onAccountDeactivated?.();
    } catch (error) {
      setFailure(error instanceof Error ? error.message : "The account was not deactivated.");
    } finally {
      setBusyAction(null);
    }
  }

  return (
    <main className="account-settings-page">
      <header>
        <h1>Settings</h1>
        <p>Keep your profile, privacy, and preferences working your way.</p>
      </header>
      <Tabs.Root
        className="account-settings-layout"
        value={section}
        onValueChange={(value) => {
          setFailure("");
          setConfirmation("");
          setSection(value as SettingsSection);
        }}
      >
        <div className="account-settings-navigation-column">
          <Tabs.List className="account-settings-navigation" aria-label="Settings sections">
            {([
              ["profile", "Profile"],
              ["notifications", "Notifications"],
              ["privacy", "Privacy"],
              ["appearance", "Appearance"],
              ["account-data", "Sessions and data"],
            ] as Array<[SettingsSection, string]>).map(([id, label]) => (
              <Tabs.Trigger value={id} key={id}>
                {label}
              </Tabs.Trigger>
            ))}
          </Tabs.List>
          <Button className="settings-sign-out" variant="danger" onClick={onSignOut}>Sign out</Button>
        </div>
        <div>
          <Tabs.Content value="profile">
            <ProfileSettings
              account={account}
              saving={savingProfile}
              failure={failure}
              confirmation={confirmation}
              onSave={persistProfile}
              onDeleteAvatar={removeProfileImage}
            />
          </Tabs.Content>
          <Tabs.Content value="notifications"><NotificationSettings /></Tabs.Content>
          <Tabs.Content value="privacy"><PrivacySettings accountType={account.user_type} /></Tabs.Content>
          <Tabs.Content value="appearance"><AppearanceSettings /></Tabs.Content>
          <Tabs.Content value="account-data">
            <AccountDataControls
              sessions={sessions}
              sessionsLoading={sessionsLoading}
              clearingSessionId={clearingSessionId}
              clearingOtherSessions={clearingOtherSessions}
              busyAction={busyAction}
              failure={failure}
              confirmation={confirmation}
              onRefreshSessions={refreshSignedInSessions}
              onClearSession={clearSession}
              onClearOtherSessions={clearOtherSessions}
              onExportAccount={downloadAccountExport}
              onDeactivateAccount={submitAccountDeactivation}
            />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </main>
  );
}
