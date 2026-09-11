import { requestJornizApi } from "../../../lib/api/requestJornizApi";

interface PasswordResetResponse {
  message: string;
  verified?: boolean;
}

function postPasswordReset(path: string, body: Record<string, string>) {
  return requestJornizApi<PasswordResetResponse>(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export function requestPasswordReset(email: string) {
  return postPasswordReset("/api/auth/forgot-password", {
    email: email.trim().toLowerCase(),
  });
}

export function verifyPasswordResetCode(email: string, otp: string) {
  return postPasswordReset("/api/auth/verify-otp", {
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
  });
}

export function finishPasswordReset(email: string, otp: string, newPassword: string) {
  return postPasswordReset("/api/auth/reset-password", {
    email: email.trim().toLowerCase(),
    otp: otp.trim(),
    new_password: newPassword,
  });
}
