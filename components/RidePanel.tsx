import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import {
	Button,
	IconButton,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import type { RideData } from "../hooks/useRide";
import type { RideMapHandle } from "./RideMap";

interface Props {
	ride: RideData;
	mapRef: React.RefObject<RideMapHandle | null>;
}

export default function RidePanel({ ride, mapRef }: Props) {
	const { colors } = useTheme();
	const {
		isIdle,
		isActive,
		isPaused,
		distanceKm,
		elapsedStr,
		speedKmh,
		pause,
		stop,
	} = ride;

	const handleStart = useCallback(async () => {
		await ride.start();
		mapRef.current?.recenter();
	}, [ride, mapRef]);

	const handleResume = useCallback(async () => {
		await ride.resume();
		mapRef.current?.recenter();
	}, [ride, mapRef]);

	return (
		<Surface
			style={[styles.panel, { backgroundColor: colors.surface }]}
			elevation={5}
		>
			<View style={styles.topRow}>
				<IconButton
					icon="layers"
					size={20}
					iconColor={colors.primary}
					onPress={() => mapRef.current?.cycleMapType()}
					style={styles.smallBtn}
				/>

				<Text
					variant="labelLarge"
					style={{ color: colors.onSurface, fontWeight: "600" }}
				>
					{isIdle && "Ready"}
					{isActive && "Riding…"}
					{isPaused && "PAUSED"}
				</Text>

				<IconButton
					icon="crosshairs-gps"
					size={20}
					iconColor={colors.primary}
					onPress={() => mapRef.current?.recenter()}
					style={styles.smallBtn}
				/>
			</View>

			<View style={styles.statsRow}>
				<Stat label="km" value={distanceKm} color={colors.primary} />
				<Stat label="time" value={elapsedStr} color={colors.onSurface} />
				<Stat label="km/h" value={speedKmh} color={colors.onSurface} />
			</View>

			<View style={styles.controlRow}>
				{isIdle && (
					<Button
						mode="contained"
						icon="bike"
						onPress={handleStart}
						buttonColor={colors.primary}
						contentStyle={styles.mainBtn}
						labelStyle={{ fontWeight: "700", fontSize: 16 }}
					>
						Start a ride
					</Button>
				)}

				{isActive && (
					<>
						<Button mode="outlined" icon="pause" onPress={pause} textColor={colors.primary} style={styles.halfBtn}>
							Pause
						</Button>
						<Button mode="contained" icon="stop" onPress={stop} buttonColor={colors.error} style={styles.halfBtn}>
							Stop
						</Button>
					</>
				)}

				{isPaused && (
					<>
						<Button mode="contained" icon="play" onPress={handleResume} buttonColor={colors.primary} style={styles.halfBtn}>
							Resume
						</Button>
						<Button mode="outlined" icon="stop" onPress={stop} textColor={colors.error} style={styles.halfBtn}>
							Stop
						</Button>
					</>
				)}
			</View>
		</Surface>
	);
}

function Stat({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color: string;
}) {
	const { colors } = useTheme();
	return (
		<View style={styles.stat}>
			<Text variant="headlineMedium" style={{ color, fontWeight: "800" }}>
				{value}
			</Text>
			<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	panel: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		paddingTop: 12,
		paddingBottom: 34,
		paddingHorizontal: 20,
		borderTopLeftRadius: 24,
		borderTopRightRadius: 24,
		gap: 10,
	},
	topRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	smallBtn: { margin: 0, width: 40, height: 40 },
	statsRow: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	stat: { alignItems: "center" },
	controlRow: {
		flexDirection: "row",
		gap: 14,
		justifyContent: "center",
	},
	mainBtn: { paddingVertical: 8, paddingHorizontal: 40 },
	halfBtn: { flex: 1, maxWidth: 160 },
});
