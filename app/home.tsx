import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback } from "react";
import {
	ActivityIndicator,
	StyleSheet,
	useColorScheme,
	View,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyRides from "../components/EmptyRides";
import ErrorBanner from "../components/ErrorBanner";
import HomeHeader from "../components/HomeHeader";
import RideCard from "../components/RideCard";
import { useRidesOverview } from "../hooks/queries";

export default function HomeScreen() {
	const { colors } = useTheme();
	const scheme = useColorScheme();
	const insets = useSafeAreaInsets();

	const { rides, totalRides, stats, isLoading, isError, errorMessage, retry } =
		useRidesOverview(5);

	useFocusEffect(
		useCallback(() => {
			retry();
		}, [retry]),
	);

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<StatusBar
				style={scheme === "dark" ? "light" : "dark"}
				backgroundColor={colors.background}
			/>
			<HomeHeader
				totalRides={totalRides}
				totalKm={(stats?.totalKm ?? 0).toFixed(1)}
				totalHrs={((stats?.totalMin ?? 0) / 60).toFixed(1)}
			/>
			{isError && <ErrorBanner message={errorMessage} onRetry={retry} />}
			<View style={styles.sectionHeader}>
				<Text
					variant="titleMedium"
					style={{ color: colors.onBackground, fontWeight: "600" }}
				>
					Recent Rides
				</Text>
				{totalRides > 5 && (
					<Button
						mode="text"
						icon="chevron-right"
						contentStyle={{ flexDirection: "row-reverse" }}
						onPress={() => router.push("/dashboard")}
						textColor={colors.primary}
					>
						See all
					</Button>
				)}
			</View>
			{isLoading ? (
				<View style={styles.loading}>
					<ActivityIndicator size="large" color={colors.primary} />
				</View>
			) : rides.length === 0 ? (
				<View style={[styles.ridesList, { paddingBottom: insets.bottom }]}>
					<EmptyRides />
				</View>
			) : (
				<View style={[styles.ridesList, { paddingBottom: insets.bottom }]}>
					{rides.map((ride) => (
						<RideCard key={ride.id} ride={ride} />
					))}
				</View>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		marginBottom: 12,
	},
	ridesList: { flex: 1, paddingHorizontal: 24 },
	loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
