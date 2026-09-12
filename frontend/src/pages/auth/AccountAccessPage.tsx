import { useEffect, useState } from "react";
import { Tabs } from "radix-ui";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import {
  getSignedInAccount,
  saveSignedInAccount,
} from "../../lib/auth/signedInAccount";
import { CreateAccountForm } from "./components/CreateAccountForm";
import { PasswordResetForm } from "./components/PasswordResetForm";
import { SignInForm } from "./components/SignInForm";
import type { AccountAccessMode, AccountAccessResult } from "./types";
import "./styles.css";

export interface AccountAccessPageProps {
  initialMode?: AccountAccessMode;
  onAccountReady: (account: SignedInAccount) => void;
}

export function AccountAccessPage({
  initialMode = "sign-in",
  onAccountReady,
}: AccountAccessPageProps) {
  const [mode, setMode] = useState<AccountAccessMode>(initialMode);
  const [resettingPassword, setResettingPassword] = useState(false);

  useEffect(() => {
    const existingAccount = getSignedInAccount();
    if (existingAccount) onAccountReady(existingAccount);
  }, [onAccountReady]);

  function acceptAccountAccess(result: AccountAccessResult) {
    saveSignedInAccount(result.user, result.access_token, result.refresh_token);
    onAccountReady(result.user);
  }

  return (
    <main className="account-access-page">
      <section className="account-introduction" aria-label="About Jorniz">
        <p className="account-brand">Jorniz</p>
        <p className="account-platform-label">AI-Native Social &amp; Participation Platform</p>
        <h2>
          Connect around health and earn through
          <span>meaningful participation.</span>
        </h2>
        <p className="account-audience-summary">
          Follow health professionals, share useful knowledge, and use eligible HU Coins for
          services across Jorniz.
        </p>
      </section>
      <section className="account-form-panel">
        {resettingPassword ? (
          <PasswordResetForm onReturnToSignIn={() => setResettingPassword(false)} />
        ) : (
          <Tabs.Root value={mode} onValueChange={(value) => setMode(value as AccountAccessMode)}>
            <Tabs.List className="account-mode-tabs" aria-label="Account access options">
              <Tabs.Trigger value="sign-in">Sign in</Tabs.Trigger>
              <Tabs.Trigger value="create-account">Create account</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="sign-in">
              <SignInForm onSignedIn={acceptAccountAccess} onChooseCreateAccount={() => setMode("create-account")} onRequestPasswordReset={() => setResettingPassword(true)} />
            </Tabs.Content>
            <Tabs.Content value="create-account">
              <CreateAccountForm onAccountCreated={acceptAccountAccess} onChooseSignIn={() => setMode("sign-in")} />
            </Tabs.Content>
          </Tabs.Root>
        )}
      </section>
    </main>
  );
}
