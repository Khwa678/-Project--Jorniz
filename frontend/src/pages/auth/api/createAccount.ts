import { requestJornizApi } from "../../../lib/api/requestJornizApi";
import type { AccountAccessResult, CreateAccountInput } from "../types";

export async function createAccount(
  account: CreateAccountInput,
): Promise<AccountAccessResult> {
  const form = new FormData();
  form.append("name", account.name.trim());
  form.append("email", account.email.trim().toLowerCase());
  form.append("password", account.password);
  form.append("user_type", account.userType);

  if (account.userType === "doctor") {
    form.append("specialty", account.specialty);
    form.append("hospital", account.organization.trim());
  } else if (account.userType === "seller") {
    form.append("store_name", account.organization.trim());
  } else if (
    ["recruiter", "advertiser", "pharmacy_partner", "diagnostic_partner"].includes(
      account.userType,
    )
  ) {
    form.append("company_name", account.organization.trim());
  }

  if (account.verificationDocument) {
    form.append("verification_doc", account.verificationDocument);
  }

  return requestJornizApi<AccountAccessResult>("/api/auth/signup", {
    method: "POST",
    body: form,
  });
}
