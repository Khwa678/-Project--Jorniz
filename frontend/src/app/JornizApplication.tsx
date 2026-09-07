import { useCallback, useEffect, useState } from "react";
import { AccountAccessPage } from "../pages/auth";
import type { SignedInAccount } from "../lib/auth/accountTypes";
import { restoreSignedInAccount } from "../lib/auth/restoreSignedInAccount";
import {
  clearSignedInAccount,
  updateStoredSignedInAccount,
} from "../lib/auth/signedInAccount";
import { accountAccessModeForPath } from "./routeAddresses";
import { SignedInWorkspace } from "./SignedInWorkspace";
import "../styles/colors.css";
import "../styles/typography.css";
import "../styles/layout.css";
import "../styles/responsive.css";
import "./styles.css";

export function JornizApplication() {
  const [account, setAccount] = useState<SignedInAccount | null>(null);
  const [checkingAccount, setCheckingAccount] = useState(true);

  useEffect(() => {
    let active = true;
    restoreSignedInAccount()
      .then((restoredAccount) => { if (active) setAccount(restoredAccount); })
      .finally(() => { if (active) setCheckingAccount(false); });
    return () => { active = false; };
  }, []);

  const acceptAccount = useCallback((signedInAccount: SignedInAccount) => {
    window.history.replaceState({}, "", "/");
    setAccount(signedInAccount);
  }, []);

  const updateAccount = useCallback((updatedAccount: SignedInAccount) => {
    updateStoredSignedInAccount(updatedAccount);
    setAccount(updatedAccount);
  }, []);

  const signOut = useCallback(() => {
    clearSignedInAccount();
    window.history.replaceState({}, "", "/sign-in");
    setAccount(null);
  }, []);

  if (checkingAccount) {
    return <main className="application-session-check" role="status"><strong>Checking your secure session</strong><span>Connecting your Jorniz account...</span></main>;
  }

  if (!account) {
    return <AccountAccessPage initialMode={accountAccessModeForPath(window.location.pathname)} onAccountReady={acceptAccount} />;
  }

  return <SignedInWorkspace account={account} onAccountUpdated={updateAccount} onSignOut={signOut} />;
}
