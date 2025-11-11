/**
 * Format Philippine mobile numbers
 * Supports formats:
 * - 09XX-XXX-XXXX (11 digits)
 * - +63 9XX XXX XXXX (12 digits)
 * - 9XX-XXX-XXXX (10 digits)
 */
export const formatPhoneNumber = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Handle different formats
  if (digits.startsWith('63')) {
    // Format: +63 9XX XXX XXXX
    const limited = digits.slice(0, 12); // Limit to 12 digits
    if (limited.length <= 2) return `+${limited}`;
    if (limited.length <= 5) return `+${limited.slice(0, 2)} ${limited.slice(2)}`;
    if (limited.length <= 8) return `+${limited.slice(0, 2)} ${limited.slice(2, 5)} ${limited.slice(5)}`;
    return `+${limited.slice(0, 2)} ${limited.slice(2, 5)} ${limited.slice(5, 8)} ${limited.slice(8)}`;
  } else if (digits.startsWith('09')) {
    // Format: 09XX-XXX-XXXX
    const limited = digits.slice(0, 11); // Limit to 11 digits
    if (limited.length <= 4) return limited;
    if (limited.length <= 7) return `${limited.slice(0, 4)}-${limited.slice(4)}`;
    return `${limited.slice(0, 4)}-${limited.slice(4, 7)}-${limited.slice(7)}`;
  } else if (digits.startsWith('9')) {
    // Format: 9XX-XXX-XXXX
    const limited = digits.slice(0, 10); // Limit to 10 digits
    if (limited.length <= 3) return limited;
    if (limited.length <= 6) return `${limited.slice(0, 3)}-${limited.slice(3)}`;
    return `${limited.slice(0, 3)}-${limited.slice(3, 6)}-${limited.slice(6)}`;
  } else {
    // Default: just limit to 11 digits
    return digits.slice(0, 11);
  }
};

/**
 * Validate Philippine mobile number
 * Returns true if valid
 */
export const validatePhoneNumber = (phone) => {
  if (!phone || !phone.trim()) return false;

  const digitsOnly = phone.replace(/\D/g, '');

  // Check for valid Philippine mobile formats
  return (
    /^09\d{9}$/.test(digitsOnly) ||      // 09XX-XXX-XXXX
    /^639\d{9}$/.test(digitsOnly) ||     // +639XX-XXX-XXXX
    /^9\d{9}$/.test(digitsOnly)          // 9XX-XXX-XXXX
  );
};

/**
 * Get phone validation error message
 */
export const getPhoneErrorMessage = () => {
  return 'Invalid Philippine mobile number. Use format: 09XX-XXX-XXXX';
};
