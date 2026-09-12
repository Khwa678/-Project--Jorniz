import type { JornizAccountType } from "../types";
import { AccountSelect } from "./AccountSelect";

const specialties = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Pediatrics",
  "Orthopedics",
  "Gynecology",
  "Neurology",
  "Psychiatry",
  "Dentistry",
  "Physiotherapy",
  "Psychology",
  "Nutrition",
  "Other",
];

const organizationLabels: Partial<Record<JornizAccountType, string>> = {
  doctor: "Hospital or Clinic",
  recruiter: "Company",
  seller: "Store Name",
  pharmacy_partner: "Pharmacy Name",
  diagnostic_partner: "Diagnostic Centre",
  advertiser: "Company",
};

export interface ProfessionalVerificationFieldsProps {
  accountType: JornizAccountType;
  specialty: string;
  organization: string;
  documentRequired: boolean;
  onSpecialtyChange: (specialty: string) => void;
  onOrganizationChange: (organization: string) => void;
  onVerificationDocumentChange: (document: File | null) => void;
}

export function ProfessionalVerificationFields({
  accountType,
  specialty,
  organization,
  documentRequired,
  onSpecialtyChange,
  onOrganizationChange,
  onVerificationDocumentChange,
}: ProfessionalVerificationFieldsProps) {
  const organizationLabel = organizationLabels[accountType];

  return (
    <>
      {accountType === "doctor" ? (
        <div className="account-field">
          <span id="professional-specialty-label">Specialization</span>
          <AccountSelect
            ariaLabelledBy="professional-specialty-label"
            options={specialties.map((value) => ({ label: value, value }))}
            value={specialty}
            onValueChange={onSpecialtyChange}
          />
        </div>
      ) : null}

      {organizationLabel ? (
        <label className="account-field">
          <span>{organizationLabel}</span>
          <input
            value={organization}
            onChange={(event) => onOrganizationChange(event.target.value)}
            placeholder={`Enter ${organizationLabel.toLowerCase()}`}
            autoComplete="organization"
          />
        </label>
      ) : null}

      {documentRequired ? (
        <label className="account-field">
          <span>Professional certificate</span>
          <input
            type="file"
            required
            accept=".pdf,.jpg,.jpeg,.png,.webp"
            onChange={(event) =>
              onVerificationDocumentChange(event.target.files?.[0] ?? null)
            }
          />
          <small>Your account will remain pending until the document is reviewed.</small>
        </label>
      ) : null}
    </>
  );
}
