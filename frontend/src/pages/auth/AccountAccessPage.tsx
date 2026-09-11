import { useEffect, useState } from "react";
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
        {!resettingPassword ? (
          <div className="account-mode-tabs" aria-label="Account access options">
            <button type="button" className={mode === "sign-in" ? "active" : ""} onClick={() => setMode("sign-in")}>Sign in</button>
            <button type="button" className={mode === "create-account" ? "active" : ""} onClick={() => setMode("create-account")}>Create account</button>
          </div>
        ) : null}
        {resettingPassword ? (
          <PasswordResetForm onReturnToSignIn={() => setResettingPassword(false)} />
        ) : mode === "sign-in" ? (
          <SignInForm onSignedIn={acceptAccountAccess} onChooseCreateAccount={() => setMode("create-account")} onRequestPasswordReset={() => setResettingPassword(true)} />
        ) : (
          <CreateAccountForm onAccountCreated={acceptAccountAccess} onChooseSignIn={() => setMode("sign-in")} />
        )}
      </section>
    </main>
  );
}
