import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import RideMap, { type RideMapHandle } from "../../components/RideMap";
import RidePanel from "../../components/RidePanel";
import { useRide } from "../../hooks/useRide";

export default function RideScreen() {
	const ride = useRide();
	const mapRef = useRef<RideMapHandle>(null);

	const { initialLat, initialLon } = useMemo(() => {
		const locs = ride.state.locations;
		const last = locs[locs.length - 1];
		if (last) return { initialLat: last.latitude, initialLon: last.longitude };
		return { initialLat: 53.9006, initialLon: 27.559 };
	}, []);

	return (
		<View style={styles.container}>
			<RideMap
				ref={mapRef}
				initialLat={initialLat}
				initialLon={initialLon}
				locations={ride.state.locations}
			/>
			<RidePanel ride={ride} mapRef={mapRef} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});
