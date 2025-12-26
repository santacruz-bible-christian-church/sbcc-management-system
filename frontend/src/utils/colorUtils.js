/**
 * Generates a consistent, visually pleasing color from any ID or string.
 * The same input will always produce the same color.
 */

// HSL-based color generation for better visual variety
export const generateColorFromId = (id) => {
  // Use a simple hash for strings or use number directly
  const numericId = typeof id === 'string'
    ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : id;

  // Generate hue using golden ratio for good distribution (0-360)
  const goldenRatio = 0.618033988749895;
  const hue = ((numericId * goldenRatio) % 1) * 360;

  // Keep saturation and lightness in pleasing ranges
  // Saturation: 65-75% for vibrant but not oversaturated colors
  // Lightness: 45-55% for readable colors
  const saturation = 65 + (numericId % 10);
  const lightness = 45 + (numericId % 10);

  return `hsl(${Math.round(hue)}, ${saturation}%, ${lightness}%)`;
};

// Convert HSL to Hex for APIs that need hex colors
export const generateHexFromId = (id) => {
  const numericId = typeof id === 'string'
    ? id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    : id;

  const goldenRatio = 0.618033988749895;
  const hue = ((numericId * goldenRatio) % 1) * 360;
  const saturation = 65 + (numericId % 10);
  const lightness = 45 + (numericId % 10);

  // Convert HSL to RGB
  const s = saturation / 100;
  const l = lightness / 100;
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((hue / 60) % 2 - 1));
  const m = l - c / 2;

  let r, g, b;
  if (hue < 60) { r = c; g = x; b = 0; }
  else if (hue < 120) { r = x; g = c; b = 0; }
  else if (hue < 180) { r = 0; g = c; b = x; }
  else if (hue < 240) { r = 0; g = x; b = c; }
  else if (hue < 300) { r = x; g = 0; b = c; }
  else { r = c; g = 0; b = x; }

  const toHex = (n) => Math.round((n + m) * 255).toString(16).padStart(2, '0');
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Get contrasting text color (black or white) for a given background
export const getContrastColor = (hexColor) => {
  // Remove # if present
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);

  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#000000' : '#FFFFFF';
};

export default generateColorFromId;
