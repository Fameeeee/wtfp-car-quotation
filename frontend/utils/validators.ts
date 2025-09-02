export const phonePattern = /^[0-9]{10}$/;

export function isValidPhone(phone?: string) {
  if (!phone) return false;
  return phonePattern.test(phone);
}

export function sanitizePhone(input?: string) {
  if (!input) return '';
  return input.replace(/\D/g, '').slice(0, 10);
}
