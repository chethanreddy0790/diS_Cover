import { DarkTheme, DefaultTheme, Theme as NavigationTheme } from "@react-navigation/native";
import {
  MD3DarkTheme,
  MD3LightTheme,
  MD3Theme,
  adaptNavigationTheme,
} from "react-native-paper";

const { LightTheme: navigationLight, DarkTheme: navigationDark } = adaptNavigationTheme({
  reactNavigationLight: DefaultTheme,
  reactNavigationDark: DarkTheme,
});

export const appSpacing = {
  xs: 6,
  sm: 10,
  md: 16,
  lg: 24,
  xl: 32,
};

export const appRadii = {
  sm: 12,
  md: 18,
  lg: 24,
  pill: 999,
};

interface BuiltTheme {
  paperTheme: MD3Theme;
  navigationTheme: NavigationTheme;
  statusBarStyle: "dark" | "light";
}

const lightPalette = {
  primary: "#2563EB",
  onPrimary: "#FFFFFF",
  primaryContainer: "#DCE9FF",
  onPrimaryContainer: "#0C2F78",
  secondary: "#0F766E",
  onSecondary: "#FFFFFF",
  secondaryContainer: "#D7F5F2",
  onSecondaryContainer: "#0B3D39",
  tertiary: "#EA580C",
  onTertiary: "#FFFFFF",
  tertiaryContainer: "#FFE4D3",
  onTertiaryContainer: "#7B341E",
  error: "#B91C1C",
  background: "#F4F7FB",
  onBackground: "#0F172A",
  surface: "#FFFFFF",
  onSurface: "#0F172A",
  surfaceVariant: "#E8EEF8",
  onSurfaceVariant: "#475569",
  outline: "#B8C2D6",
  outlineVariant: "#D8E0EE",
  elevation: {
    level0: "transparent",
    level1: "#FFFFFF",
    level2: "#F7FAFF",
    level3: "#EEF4FF",
    level4: "#E7F0FF",
    level5: "#DFEAFF",
  },
};

const darkPalette = {
  primary: "#7CB2FF",
  onPrimary: "#0F284C",
  primaryContainer: "#173869",
  onPrimaryContainer: "#D8E8FF",
  secondary: "#73D6CD",
  onSecondary: "#073A36",
  secondaryContainer: "#0D4F49",
  onSecondaryContainer: "#C6F4EF",
  tertiary: "#FFB68A",
  onTertiary: "#5B2406",
  tertiaryContainer: "#7A330F",
  onTertiaryContainer: "#FFDCC6",
  error: "#F87171",
  background: "#09111F",
  onBackground: "#E2E8F0",
  surface: "#0F172A",
  onSurface: "#E2E8F0",
  surfaceVariant: "#172338",
  onSurfaceVariant: "#AAB6CC",
  outline: "#5C6B85",
  outlineVariant: "#22304A",
  elevation: {
    level0: "transparent",
    level1: "#101A2E",
    level2: "#13213A",
    level3: "#172947",
    level4: "#1B3256",
    level5: "#203A62",
  },
};

export const buildAppTheme = (scheme: "light" | "dark"): BuiltTheme => {
  const isDark = scheme === "dark";
  const colors = isDark ? darkPalette : lightPalette;

  const paperTheme: MD3Theme = {
    ...(isDark ? MD3DarkTheme : MD3LightTheme),
    colors: {
      ...(isDark ? MD3DarkTheme.colors : MD3LightTheme.colors),
      ...colors,
    },
    roundness: 20,
  };

  const navigationTheme: NavigationTheme = {
    ...(isDark ? navigationDark : navigationLight),
    colors: {
      ...(isDark ? navigationDark.colors : navigationLight.colors),
      primary: colors.primary,
      background: colors.background,
      card: colors.surface,
      text: colors.onSurface,
      border: colors.outlineVariant,
      notification: colors.tertiary,
    },
  };

  return {
    paperTheme,
    navigationTheme,
    statusBarStyle: isDark ? "light" : "dark",
  };
};
