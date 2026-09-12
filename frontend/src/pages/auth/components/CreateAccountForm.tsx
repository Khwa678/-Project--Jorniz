import { useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { createAccount } from "../api/createAccount";
import {
  accountTypeChoices,
  accountTypesRequiringVerification,
  type AccountAccessResult,
  type JornizAccountType,
} from "../types";
import { ProfessionalVerificationFields } from "./ProfessionalVerificationFields";
import { AccountSelect } from "./AccountSelect";

export interface CreateAccountFormProps {
  onAccountCreated: (result: AccountAccessResult) => void;
  onChooseSignIn: () => void;
}

function describeCreateAccountFailure(error: unknown) {
  return error instanceof Error ? error.message : "The account could not be created.";
}

export function CreateAccountForm({
  onAccountCreated,
  onChooseSignIn,
}: CreateAccountFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [accountType, setAccountType] = useState<JornizAccountType>("general_user");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [organization, setOrganization] = useState("");
  const [verificationDocument, setVerificationDocument] = useState<File | null>(null);
  const [submissionError, setSubmissionError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submitAccountCreation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmissionError("");

    if (!name.trim()) {
      setSubmissionError("Enter your full name.");
      return;
    }
    if (!email.includes("@")) {
      setSubmissionError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setSubmissionError("Password must contain at least 6 characters.");
      return;
    }
    if (accountTypesRequiringVerification.has(accountType) && !verificationDocument) {
      setSubmissionError("Select the required professional certificate.");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createAccount({
        name,
        email,
        password,
        userType: accountType,
        specialty,
        organization,
        verificationDocument,
      });
      onAccountCreated(result);
    } catch (error) {
      setSubmissionError(describeCreateAccountFailure(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="account-form" onSubmit={submitAccountCreation} noValidate>
      <header>
        <h1>Join Jorniz</h1>
        <p>Tell us whether you’re joining as a user or a healthcare professional.</p>
      </header>

      {submissionError ? <p className="account-message account-message-error">{submissionError}</p> : null}

      <label className="account-field">
        <span>Full name</span>
        <input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" required />
      </label>
      <label className="account-field">
        <span>Email address</span>
        <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required />
      </label>
      <div className="account-field">
        <span id="account-type-label">Account type</span>
        <AccountSelect
          ariaLabelledBy="account-type-label"
          options={accountTypeChoices}
          value={accountType}
          onValueChange={(value) => {
            setAccountType(value as JornizAccountType);
            setVerificationDocument(null);
          }}
        />
      </div>

      <ProfessionalVerificationFields
        accountType={accountType}
        specialty={specialty}
        organization={organization}
        documentRequired={accountTypesRequiringVerification.has(accountType)}
        onSpecialtyChange={setSpecialty}
        onOrganizationChange={setOrganization}
        onVerificationDocumentChange={setVerificationDocument}
      />

      <label className="account-field">
        <span>Password</span>
        <input type="password" minLength={6} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" required />
      </label>

      <Button className="account-primary-action" type="submit" disabled={submitting}>
        {submitting ? "Creating account..." : "Create account"}
      </Button>
      <Button className="account-text-action" variant="ghost" onClick={onChooseSignIn}>
        Already have an account? Sign in
      </Button>
    </form>
  );
}
