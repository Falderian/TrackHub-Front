import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	RefreshControl,
	ScrollView,
	StyleSheet,
	useColorScheme,
	View,
} from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyRides from "../components/EmptyRides";
import ErrorBanner from "../components/ErrorBanner";
import HomeHeader from "../components/HomeHeader";
import MaintenanceAlert from "../components/MaintenanceAlert";
import RideCard from "../components/RideCard";
import { SkeletonHome } from "../components/SkeletonLoader";
import { getWeekRange } from "../helpers/date";
import {
	useMaintenanceSummaryQuery,
	useRideStatsQuery,
	useRidesOverview,
} from "../hooks/queries";
import {
	clearLocalRides,
	type LocalRide,
	loadLocalRides,
	toRide,
} from "../services/local-rides";

export default function HomeScreen() {
	const { colors } = useTheme();
	const scheme = useColorScheme();
	const insets = useSafeAreaInsets();

	const {
		rides,
		totalRides,
		stats,
		isLoading,
		isRefetching,
		isStale,
		isError,
		errorMessage,
		retry,
	} = useRidesOverview(5);

	const summary = useMaintenanceSummaryQuery();

	const weekRange = useMemo(() => getWeekRange(), []);
	const weeklyStats = useRideStatsQuery(weekRange.from, weekRange.to);

	const weeklyActivityLine = useMemo(() => {
		const n = weeklyStats.data?.totalRides ?? 0;
		if (n === 0) return "No rides this week yet";
		if (n === 1) return "1 ride so far this week";
		return `${n} rides so far this week`;
	}, [weeklyStats.data?.totalRides]);

	const [localRides, setLocalRides] = useState<LocalRide[]>([]);

	// Load local rides when API fails
	useEffect(() => {
		if (isError) {
			loadLocalRides()
				.then(setLocalRides)
				.catch(() => {});
		}
	}, [isError]);

	// Clear local rides when API succeeds (they've been synced)
	useEffect(() => {
		if (!isLoading && !isError && rides.length > 0) {
			clearLocalRides().catch(() => {});
			setLocalRides([]);
		}
	}, [isLoading, isError, rides.length]);

	useFocusEffect(
		useCallback(() => {
			if (isStale) retry();
		}, [retry, isStale]),
	);

	const displayRides =
		isError && rides.length === 0 ? localRides.map(toRide) : rides;
	const showOfflineLabel = isError && localRides.length > 0;

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<StatusBar
				style={scheme === "dark" ? "light" : "dark"}
				backgroundColor={colors.background}
			/>
			<HomeHeader
				totalRides={totalRides || localRides.length}
				totalKm={(stats?.totalKm ?? 0).toFixed(1)}
				totalHrs={((stats?.totalMin ?? 0) / 60).toFixed(1)}
			/>
			<MaintenanceAlert statuses={summary.data ?? []} />
			{showOfflineLabel && (
				<ErrorBanner
					message="You are offline. Showing rides saved on this device."
					onRetry={retry}
				/>
			)}
			{isError && !showOfflineLabel && (
				<ErrorBanner message={errorMessage} onRetry={retry} />
			)}
			<ScrollView
				style={styles.scroll}
				contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl
						refreshing={isRefetching}
						onRefresh={retry}
						colors={[colors.primary]}
						tintColor={colors.primary}
					/>
				}
			>
				<View style={styles.sectionHeader}>
					<View>
						<Text
							variant="titleMedium"
							style={{
								color: colors.onBackground,
								fontWeight: "600",
							}}
						>
							{showOfflineLabel ? "Recent Rides (offline)" : "Recent Rides"}
						</Text>
						<Text variant="bodySmall" style={{ color: colors.primary }}>
							{weeklyActivityLine}
						</Text>
					</View>
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
					<SkeletonHome />
				) : displayRides.length === 0 ? (
					<View style={styles.ridesList}>
						<EmptyRides />
					</View>
				) : (
					<View style={styles.ridesList}>
						{displayRides.slice(0, 5).map((ride) => (
							<RideCard key={ride.id} ride={ride} />
						))}
					</View>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	scroll: { flex: 1 },
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		marginBottom: 12,
	},
	ridesList: { paddingHorizontal: 24 },
});
