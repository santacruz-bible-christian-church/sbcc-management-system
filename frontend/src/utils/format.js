/**
 * Philippines timezone for date formatting
 */
const PH_TIMEZONE = 'Asia/Manila';

/**
 * Safely parse a date value
 * @param {string|Date} value - Date value to parse
 * @returns {Date|null} Parsed date or null if invalid
 */
export const safeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

/**
 * Format a date/datetime for display (Philippines timezone)
 * @param {string|Date} value - Date value to format
 * @returns {string} Formatted date string
 */
export const formatDateTime = (value) => {
  const date = safeDate(value);
  if (!date) return 'N/A';

  return date.toLocaleString('en-PH', {
    timeZone: PH_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  });
};

/**
 * Format a date (without time) for display (Philippines timezone)
 * @param {string|Date} value - Date value to format
 * @returns {string} Formatted date string
 */
export const formatDate = (value) => {
  const date = safeDate(value);
  if (!date) return 'N/A';

  return date.toLocaleDateString('en-PH', {
    timeZone: PH_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * Format a date for input fields (YYYY-MM-DD)
 * @param {string|Date} value - Date value to format
 * @returns {string} Formatted date string for input
 */
export const formatDateInput = (value) => {
  const date = safeDate(value);
  if (!date) return '';

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
};

/**
 * Format a datetime for input fields (YYYY-MM-DDTHH:mm)
 * @param {string|Date} value - Date value to format
 * @returns {string} Formatted datetime string for input
 */
export const formatDateTimeInput = (value) => {
  const date = safeDate(value);
  if (!date) return '';

  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

/**
 * Format relative time (e.g., "2 hours ago", "3 days ago")
 * @param {string|Date} value - Date value to format
 * @returns {string} Relative time string
 */
export const formatRelativeTime = (value) => {
  const date = safeDate(value);
  if (!date) return 'N/A';

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? 's' : ''} ago`;
  if (diffDay < 30) {
    const weeks = Math.floor(diffDay / 7);
    return `${weeks} week${weeks !== 1 ? 's' : ''} ago`;
  }
  if (diffDay < 365) {
    const months = Math.floor(diffDay / 30);
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }
  const years = Math.floor(diffDay / 365);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

/**
 * Format currency (USD)
 * @param {number} value - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

/**
 * Format phone number
 * @param {string} value - Phone number to format
 * @returns {string} Formatted phone number
 */
export const formatPhone = (value) => {
  if (!value) return '';

  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '');

  // Format as (XXX) XXX-XXXX
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

  // Return original if not 10 digits
  return value;
};

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length before truncation
 * @returns {string} Truncated text
 */
export const truncate = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '…';
};
