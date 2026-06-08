import { useState, useRef, useEffect, useCallback } from "react";
import { View, StyleSheet, Alert } from "react-native";
import { Text, Surface, useTheme, IconButton } from "react-native-paper";
import {
	getRideState,
	getElapsed,
	subscribe,
	startTracking,
	pauseTracking,
	resumeTracking,
	stopTracking,
} from "../../services/location";

export default function RideScreen() {
	const { colors } = useTheme();
	const [running, setRunning] = useState(false);
	const [paused, setPaused] = useState(false);
	const [elapsed, setElapsed] = useState(0);
	const [distance, setDistance] = useState(0);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

	// Tick elapsed every second while active
	useEffect(() => {
		if (running && !paused) {
			intervalRef.current = setInterval(() => {
				setElapsed(getElapsed());
			}, 1000);
		}
		return () => {
			if (intervalRef.current) clearInterval(intervalRef.current);
		};
	}, [running, paused]);

	// Subscribe to location updates from the background task
	useEffect(() => {
		return subscribe(() => {
			const s = getRideState();
			setRunning(s.running);
			setPaused(s.paused);
			setDistance(s.distance);
			setElapsed(getElapsed());
		});
	}, []);

	const handleToggle = useCallback(async () => {
		try {
			if (!running) {
				await startTracking();
			} else if (paused) {
				await resumeTracking();
			} else {
				await pauseTracking();
			}
		} catch (e: any) {
			Alert.alert("Error", e.message);
		}
	}, [running, paused]);

	const handleStop = useCallback(async () => {
		await stopTracking();
	}, []);

	const fmtTime = (s: number) => {
		const m = Math.floor(s / 60);
		const sec = s % 60;
		return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
	};

	const fmtDistance = (m: number) => (m / 1000).toFixed(2);

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<Text variant="headlineSmall" style={styles.title}>
				New Ride
			</Text>

			{/* Metrics */}
			<Surface
				style={[styles.metricsCard, { backgroundColor: colors.surface }]}
				elevation={2}
			>
				<View style={styles.metricRow}>
					<View style={styles.metric}>
						<Text variant="displaySmall" style={{ color: colors.primary }}>
							{fmtTime(elapsed)}
						</Text>
						<Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
							Time
						</Text>
					</View>
					<View style={styles.metric}>
						<Text variant="displaySmall" style={{ color: colors.primary }}>
							{fmtDistance(distance)}
						</Text>
						<Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
							km
						</Text>
					</View>
				</View>
			</Surface>

			{/* Controls */}
			<View style={styles.controls}>
				<IconButton
					icon={running && !paused ? "pause" : "play"}
					mode="contained"
					size={40}
					iconColor={colors.onPrimary}
					containerColor={colors.primary}
					onPress={handleToggle}
				/>
				{running && elapsed > 0 && (
					<IconButton
						icon="stop"
						mode="outlined"
						size={36}
						iconColor={colors.error}
						onPress={handleStop}
					/>
				)}
			</View>

			<Surface
				style={[styles.emptyCard, { backgroundColor: colors.surface }]}
				elevation={1}
			>
				<Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
					{running && !paused
						? "Ride in progress…"
						: paused
							? "Paused"
							: elapsed > 0
								? "Ride finished"
								: "Tap play to start a ride"}
				</Text>
			</Surface>

			{running && !paused && (
				<Text variant="bodySmall" style={[styles.status, { color: colors.primary }]}>
					● Live
				</Text>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: "center",
		padding: 24,
		paddingTop: 80,
	},
	title: {
		fontWeight: "bold",
		marginBottom: 24,
	},
	metricsCard: {
		width: "100%",
		padding: 24,
		borderRadius: 12,
		marginBottom: 32,
	},
	metricRow: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
	metric: {
		alignItems: "center",
	},
	controls: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		marginBottom: 24,
	},
	emptyCard: {
		width: "100%",
		padding: 16,
		borderRadius: 12,
		alignItems: "center",
	},
	status: {
		marginTop: 16,
		fontWeight: "600",
	},
});
