import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";

const trackHubDark = {
	...MD3DarkTheme,
	colors: {
		...MD3DarkTheme.colors,
		// Primary: blue — matches backend --primary
		primary: "#3b82f6",
		onPrimary: "#ffffff",
		primaryContainer: "#1e3a5f",
		onPrimaryContainer: "#93c5fd",
		// Secondary: accent blue — matches backend --accent
		secondary: "#60a5fa",
		onSecondary: "#0c1a2e",
		secondaryContainer: "#1a3760",
		onSecondaryContainer: "#bfdbfe",
		// Tertiary: green — matches backend --green (active/recording)
		tertiary: "#34d399",
		onTertiary: "#052e16",
		tertiaryContainer: "#064e23",
		onTertiaryContainer: "#a7f3d0",
		// Error: red — matches backend --red
		error: "#ef4444",
		onError: "#ffffff",
		errorContainer: "#4c1d1d",
		onErrorContainer: "#fecaca",
		// Surfaces — matches backend --bg, --surface, --border, --text, --muted
		background: "#1c1c1c",
		onBackground: "#f5f5f5",
		surface: "#282828",
		onSurface: "#f5f5f5",
		surfaceVariant: "#383838",
		onSurfaceVariant: "#a0a0a0",
		outline: "#525252",
		outlineVariant: "#383838",
		// Elevation — derived from background with incremental lightening
		elevation: {
			level0: "#1c1c1c",
			level1: "#222222",
			level2: "#282828",
			level3: "#2e2e2e",
			level4: "#333333",
			level5: "#383838",
		},
		// Custom semantic colors — matches backend --orange (paused/warning)
		warning: "#f59e0b",
		onWarning: "#261a02",
		warningContainer: "#2e2612",
		onWarningContainer: "#fde68a",
	},
};

const trackHubLight = {
	...MD3LightTheme,
	colors: {
		...MD3LightTheme.colors,
		// Primary: blue — matches backend --primary
		primary: "#3b82f6",
		onPrimary: "#ffffff",
		primaryContainer: "#dbeafe",
		onPrimaryContainer: "#1e3a5f",
		// Secondary: accent blue — matches backend --accent (light)
		secondary: "#2563eb",
		onSecondary: "#ffffff",
		secondaryContainer: "#dbeafe",
		onSecondaryContainer: "#0c1a2e",
		// Tertiary: green — matches backend --green (light, active/recording)
		tertiary: "#16a34a",
		onTertiary: "#ffffff",
		tertiaryContainer: "#dcfce7",
		onTertiaryContainer: "#052e16",
		// Error: red — matches backend --red (light)
		error: "#dc2626",
		onError: "#ffffff",
		errorContainer: "#fee2e2",
		onErrorContainer: "#4c1d1d",
		// Surfaces — matches backend --bg, --surface, --border, --text, --muted (light)
		background: "#fafafa",
		onBackground: "#171717",
		surface: "#ffffff",
		onSurface: "#171717",
		surfaceVariant: "#e5e5e5",
		onSurfaceVariant: "#737373",
		outline: "#d4d4d4",
		outlineVariant: "#e5e5e5",
		// Elevation — derived from background with incremental darkening
		elevation: {
			level0: "#fafafa",
			level1: "#f2f2f2",
			level2: "#ededed",
			level3: "#e8e8e8",
			level4: "#e3e3e3",
			level5: "#e0e0e0",
		},
		// Custom semantic colors — matches backend --orange (light, paused/warning)
		warning: "#d97706",
		onWarning: "#ffffff",
		warningContainer: "#fffbeb",
		onWarningContainer: "#78350f",
	},
};

export { trackHubDark, trackHubLight };
