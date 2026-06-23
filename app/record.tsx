import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RideMap, { type RideMapHandle } from "../components/RideMap";
import RidePanel from "../components/RidePanel";
import {
	RecordUIProvider,
	useRecordLayoutUI,
	useRecordMapUI,
} from "../contexts/RecordUIContext";
import { useRide } from "../hooks/useRide";
import { requestPermissions } from "../services/location";

function RecordLayout() {
	const { colors } = useTheme();
	const ride = useRide();
	const insets = useSafeAreaInsets();
	const { mapRef } = useRecordMapUI();
	const { expanded } = useRecordLayoutUI();
	const [permGranted, setPermGranted] = useState<boolean | null>(null);

	useEffect(() => {
		(async () => {
			const ok = await requestPermissions();
			setPermGranted(ok);
			if (!ok) {
				Alert.alert(
					"Location access needed",
					"TrackHub needs location access to track your rides. Please enable it in Settings.",
				);
			}
		})();
	}, []);

	const initialCoords = useRef({ lat: 53.9006, lon: 27.559 });
	// biome-ignore lint/correctness/useExhaustiveDependencies: capture initial location once on mount
	useEffect(() => {
		const last = ride.state.locations.at(-1);
		if (last) {
			initialCoords.current = { lat: last.latitude, lon: last.longitude };
		}
	}, []);

	if (permGranted === false) {
		return (
			<View
				style={[
					styles.container,
					styles.centered,
					{ backgroundColor: colors.background },
				]}
			>
				<Text
					variant="bodyLarge"
					style={{
						color: colors.onSurface,
						textAlign: "center",
						marginBottom: 16,
						marginHorizontal: 32,
					}}
				>
					Location access is required to record rides.
				</Text>
				<Button mode="contained" onPress={() => router.back()}>
					Go Back
				</Button>
			</View>
		);
	}

	return (
		<View style={styles.container}>
			<StatusBar style="light" translucent backgroundColor="transparent" />

			<View style={expanded ? styles.mapSmall : styles.mapFull}>
				<RideMap
					ref={mapRef}
					initialLat={initialCoords.current.lat}
					initialLon={initialCoords.current.lon}
					locations={ride.state.locations}
				/>
			</View>

			{!expanded && (
				<View
					style={[styles.statusBarScrim, { height: insets.top }]}
					pointerEvents="none"
				/>
			)}

			<RidePanel ride={ride} />
		</View>
	);
}

export default function RideScreen() {
	const mapRef = useRef<RideMapHandle>(null);

	return (
		<RecordUIProvider mapRef={mapRef}>
			<RecordLayout />
		</RecordUIProvider>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },
	mapFull: { ...StyleSheet.absoluteFillObject },
	mapSmall: { flex: 1 },
	statusBarScrim: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: "rgba(0,0,0,0.35)",
	},
});
