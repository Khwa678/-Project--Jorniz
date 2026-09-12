import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import {
  finishPasswordReset,
  requestPasswordReset,
  verifyPasswordResetCode,
} from "../api/resetPassword";

type PasswordResetStep = "email" | "code" | "password" | "complete";

export interface PasswordResetFormProps {
  onReturnToSignIn: () => void;
}

function describeResetFailure(error: unknown) {
  return error instanceof Error ? error.message : "Password reset could not be completed.";
}

export function PasswordResetForm({ onReturnToSignIn }: PasswordResetFormProps) {
  const [step, setStep] = useState<PasswordResetStep>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmedPassword, setConfirmedPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitPasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (step === "email" && !email.trim()) return setMessage("Enter your email address.");
    if (step === "code" && !otp.trim()) return setMessage("Enter the verification code.");
    if (step === "password" && newPassword.length < 6) return setMessage("Password must be at least 6 characters.");
    if (step === "password" && newPassword !== confirmedPassword) return setMessage("Passwords do not match.");

    setSubmitting(true);
    try {
      if (step === "email") {
        await requestPasswordReset(email);
        setStep("code");
      } else if (step === "code") {
        await verifyPasswordResetCode(email, otp);
        setStep("password");
      } else if (step === "password") {
        await finishPasswordReset(email, otp, newPassword);
        setStep("complete");
      }
    } catch (error) {
      setMessage(describeResetFailure(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "complete") {
    return (
      <section className="account-form" aria-live="polite">
        <header><h1>Password updated</h1><p>You can now sign in with your new password.</p></header>
        <Button className="account-primary-action" onClick={onReturnToSignIn}>Return to sign in</Button>
      </section>
    );
  }

  const guidance = step === "email"
    ? "Enter the email address connected to your account."
    : step === "code"
      ? `Enter the verification code sent to ${email}.`
      : "Create a new password for your Jorniz account.";

  return (
    <form className="account-form" onSubmit={submitPasswordReset} noValidate>
      <header><h1>Reset password</h1><p>{guidance}</p></header>
      {message ? <p className="account-message account-message-error">{message}</p> : null}
      {step === "email" ? (
        <label className="account-field"><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label>
      ) : null}
      {step === "code" ? (
        <label className="account-field"><span>Verification code</span><input className="account-reset-code" inputMode="numeric" value={otp} onChange={(event) => setOtp(event.target.value)} autoComplete="one-time-code" maxLength={6} required /></label>
      ) : null}
      {step === "password" ? (
        <>
          <label className="account-field"><span>New password</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} autoComplete="new-password" required /></label>
          <label className="account-field"><span>Confirm new password</span><input type="password" value={confirmedPassword} onChange={(event) => setConfirmedPassword(event.target.value)} autoComplete="new-password" required /></label>
        </>
      ) : null}
      <Button className="account-primary-action" type="submit" disabled={submitting}>
        {submitting ? "Please wait..." : step === "email" ? "Send verification code" : step === "code" ? "Verify code" : "Update password"}
      </Button>
      <Button className="account-text-action" variant="ghost" onClick={onReturnToSignIn}>Back to sign in</Button>
    </form>
  );
}
