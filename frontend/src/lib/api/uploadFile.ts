import { requestJornizApi } from "./requestJornizApi";

export function uploadFileToJorniz<T>(
  path: string,
  fieldName: string,
  file: File,
  values: Record<string, string> = {},
): Promise<T> {
  const form = new FormData();
  Object.entries(values).forEach(([name, value]) => form.append(name, value));
  form.append(fieldName, file);
  return requestJornizApi<T>(path, { method: "POST", body: form });
}
