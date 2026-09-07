import { useEffect, useState } from "react";
import type { SignedInAccount } from "../../lib/auth/accountTypes";
import {
  getSignedInAccount,
  saveSignedInAccount,
} from "../../lib/auth/signedInAccount";
import { CreateAccountForm } from "./components/CreateAccountForm";
import { SignInForm } from "./components/SignInForm";
import type { AccountAccessMode, AccountAccessResult } from "./types";
import "./styles.css";

export interface AccountAccessPageProps {
  initialMode?: AccountAccessMode;
  onAccountReady: (account: SignedInAccount) => void;
  onRequestPasswordReset?: () => void;
}

export function AccountAccessPage({
  initialMode = "sign-in",
  onAccountReady,
  onRequestPasswordReset,
}: AccountAccessPageProps) {
  const [mode, setMode] = useState<AccountAccessMode>(initialMode);

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
        <h2>Health knowledge becomes participation.</h2>
        <p>Learn, publish, connect with professionals and use earned HU Coins across the platform.</p>
      </section>
      <section className="account-form-panel">
        <div className="account-mode-tabs" aria-label="Account access options">
          <button type="button" className={mode === "sign-in" ? "active" : ""} onClick={() => setMode("sign-in")}>Sign in</button>
          <button type="button" className={mode === "create-account" ? "active" : ""} onClick={() => setMode("create-account")}>Create account</button>
        </div>
        {mode === "sign-in" ? (
          <SignInForm onSignedIn={acceptAccountAccess} onChooseCreateAccount={() => setMode("create-account")} onRequestPasswordReset={onRequestPasswordReset} />
        ) : (
          <CreateAccountForm onAccountCreated={acceptAccountAccess} onChooseSignIn={() => setMode("sign-in")} />
        )}
      </section>
    </main>
  );
}
