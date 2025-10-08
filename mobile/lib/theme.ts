// Central theme tokens for Evania.
// Pastel + calm palette from design.

export const theme = {
  primary: "#8FA8A3",
  secondary: "#C7CEC9",
  accent: "#A4C4D9",
  background: "#F5F5F2",
  surface: "#D7D5D2",
  text: "#4B4B4B",

  success: "#e8dff5",
  alert: "#fce1e4",
  reward: "#fcf4dd",
  streak: "#ddedea",
  calmAura: "#daeaf6",
} as const;

export type Theme = typeof theme;

export const gradients = {
  xpBar: [theme.accent, theme.primary],
  button: [theme.primary, theme.accent],
};

export const radii = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 };
export const spacing = { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 };
export const shadow = {
  card: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
};
