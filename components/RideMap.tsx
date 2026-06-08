import React, {
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { StyleSheet } from "react-native";
import MapView, { Polyline, type MapType } from "react-native-maps";
import { useTheme } from "react-native-paper";

export interface RideMapHandle {
	recenter: () => void;
	cycleMapType: () => void;
}

interface Props {
	initialLat: number;
	initialLon: number;
	locations: readonly { latitude: number; longitude: number }[];
}

const MAP_TYPES: MapType[] = ["standard", "satellite", "hybrid", "terrain"];

const RideMap = React.forwardRef<RideMapHandle, Props>(function RideMap(
	{ initialLat, initialLon, locations },
	ref,
) {
	const { colors } = useTheme();
	const mapRef = useRef<MapView>(null);
	const [mapTypeIdx, setMapTypeIdx] = useState(0);
	const userPosRef = useRef<{ latitude: number; longitude: number } | null>(
		null,
	);

	const cycleMapType = useCallback(() => {
		setMapTypeIdx((i) => (i + 1) % MAP_TYPES.length);
	}, []);

	const recenter = useCallback(() => {
		const target =
			locations.length > 0
				? locations[locations.length - 1]
				: userPosRef.current;
		if (!target) return;
		mapRef.current?.animateToRegion(
			{
				latitude: target.latitude,
				longitude: target.longitude,
				latitudeDelta: 0.01,
				longitudeDelta: 0.01,
			},
			500,
		);
	}, [locations]);

	useImperativeHandle(ref, () => ({ recenter, cycleMapType }), [
		recenter,
		cycleMapType,
	]);

	const handleUserLocationChange = useCallback(
		(e: {
			nativeEvent: { coordinate?: { latitude: number; longitude: number } };
		}) => {
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
			initialRegion={{
				latitude: initialLat,
				longitude: initialLon,
				latitudeDelta: 0.02,
				longitudeDelta: 0.02,
			}}
			showsUserLocation
			followsUserLocation={false}
			mapType={MAP_TYPES[mapTypeIdx]}
			onUserLocationChange={handleUserLocationChange}
			scrollEnabled
			zoomEnabled
			rotateEnabled
		>
			{locations.length > 1 && (
				<Polyline
					coordinates={[...locations]}
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
