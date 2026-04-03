// Theme colors
export const COLORS = {
  // Primary
  primary: "#1565C0",

  // Background
  background: "#0a0a0a",
  backgroundSecondary: "#1a1a1a",
  backgroundTertiary: "#262626",

  // Text
  textPrimary: "#ffffff",
  textSecondary: "#999999",
  textTertiary: "#666666",

  // Status
  success: "#4CAF50",
  error: "#ff5252",
  warning: "#FFC107",
  info: "#1565C0",

  // Semantic
  border: "#262626",
  overlay: "rgba(0, 0, 0, 0.5)",
};

// Card colors
export const CARD_COLORS = [
  "#8B4513", // Brown - Coffee
  "#2E7D32", // Green - Grocery
  "#1565C0", // Blue - General
  "#C62828", // Red - Premium
  "#FF6F00", // Orange - Rewards
  "#6A1B9A", // Purple - Exclusive
  "#00796B", // Teal - Emerald
  "#E65100", // Deep Orange - Special
];

// Barcode types
export const BARCODE_TYPES = ["QR", "CODE128", "CODE39", "EAN13"] as const;

// Animation presets
export const ANIMATION_SPRING = {
  damping: 10,
  mass: 1,
  overshootClamping: false,
};

export const ANIMATION_SPRING_STIFF = {
  damping: 15,
  mass: 0.8,
  overshootClamping: true,
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

// Border radius
export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

// Shadows
export const SHADOWS = {
  sm: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 1,
  },
  md: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 3,
  },
  lg: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  xl: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
};
