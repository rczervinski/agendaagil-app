/**
 * Phone number utility functions for Brazilian phone numbers
 */

export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Handle different lengths
  if (cleaned.length === 11) {
    // Mobile: (11) 99999-9999
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 10) {
    // Landline: (11) 9999-9999
    return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
  }
  
  // Return as-is if format doesn't match expected patterns
  return cleaned;
}

export function unformatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters to get clean number
  return phone.replace(/\D/g, '');
}

export function isValidBrazilianPhone(phone: string): boolean {
  const cleaned = unformatPhoneNumber(phone);
  
  // Brazilian mobile numbers: 11 digits (area code + 9 + 8 digits)
  // Brazilian landline: 10 digits (area code + 7-8 digits)
  return cleaned.length === 10 || cleaned.length === 11;
}

export function formatPhoneForDisplay(phone: string): string {
  return formatPhoneNumber(phone);
}

export function formatPhoneForStorage(phone: string): string {
  return unformatPhoneNumber(phone);
}