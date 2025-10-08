// Central theme tokens for Evania.


export const theme = {
  // Core UI
  primary:   "#8FA8A3", // Drizzle (calm teal)
  secondary: "#C7CEC9", // light sage
  accent:    "#A4C4D9", // pop blue
  background:"#F5F5F2", // Spare White
  surface:   "#D7D5D2", // card / containers
  text:      "#4B4B4B", // readable dark gray (slightly darker than Rushing River)

  // Feedback / gamified accents
  success:   "#e8dff5", // lavender
  alert:     "#fce1e4", // soft rose
  reward:    "#fcf4dd", // butter (level-up glow)
  streak:    "#ddedea", // mint
  calmAura:  "#daeaf6", // baby blue
} as const;

export type Theme = typeof theme;

/** small helpers */
export const gradients = {
  xpBar: [theme.accent, theme.primary],      // left→right gradient
  button: [theme.primary, theme.accent],
};

export const radii = {
  xs: 6, sm: 10, md: 14, lg: 18, xl: 24,
};

export const spacing = {
  xs: 6, sm: 10, md: 14, lg: 18, xl: 24,
};

export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};
