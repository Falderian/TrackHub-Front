import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { nordDark, nordLight } from "../constants/theme";
import { AuthProvider } from "../contexts/auth";
import "../services/location";

export default function RootLayout() {
	const scheme = useColorScheme();
	const theme = scheme === "dark" ? nordDark : nordLight;

	return (
		<PaperProvider theme={theme}>
			<AuthProvider>
				<Stack screenOptions={{ headerShown: false }}>
					<Stack.Screen name="(auth)" />
					<Stack.Screen name="home" />
					<Stack.Screen name="record" />
				</Stack>
			</AuthProvider>
		</PaperProvider>
	);
}
