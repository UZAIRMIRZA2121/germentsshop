/** Lightweight form validators. Each returns an error message or "" when valid. */

export type FieldErrors<T extends string = string> = Partial<Record<T, string>>;

export function normalizeMobile(value: string): string {
  return value.replace(/[\s\-()]/g, "");
}

/** Accepts Pakistani mobile formats: 03XXXXXXXXX, +923XXXXXXXXX, 923XXXXXXXXX. */
export function isValidMobile(value: string): boolean {
  const v = normalizeMobile(value);
  return /^(?:\+92|92|0)3\d{9}$/.test(v);
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

export function validateFullName(value: string): string {
  const v = value.trim();
  if (!v) return "Full name is required.";
  if (v.length < 3) return "Please enter your full name (at least 3 characters).";
  if (!/^[\p{L}\s.'-]+$/u.test(v)) return "Name can only contain letters and spaces.";
  return "";
}

export function validateMobile(value: string, label = "Mobile number"): string {
  if (!value.trim()) return `${label} is required.`;
  if (!isValidMobile(value))
    return `Enter a valid Pakistani mobile number, e.g. 0300 1234567.`;
  return "";
}

export function validateOptionalEmail(value: string): string {
  if (!value.trim()) return "";
  return isValidEmail(value) ? "" : "Enter a valid email address.";
}

export function validateCity(value: string): string {
  const v = value.trim();
  if (!v) return "City is required.";
  if (v.length < 2) return "Please enter a valid city name.";
  return "";
}

export function validateAddress(value: string): string {
  const v = value.trim();
  if (!v) return "Delivery address is required.";
  if (v.length < 10)
    return "Please enter a complete address (house, street, area) — at least 10 characters.";
  return "";
}

/** Transaction / reference IDs from wallets & banks are 6–30 alphanumeric chars. */
export function validateTransactionId(value: string): string {
  const v = value.trim();
  if (!v) return "Transaction ID / reference number is required.";
  if (!/^[A-Za-z0-9\-_/]+$/.test(v))
    return "Transaction ID can only contain letters, numbers, - _ and /.";
  if (v.length < 6 || v.length > 30)
    return "Transaction ID must be between 6 and 30 characters.";
  if (/^(.)\1+$/.test(v)) return "This doesn't look like a valid transaction ID.";
  return "";
}

export function validateEmailRequired(value: string): string {
  if (!value.trim()) return "Email address is required.";
  return isValidEmail(value) ? "" : "Enter a valid email address.";
}

export function hasErrors(errors: Record<string, string | undefined>): boolean {
  return Object.values(errors).some(Boolean);
}

