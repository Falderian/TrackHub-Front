import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import type { Region } from "react-native-maps";
import RideMap, { type RideMapHandle } from "../../components/RideMap";
import RidePanel from "../../components/RidePanel";
import { useRide } from "../../hooks/useRide";

export default function RideScreen() {
	const ride = useRide();
	const mapRef = useRef<RideMapHandle>(null);

	const initialRegion: Region = useMemo(() => {
		const locs = ride.state.locations;
		const last = locs[locs.length - 1];
		if (last) return { latitude: last.latitude, longitude: last.longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
		return { latitude: 53.9006, longitude: 27.559, latitudeDelta: 0.05, longitudeDelta: 0.05 };
	}, []);

	return (
		<View style={styles.container}>
			<RideMap ref={mapRef} initialRegion={initialRegion} locations={ride.state.locations} />
			<RidePanel ride={ride} mapRef={mapRef} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
});
