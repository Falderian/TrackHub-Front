import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const nordDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#bf616a",
    onPrimary: "#ffffff",
    primaryContainer: "#4c1a20",
    onPrimaryContainer: "#ffdad9",
    secondary: "#81a1c1",
    onSecondary: "#1a2635",
    secondaryContainer: "#2d3f52",
    onSecondaryContainer: "#c8ddf5",
    background: "#2e3440",
    onBackground: "#eceff4",
    surface: "#3b4252",
    onSurface: "#eceff4",
    surfaceVariant: "#4c566a",
    onSurfaceVariant: "#c4c9d4",
    outline: "#8b8f99",
    error: "#bf616a",
    elevation: {
      level0: "#2e3440",
      level1: "#323846",
      level2: "#363c4d",
      level3: "#3a4053",
      level4: "#3c4256",
      level5: "#3e445a",
    },
  },
};

const nordLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#bf616a",
    onPrimary: "#ffffff",
    primaryContainer: "#ffdad9",
    onPrimaryContainer: "#4c1a20",
    secondary: "#5e81ac",
    onSecondary: "#ffffff",
    secondaryContainer: "#d4e3f7",
    onSecondaryContainer: "#1a2635",
    background: "#eceff4",
    onBackground: "#2e3440",
    surface: "#e5e9f0",
    onSurface: "#2e3440",
    surfaceVariant: "#d8dee9",
    onSurfaceVariant: "#4c566a",
    outline: "#6e7482",
    error: "#bf616a",
    elevation: {
      level0: "#eceff4",
      level1: "#e3e7ed",
      level2: "#dbdfe7",
      level3: "#d3d7e1",
      level4: "#cdd1db",
      level5: "#c9cdd7",
    },
  },
};

export { nordDark, nordLight };
