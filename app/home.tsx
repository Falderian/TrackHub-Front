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
import HomeHeader from "../components/HomeHeader";
import RideCard from "../components/RideCard";
import { useRideStatsQuery, useRidesQuery } from "../hooks/queries";

export default function HomeScreen() {
	const { colors } = useTheme();
	const scheme = useColorScheme();
	const insets = useSafeAreaInsets();

	const { data: ridesRes, isLoading, refetch } = useRidesQuery({ pageSize: 5 });
	const { data: stats, refetch: refetchStats } = useRideStatsQuery();

	const rides = ridesRes?.data ?? [];
	const totalRides = ridesRes?.meta.total ?? 0;

	// Re-fetch when the screen gains focus (e.g. returning from record)
	useFocusEffect(
		useCallback(() => {
			refetch();
			refetchStats();
		}, [refetch, refetchStats]),
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
