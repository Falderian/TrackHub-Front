import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Surface, useTheme } from "react-native-paper";
import type { RideData } from "../hooks/useRide";
import RideControls from "./RideControls";
import type { RideMapHandle } from "./RideMap";
import RideStats from "./RideStats";
import StatusPill from "./StatusPill";

interface Props {
	ride: RideData;
	mapRef: React.RefObject<RideMapHandle | null>;
}

export default function RidePanel({ ride, mapRef }: Props) {
	const { colors } = useTheme();

	const handleStart = useCallback(async () => {
		await ride.start();
		mapRef.current?.recenter();
	}, [ride.start, mapRef]);

	const handleResume = useCallback(async () => {
		await ride.resume();
		mapRef.current?.recenter();
	}, [ride.resume, mapRef]);

	const handleStop = useCallback(async () => {
		const rideId = await ride.stop();
		if (rideId) {
			router.replace(`/ride/${rideId}`);
		} else {
			router.back();
		}
	}, [ride.stop]);

	return (
		<Surface
			style={[styles.panel, { backgroundColor: colors.surface }]}
			elevation={5}
		>
			{/* Top row: back | status | map controls */}
			<View style={styles.topRow}>
				<View style={styles.side}>
					<IconButton
						icon="arrow-left"
						size={20}
						iconColor={colors.onSurfaceVariant}
						onPress={() => router.back()}
						style={styles.mapBtn}
					/>
				</View>

				<StatusPill
					isIdle={ride.isIdle}
					isActive={ride.isActive}
					isPaused={ride.isPaused}
				/>

				<View style={styles.mapControls}>
					<IconButton
						icon="layers"
						size={20}
						iconColor={colors.onSurfaceVariant}
						onPress={() => mapRef.current?.cycleMapType()}
						style={styles.mapBtn}
					/>
					<IconButton
						icon="crosshairs-gps"
						size={20}
						iconColor={colors.onSurfaceVariant}
						onPress={() => mapRef.current?.recenter()}
						style={styles.mapBtn}
					/>
				</View>
			</View>

			<RideStats
				distanceKm={ride.distanceKm}
				elapsedStr={ride.elapsedStr}
				speedKmh={ride.speedKmh}
			/>

			<RideControls
				isIdle={ride.isIdle}
				isActive={ride.isActive}
				isPaused={ride.isPaused}
				onStart={handleStart}
				onPause={ride.pause}
				onResume={handleResume}
				onStop={handleStop}
			/>
		</Surface>
	);
}

const styles = StyleSheet.create({
	panel: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		paddingTop: 16,
		paddingBottom: 38,
		paddingHorizontal: 20,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		gap: 16,
	},
	topRow: { flexDirection: "row", alignItems: "center" },
	side: { flex: 1, flexDirection: "row", alignItems: "center" },
	mapControls: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 4,
	},
	mapBtn: { margin: 0, width: 36, height: 36 },
});
