import { useId, useState, type FormEvent } from "react";
import { Button } from "../../../components/ui/Button";
import { EditableTextDropdown } from "../../../components/ui/EditableTextDropdown";
import { DOCTOR_SPECIALTY_SUGGESTIONS } from "../../../lib/doctors/constants";
import { USER_MANAGEMENT_ROLE_OPTIONS } from "../../../lib/auth/roles";
import { AccountSelect } from "../../auth/components/AccountSelect";
import { accountTypeChoices, type JornizAccountType } from "../../auth/types";
import { systemRoleChoices, type AddUserInput, type AdminSystemRole } from "../types";

export interface AddUserFormProps {
  onSubmit: (input: AddUserInput) => Promise<void> | void;
  onCancel: () => void;
  submitting?: boolean;
  requestError?: string;
  canManageRoles?: boolean;
}

export function AddUserForm({ onSubmit, onCancel, submitting = false, requestError = "", canManageRoles = false }: AddUserFormProps) {
  const accountTypeLabelId = useId();
  const systemRoleLabelId = useId();
  const specialtyLabelId = useId();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState<JornizAccountType>("general_user");
  const [systemRole, setSystemRole] = useState<AdminSystemRole>("member");
  const [specialty, setSpecialty] = useState("General Medicine");
  const [validationError, setValidationError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setValidationError("");

    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedSpecialty = specialty.trim();

    if (!normalizedName) {
      setValidationError("Enter the user's full name.");
      return;
    }
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      setValidationError("Enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setValidationError("Temporary password must contain at least 6 characters.");
      return;
    }
    if (userType === "doctor" && !normalizedSpecialty) {
      setValidationError("Enter the doctor's speciality.");
      return;
    }

    await onSubmit({
      name: normalizedName,
      email: normalizedEmail,
      password,
      user_type: userType,
      system_role: systemRole,
      ...(userType === "doctor" ? { specialty: normalizedSpecialty } : {}),
    });
  }

  const visibleError = validationError || requestError;

  return (
    <form className="admin-add-user-form" onSubmit={(event) => void submit(event)} noValidate>
      {visibleError ? <p className="admin-form-error" role="alert">{visibleError}</p> : null}

      <div className="admin-form-grid">
        <label className="admin-form-field">
          <span>Full name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            disabled={submitting}
            required
            autoFocus
          />
        </label>

        <label className="admin-form-field">
          <span>Email address</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            disabled={submitting}
            required
          />
        </label>

        <label className="admin-form-field">
          <span>Temporary password</span>
          <input
            type="password"
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            disabled={submitting}
            required
          />
        </label>

        <div className="admin-form-field">
          <span id={accountTypeLabelId}>Account type</span>
          <AccountSelect
            ariaLabelledBy={accountTypeLabelId}
            options={accountTypeChoices}
            value={userType}
            onValueChange={(value) => setUserType(value as JornizAccountType)}
            disabled={submitting}
          />
        </div>

        <div className="admin-form-field">
          <span id={systemRoleLabelId}>Permissions</span>
          <AccountSelect
            ariaLabelledBy={systemRoleLabelId}
            options={canManageRoles ? USER_MANAGEMENT_ROLE_OPTIONS : systemRoleChoices.filter((option) => option.value === "member")}
            value={systemRole}
            onValueChange={(value) => setSystemRole(value as AdminSystemRole)}
            disabled={submitting}
          />
        </div>

        {userType === "doctor" ? (
          <div className="admin-form-field">
            <span id={specialtyLabelId}>Speciality</span>
            <EditableTextDropdown
              ariaLabelledBy={specialtyLabelId}
              value={specialty}
              options={DOCTOR_SPECIALTY_SUGGESTIONS}
              onValueChange={setSpecialty}
              placeholder="Search or enter a speciality"
              disabled={submitting}
              required
            />
          </div>
        ) : null}
      </div>

      <div className="admin-dialog-actions">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={submitting}>Cancel</Button>
        <Button type="submit" disabled={submitting}>{submitting ? "Adding user..." : "Add user"}</Button>
      </div>
    </form>
  );
}
