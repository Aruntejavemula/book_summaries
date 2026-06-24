// Brand palette (trademarks): Persian orange, sea mint, light cream, grey.
// Only these four hues across the entire app. All other tokens are
// tints/shades derived from these four. No white, no black, no red.

export type ThemeName = "light" | "dark";

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceElevated: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  borderStrong: string;
  primary: string;
  primaryText: string;
  accent: string; // Persian orange
  accentSoft: string;
  accentText: string;
  secondary: string; // sea mint
  secondarySoft: string;
  error: string;
  success: string;
  overlay: string;
}

const light: ThemeColors = {
  background: "#FBF7F0", // light cream
  surface: "#F4EEE1", // deeper cream (cards)
  surfaceElevated: "#FDFAF3", // lighter cream (floating elements)
  text: "#525252", // grey
  textSecondary: "#7C7C7C",
  textMuted: "#A6A6A6",
  border: "#E7E1D4", // cream-tinted border
  borderStrong: "#D7D0C0",
  primary: "#525252", // grey
  primaryText: "#FBF7F0", // cream on grey
  accent: "#D96F2E", // Persian orange
  accentSoft: "#F5DDC9",
  accentText: "#FBF7F0", // cream on orange
  secondary: "#7FB5A6", // sea mint
  secondarySoft: "#DCEBE6",
  error: "#D96F2E", // reuse orange (no red in palette)
  success: "#7FB5A6", // reuse mint
  overlay: "rgba(251, 247, 240, 0.55)" // cream dimmer for art backdrop
};

const dark: ThemeColors = {
  background: "#1F1B15", // deep warm dark (cream's counterpart)
  surface: "#2A251D",
  surfaceElevated: "#322C22",
  text: "#EDE7DB", // soft cream-grey
  textSecondary: "#B5AE9F",
  textMuted: "#807A6E",
  border: "#3C362C",
  borderStrong: "#4C4539",
  primary: "#EDE7DB",
  primaryText: "#1F1B15",
  accent: "#E0843C", // Persian orange, lifted for dark bg
  accentSoft: "#3A2A1C",
  accentText: "#1F1B15",
  secondary: "#8FC9B8", // sea mint, lifted for dark bg
  secondarySoft: "#1F2E29",
  error: "#E0843C",
  success: "#8FC9B8",
  overlay: "rgba(31, 27, 21, 0.72)"
};

const themes: Record<ThemeName, ThemeColors> = { light, dark };

// Default export keeps the existing `colors` import working app-wide (light theme).
export const colors: ThemeColors = light;

export function getTheme(name: ThemeName): ThemeColors {
  return themes[name];
}

export { light, dark };
