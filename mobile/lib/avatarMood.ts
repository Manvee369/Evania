import { theme } from "./theme";

export type EviMood = "happy" | "calm" | "tired" | "encouraging" | "sad";

export const moodAura: Record<EviMood, string> = {
  happy:       theme.reward,
  calm:        theme.streak,
  tired:       theme.calmAura,
  encouraging: theme.success,
  sad:         theme.alert,
};
