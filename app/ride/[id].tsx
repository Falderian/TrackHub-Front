import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Icon, IconButton, Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RideChartPanel from "../../components/RideChartPanel";
import RideMap from "../../components/RideMap";
import RideStatsGrid from "../../components/RideStatsGrid";
import { api } from "../../services/api";
import type { ChartArrays } from "../../types";

function fmtDuration(totalSeconds: number): string {
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	if (h > 0) {
		return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	}
	return `${m}:${String(s).padStart(2, "0")}`;
}

function fmtPace(kmh: number): string {
	if (kmh < 0.5) return "—";
	const minPerKm = 60 / kmh;
	const min = Math.floor(minPerKm);
	const sec = Math.round((minPerKm - min) * 60);
	return `${min}:${String(sec).padStart(2, "0")}`;
}

export default function RideDetailScreen() {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [ride, setRide] = useState<{
		id: number;
		title: string | null;
		distance: number | null;
		avgSpeed: number | null;
		maxSpeed: number | null;
		elevationGain: number;
		elevationLoss: number;
		startTime: string;
		endTime: string | null;
		trackPoints: { latitude: number; longitude: number }[];
		chart: ChartArrays | null;
	} | null>(null);
	const [loading, setLoading] = useState(true);

	useFocusEffect(
		useCallback(() => {
			(async () => {
				try {
					const data = await api.getRide(Number(id));
					setRide(data as unknown as typeof ride);
				} catch {}
				setLoading(false);
			})();
		}, [id]),
	);

	const durSec = useMemo(() => {
		if (!ride?.startTime || !ride?.endTime) return null;
		return Math.round(
			(new Date(ride.endTime).getTime() - new Date(ride.startTime).getTime()) /
				1000,
		);
	}, [ride?.startTime, ride?.endTime]);

	const mid =
		ride?.trackPoints && ride.trackPoints.length > 0
			? ride.trackPoints[Math.floor(ride.trackPoints.length / 2)]
			: null;

	if (loading || !ride) {
		return (
			<View
				style={[
					styles.container,
					styles.centered,
					{ backgroundColor: colors.background },
				]}
			>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	const stats = [
		{
			icon: "map-marker-distance",
			value: `${(ride.distance ?? 0).toFixed(1)}`,
			unit: "km",
			highlight: true,
		},
		{
			icon: "clock-outline",
			value: durSec != null ? fmtDuration(durSec) : "—",
			unit: durSec != null && durSec >= 3600 ? "h:mm:ss" : "m:ss",
		},
		{
			icon: "speedometer",
			value: ride.avgSpeed != null ? `${ride.avgSpeed.toFixed(1)}` : "—",
			unit: "km/h avg",
		},
		{
			icon: "speedometer",
			value: ride.maxSpeed != null ? `${ride.maxSpeed.toFixed(1)}` : "—",
			unit: "km/h max",
		},
		{
			icon: "timer-outline",
			value: ride.avgSpeed != null ? fmtPace(ride.avgSpeed) : "—",
			unit: "min/km",
		},
		{
			icon: "arrow-up-bold",
			value: `${Math.round(ride.elevationGain)}`,
			unit: "m climb",
			highlight: ride.elevationGain > 0,
		},
	];

	const hasElevation = ride.elevationGain > 0 || ride.elevationLoss > 0;
	const hasCharts = ride.chart !== null;

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={styles.mapWrap}>
				<RideMap
					initialLat={mid?.latitude ?? 53.9}
					initialLon={mid?.longitude ?? 27.56}
					locations={ride.trackPoints}
				/>
				<View
					style={[styles.mapScrim, { height: insets.top }]}
					pointerEvents="none"
				/>
				<IconButton
					icon="arrow-left"
					size={22}
					iconColor={colors.onPrimary}
					style={[styles.backBtn, { top: insets.top + 4 }]}
					onPress={() => router.back()}
				/>
			</View>

			<ScrollView
				style={styles.body}
				contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
				showsVerticalScrollIndicator={false}
			>
				<Text
					variant="titleMedium"
					style={{
						color: colors.onBackground,
						fontWeight: "700",
						marginBottom: 16,
						paddingHorizontal: 20,
					}}
				>
					{ride.title}
				</Text>

				{hasCharts && ride.chart ? (
					<RideChartPanel chart={ride.chart} />
				) : (
					<View style={[styles.noChart, { backgroundColor: colors.surface }]}>
						<Icon
							source="chart-line"
							size={32}
							color={colors.onSurfaceVariant}
						/>
						<Text
							variant="bodyMedium"
							style={{ color: colors.onSurfaceVariant }}
						>
							No track data available for charts
						</Text>
					</View>
				)}

				<RideStatsGrid stats={stats} />

				{hasElevation && (
					<Surface
						style={[styles.elevationCard, { backgroundColor: colors.surface }]}
						elevation={1}
					>
						<View style={styles.elevationItem}>
							<Icon source="arrow-up-bold" size={20} color={colors.primary} />
							<View>
								<Text
									variant="labelLarge"
									style={{ color: colors.onSurface, fontWeight: "700" }}
								>
									+{Math.round(ride.elevationGain)}m
								</Text>
								<Text
									variant="labelSmall"
									style={{ color: colors.onSurfaceVariant }}
								>
									elevation gain
								</Text>
							</View>
						</View>
						<View
							style={[
								styles.elevationDivider,
								{ backgroundColor: colors.outline },
							]}
						/>
						<View style={styles.elevationItem}>
							<Icon source="arrow-down-bold" size={20} color={colors.error} />
							<View>
								<Text
									variant="labelLarge"
									style={{ color: colors.onSurface, fontWeight: "700" }}
								>
									−{Math.round(ride.elevationLoss)}m
								</Text>
								<Text
									variant="labelSmall"
									style={{ color: colors.onSurfaceVariant }}
								>
									elevation loss
								</Text>
							</View>
						</View>
					</Surface>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },
	mapWrap: { height: "35%" },
	mapScrim: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0,0,0,0.25)",
	},
	backBtn: {
		position: "absolute",
		left: 4,
		margin: 0,
	},
	body: { flex: 1, paddingTop: 20 },
	noChart: {
		marginHorizontal: 20,
		borderRadius: 16,
		padding: 32,
		alignItems: "center",
		gap: 8,
		marginBottom: 12,
	},
	elevationCard: {
		flexDirection: "row",
		alignItems: "center",
		marginHorizontal: 20,
		marginTop: 12,
		borderRadius: 14,
		padding: 16,
	},
	elevationItem: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
	},
	elevationDivider: { width: 1, height: 36, opacity: 0.3, marginHorizontal: 8 },
});
