import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { computeRideMetrics } from "../helpers/ride";
import { useIsStationary } from "../hooks/useIsStationary";
import type { RideData } from "../hooks/useRide";

interface Props {
	ride: RideData;
}

export default function RideExpandedStats({ ride }: Props) {
	const { colors } = useTheme();

	const stationary = useIsStationary();

	const { currentSpeed, maxSpeed, paceMinPerKm } = useMemo(
		() =>
			computeRideMetrics(
				ride.state.locations,
				ride.state.distance,
				ride.elapsed,
				"metric",
				stationary,
			),
		[ride.state.locations, ride.state.distance, ride.elapsed, stationary],
	);

	const eleGain = ride.state.elevationGain;
	const eleLoss = ride.state.elevationLoss;
	const maxEle =
		ride.state.maxElevation > -Infinity
			? Math.round(ride.state.maxElevation)
			: null;

	return (
		<>
			<View style={styles.grid}>
				<BigStat
					value={ride.distanceKm}
					label="kilometres"
					color={colors.primary}
				/>
				<BigStat
					value={ride.elapsedStr}
					label="elapsed"
					color={colors.onSurface}
				/>
				<BigStat
					value={ride.speedKmh}
					label="avg km/h"
					color={colors.onSurface}
				/>
			</View>

			<View style={[styles.divider, { backgroundColor: colors.outline }]} />

			<View style={styles.details}>
				<DetailRow
					label="Live speed"
					value={ride.isActive ? `${currentSpeed} km/h` : "—"}
					muted={colors.onSurfaceVariant}
				/>
				<DetailRow
					label="Max speed"
					value={maxSpeed > 0 ? `${maxSpeed.toFixed(1)} km/h` : "—"}
					muted={colors.onSurfaceVariant}
				/>
				<DetailRow
					label="Pace"
					value={paceMinPerKm !== "—" ? `${paceMinPerKm} /km` : "—"}
					muted={colors.onSurfaceVariant}
				/>
				<DetailRow
					label="Distance"
					value={`${ride.state.distance.toFixed(0)} m`}
					muted={colors.onSurfaceVariant}
				/>
				<DetailRow
					label="Elevation gain"
					value={eleGain > 0 ? `+${Math.round(eleGain)} m` : "—"}
					muted={colors.onSurfaceVariant}
				/>
				<DetailRow
					label="Elevation loss"
					value={eleLoss > 0 ? `−${Math.round(eleLoss)} m` : "—"}
					muted={colors.onSurfaceVariant}
				/>
				<DetailRow
					label="Max elevation"
					value={maxEle != null ? `${maxEle} m` : "—"}
					muted={colors.onSurfaceVariant}
				/>
				<DetailRow
					label="Track points"
					value={String(ride.state.locations.length)}
					muted={colors.onSurfaceVariant}
				/>
			</View>
		</>
	);
}

function BigStat({
	value,
	label,
	color,
}: {
	value: string;
	label: string;
	color: string;
}) {
	const { colors } = useTheme();
	return (
		<View style={styles.bigStat}>
			<Text
				variant="displaySmall"
				style={{ fontWeight: "800", color, textAlign: "center" }}
				numberOfLines={1}
				adjustsFontSizeToFit
			>
				{value}
			</Text>
			<Text
				variant="labelMedium"
				style={{ color: colors.onSurfaceVariant, textAlign: "center" }}
			>
				{label}
			</Text>
		</View>
	);
}

function DetailRow({
	label,
	value,
	muted,
}: {
	label: string;
	value: string;
	muted: string;
}) {
	return (
		<View style={styles.detailRow}>
			<Text variant="bodyMedium" style={{ color: muted }}>
				{label}
			</Text>
			<Text variant="bodyLarge" style={{ fontWeight: "600" }}>
				{value}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	grid: { flexDirection: "row", justifyContent: "space-evenly", gap: 8 },
	bigStat: { flex: 1, alignItems: "center", gap: 4 },
	divider: { height: 1, opacity: 0.15 },
	details: { gap: 14 },
	detailRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
});
