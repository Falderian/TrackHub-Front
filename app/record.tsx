import { StatusBar } from "expo-status-bar";
import { useEffect, useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
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
	const ride = useRide();
	const insets = useSafeAreaInsets();
	const { mapRef } = useRecordMapUI();
	const { expanded } = useRecordLayoutUI();

	useEffect(() => {
		requestPermissions();
	}, []);

	const { initialLat, initialLon } = useMemo(() => {
		const locs = ride.state.locations;
		const last = locs[locs.length - 1];
		if (last) return { initialLat: last.latitude, initialLon: last.longitude };
		return { initialLat: 53.9006, initialLon: 27.559 };
	}, [ride.state.locations]);

	return (
		<View style={styles.container}>
			<StatusBar style="light" translucent backgroundColor="transparent" />

			<View style={expanded ? styles.mapSmall : styles.mapFull}>
				<RideMap
					ref={mapRef}
					initialLat={initialLat}
					initialLon={initialLon}
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
