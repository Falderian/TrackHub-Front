import { Stack } from "expo-router";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { nordDark, nordLight } from "../constants/theme";
import { AuthProvider } from "../contexts/auth";
import "../services/location";

export default function RootLayout() {
	const systemScheme = useColorScheme();
	const theme = systemScheme === "dark" ? nordDark : nordLight;

	return (
		<SafeAreaProvider>
			<PaperProvider theme={theme}>
				<AuthProvider>
					<Stack screenOptions={{ headerShown: false }}>
						<Stack.Screen name="(auth)" />
						<Stack.Screen name="home" />
						<Stack.Screen name="dashboard" />
						<Stack.Screen name="record" />
					</Stack>
				</AuthProvider>
			</PaperProvider>
		</SafeAreaProvider>
	);
}
