import React, { useCallback, useImperativeHandle, useRef, useState } from "react";
import { Platform, StyleSheet } from "react-native";
import MapView, { type MapType, Polyline, type Region } from "react-native-maps";
import { useTheme } from "react-native-paper";

export interface RideMapHandle {
	recenter: () => void;
	cycleMapType: () => void;
}

interface Props {
	initialRegion: Region;
	locations: readonly { latitude: number; longitude: number }[];
}

const MAP_TYPES: MapType[] = Platform.select({
	android: ["standard", "satellite", "hybrid", "terrain"],
	default: ["hybrid", "satellite", "standard"],
})!;

const RideMap = React.forwardRef<RideMapHandle, Props>(function RideMap(
	{ initialRegion, locations },
	ref,
) {
	const { colors } = useTheme();
	const mapRef = useRef<MapView>(null);
	const [mapTypeIdx, setMapTypeIdx] = useState(0);
	const userPosRef = useRef<{ latitude: number; longitude: number } | null>(null);

	const cycleMapType = useCallback(() => {
		setMapTypeIdx((i) => (i + 1) % MAP_TYPES.length);
	}, []);

	const follow = useCallback(() => {
		const target =
			locations.length > 0
				? locations[locations.length - 1]
				: userPosRef.current;
		if (!target) return;
		mapRef.current?.animateToRegion(
			{
				latitude: target.latitude,
				longitude: target.longitude,
				latitudeDelta: 0.005,
				longitudeDelta: 0.005,
			},
			500,
		);
	}, [locations]);

	useImperativeHandle(ref, () => ({ recenter: follow, cycleMapType }), [follow, cycleMapType]);

	const handleUserLocationChange = useCallback(
		(e: { nativeEvent: { coordinate?: { latitude: number; longitude: number } } }) => {
			if (e.nativeEvent.coordinate) {
				userPosRef.current = e.nativeEvent.coordinate;
			}
		},
		[],
	);

	return (
		<MapView
			ref={mapRef}
			style={styles.map}
			initialRegion={initialRegion}
			showsUserLocation
			followsUserLocation={false}
			showsMyLocationButton={false}
			showsCompass={false}
			onUserLocationChange={handleUserLocationChange}
			mapType={MAP_TYPES[mapTypeIdx]}
			userInterfaceStyle="dark"
		>
			{locations.length > 1 && (
				<Polyline
					coordinates={locations as { latitude: number; longitude: number }[]}
					strokeColor={colors.primary}
					strokeWidth={5}
				/>
			)}
		</MapView>
	);
});

const styles = StyleSheet.create({
	map: { ...StyleSheet.absoluteFillObject },
});

export default RideMap;
