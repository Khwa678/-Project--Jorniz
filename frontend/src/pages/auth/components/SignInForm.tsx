import { useState, type FormEvent } from "react";
import { signIn } from "../api/signIn";
import type { AccountAccessResult } from "../types";

export interface SignInFormProps {
  onSignedIn: (result: AccountAccessResult) => void;
  onChooseCreateAccount: () => void;
  onRequestPasswordReset?: () => void;
}

function describeSignInFailure(error: unknown) {
  return error instanceof Error ? error.message : "Sign in could not be completed.";
}

export function SignInForm({
  onSignedIn,
  onChooseCreateAccount,
  onRequestPasswordReset,
}: SignInFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError("");
    if (!email.trim() || !password) {
      setSubmissionError("Enter your email address and password.");
      return;
    }

    setSubmitting(true);
    try {
      onSignedIn(await signIn({ email, password }));
    } catch (error) {
      setSubmissionError(describeSignInFailure(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="account-form" onSubmit={submitSignIn} noValidate>
      <header>
        <p className="account-eyebrow">Sign in</p>
        <h1>Welcome back</h1>
        <p>Continue to your Jorniz workspace.</p>
      </header>

      {submissionError ? <p className="account-message account-message-error">{submissionError}</p> : null}

      <label className="account-field">
        <span>Email address</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
      </label>
      <label className="account-field">
        <span>Password</span>
        <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required />
      </label>

      {onRequestPasswordReset ? (
        <button className="account-text-action account-forgot-password" type="button" onClick={onRequestPasswordReset}>
          Forgot password?
        </button>
      ) : null}
      <button className="account-primary-action" type="submit" disabled={submitting}>
        {submitting ? "Signing in..." : "Sign in"}
      </button>
      <button className="account-text-action" type="button" onClick={onChooseCreateAccount}>
        New to Jorniz? Create an account
      </button>
    </form>
  );
}
