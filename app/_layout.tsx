import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "react-native";
import { PaperProvider } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { nordDark, nordLight } from "../constants/theme";
import { AuthProvider } from "../contexts/auth";
import { useRecovery } from "../hooks/useRecovery";
import "../services/location";

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 2,
			staleTime: 30_000,
		},
	},
});

export default function RootLayout() {
	const systemScheme = useColorScheme();
	const theme = systemScheme === "dark" ? nordDark : nordLight;

	useRecovery();

	return (
		<SafeAreaProvider>
			<PaperProvider theme={theme}>
				<QueryClientProvider client={queryClient}>
					<AuthProvider>
						<Stack screenOptions={{ headerShown: false }}>
							<Stack.Screen name="(auth)" />
							<Stack.Screen name="home" />
							<Stack.Screen name="maintenance" />
							<Stack.Screen name="dashboard" />
							<Stack.Screen name="record" />
							<Stack.Screen name="stats" />
							<Stack.Screen name="ride/[id]" />
							<Stack.Screen name="profile" />
						</Stack>
					</AuthProvider>
				</QueryClientProvider>
			</PaperProvider>
		</SafeAreaProvider>
	);
}
