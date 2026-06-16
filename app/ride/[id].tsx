import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";
import {
	Button,
	Dialog,
	Icon,
	IconButton,
	Portal,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RideChartPanel from "../../components/RideChartPanel";
import RideMap from "../../components/RideMap";
import RideStatsGrid from "../../components/RideStatsGrid";
import { fmtPace, fmtTime } from "../../helpers/ride";
import { api } from "../../services/api";
import type { ChartArrays } from "../../types";

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
	const [deleting, setDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

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

	const handleDelete = useCallback(async () => {
		setDeleting(true);
		try {
			await api.deleteRide(Number(id));
		} catch {
		} finally {
			setShowDeleteDialog(false);
			setDeleting(false);
			router.back();
		}
	}, [id]);

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
			value: durSec != null ? fmtTime(durSec) : "—",
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
			</View>

			<ScrollView
				style={styles.body}
				contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.titleRow}>
					<IconButton
						icon="arrow-left"
						size={20}
						iconColor={colors.primary}
						style={styles.titleBtn}
						onPress={() => router.back()}
					/>
					<Text
						variant="titleMedium"
						style={{
							color: colors.onBackground,
							fontWeight: "700",
							textAlign: "center",
							flex: 1,
						}}
						numberOfLines={2}
					>
						{ride.title}
					</Text>
					<IconButton
						icon="delete"
						size={20}
						iconColor={colors.error}
						style={styles.titleBtn}
						onPress={() => setShowDeleteDialog(true)}
						disabled={deleting}
					/>
				</View>

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

			<Portal>
				<Dialog
					visible={showDeleteDialog}
					onDismiss={() => setShowDeleteDialog(false)}
				>
					<Dialog.Title>Delete ride?</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">
							This will permanently delete this ride and all its track data.
							This action cannot be undone.
						</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setShowDeleteDialog(false)}>Cancel</Button>
						<Button
							onPress={handleDelete}
							loading={deleting}
							textColor={colors.error}
						>
							Delete
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
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
	body: { flex: 1, paddingTop: 20 },
	titleRow: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 12,
		marginBottom: 16,
	},
	titleBtn: {
		margin: 0,
		width: 36,
		height: 36,
	},
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
