import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import { Icon, IconButton, Surface, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RideMap from "../../components/RideMap";
import { api } from "../../services/api";
import type { Ride } from "../../types";

export default function RideDetailScreen() {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const { id } = useLocalSearchParams<{ id: string }>();
	const [ride, setRide] = useState<(Ride & { trackPoints: { latitude: number; longitude: number }[] }) | null>(null);
	const [loading, setLoading] = useState(true);

	useFocusEffect(
		useCallback(() => {
			(async () => {
				try {
					const data = await api.getRide(Number(id));
					setRide(data as typeof ride);
				} catch {}
				setLoading(false);
			})();
		}, [id]),
	);

	if (loading || !ride) {
		return (
			<View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	const dur =
		ride.startTime && ride.endTime
			? Math.round(
					(new Date(ride.endTime).getTime() -
						new Date(ride.startTime).getTime()) /
						60000,
				)
			: null;

	const mid =
		ride.trackPoints.length > 0
			? ride.trackPoints[Math.floor(ride.trackPoints.length / 2)]
			: null;

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={styles.mapWrap}>
				<RideMap
					initialLat={mid?.latitude ?? 53.9}
					initialLon={mid?.longitude ?? 27.56}
					locations={ride.trackPoints}
				/>
				<View style={[styles.mapScrim, { height: insets.top }]} pointerEvents="none" />
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
				contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
			>
				<Text
					variant="titleMedium"
					style={{ color: colors.onBackground, fontWeight: "700", marginBottom: 16 }}
				>
					{ride.title}
				</Text>

				<View style={styles.statsGrid}>
					<StatCard icon="map-marker-distance" value={`${(ride.distance ?? 0).toFixed(1)}`} unit="km" colors={colors} />
					<StatCard icon="clock-outline" value={dur != null ? `${dur}` : "—"} unit="min" colors={colors} />
					<StatCard icon="speedometer" value={ride.avgSpeed != null ? `${ride.avgSpeed.toFixed(1)}` : "—"} unit="km/h" colors={colors} />
					<StatCard icon="speedometer" value={ride.maxSpeed != null ? `${ride.maxSpeed.toFixed(1)}` : "—"} unit="max km/h" colors={colors} />
				</View>

				{(ride.elevationGain > 0 || ride.elevationLoss > 0) && (
					<View style={styles.elevationRow}>
						<View style={styles.elevationItem}>
							<Icon source="arrow-up-bold" size={18} color={colors.primary} />
							<Text variant="labelMedium" style={{ color: colors.onSurface }}>
								+{ride.elevationGain}m
							</Text>
						</View>
						<View style={styles.elevationItem}>
							<Icon source="arrow-down-bold" size={18} color={colors.error} />
							<Text variant="labelMedium" style={{ color: colors.onSurface }}>
								-{ride.elevationLoss}m
							</Text>
						</View>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

function StatCard({
	icon,
	value,
	unit,
	colors,
}: {
	icon: string;
	value: string;
	unit: string;
	colors: { surface: string; onSurface: string; primary: string; onSurfaceVariant: string };
}) {
	return (
		<Surface style={[styles.statCard, { backgroundColor: colors.surface }]} elevation={1}>
			<Icon source={icon} size={22} color={colors.primary} />
			<Text variant="titleLarge" style={[styles.statValue, { color: colors.onSurface }]}>
				{value}
			</Text>
			<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
				{unit}
			</Text>
		</Surface>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },
	mapWrap: { height: "40%" },
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
	body: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
	statsGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginBottom: 16,
	},
	statCard: {
		flex: 1,
		minWidth: "45%",
		borderRadius: 14,
		padding: 16,
		alignItems: "center",
		gap: 4,
	},
	statValue: { fontWeight: "800" },
	elevationRow: {
		flexDirection: "row",
		gap: 24,
		justifyContent: "center",
	},
	elevationItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
});
