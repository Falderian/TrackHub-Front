import React, {
	useCallback,
	useImperativeHandle,
	useRef,
	useState,
} from "react";
import { StyleSheet } from "react-native";
import {
	Camera,
	type CameraRef,
	GeoJSONSource,
	Layer,
	Map,
	RasterSource,
	UserLocation,
} from "@maplibre/maplibre-react-native";
import { useTheme } from "react-native-paper";
import { TILE_STYLES } from "../constants/maps";

const EMPTY_STYLE = JSON.stringify({
	version: 8,
	sources: {},
	layers: [],
});

export interface RideMapHandle {
	recenter: () => void;
	cycleMapType: () => void;
}

interface Props {
	initialLat: number;
	initialLon: number;
	locations: readonly { latitude: number; longitude: number }[];
}

const RideMap = React.forwardRef<RideMapHandle, Props>(function RideMap(
	{ initialLat, initialLon, locations },
	ref,
) {
	const { colors } = useTheme();
	const cameraRef = useRef<CameraRef>(null);
	const [styleIdx, setStyleIdx] = useState(0);
	const userPosRef = useRef<{ latitude: number; longitude: number } | null>(
		null,
	);

	const recenter = useCallback(() => {
		const target =
			locations.length > 0
				? locations[locations.length - 1]
				: userPosRef.current;
		if (!target) return;
		cameraRef.current?.easeTo({
			center: [target.longitude, target.latitude],
			zoom: 16,
			duration: 500,
		});
	}, [locations]);

	const cycleMapType = useCallback(() => {
		setStyleIdx((i) => (i + 1) % TILE_STYLES.length);
	}, []);

	useImperativeHandle(ref, () => ({ recenter, cycleMapType }), [
		recenter,
		cycleMapType,
	]);

	// track user position for recenter fallback
	const userLocation = (
		<UserLocation
			heading
			animated
			onPress={() => {
				/* noop — just to access the latest location */
			}}
		/>
	);

	const routeData = React.useMemo(() => {
		if (locations.length < 2) return null;
		return {
			type: "Feature" as const,
			geometry: {
				type: "LineString" as const,
				coordinates: locations.map((loc) => [loc.longitude, loc.latitude]),
			},
			properties: {},
		};
	}, [locations]);

	const tile = TILE_STYLES[styleIdx];

	return (
		<Map style={styles.map} mapStyle={EMPTY_STYLE}>
			<Camera
				ref={cameraRef}
				initialViewState={{
					center: [initialLon, initialLat],
					zoom: 14,
				}}
			/>

			<RasterSource
				key={styleIdx}
				id="stadia-tiles"
				tiles={[tile.url]}
				tileSize={256}
				minzoom={1}
				maxzoom={20}
			>
				<Layer type="raster" id="stadia-layer" />
			</RasterSource>

			{routeData && (
				<GeoJSONSource id="route" data={routeData}>
					<Layer
						type="line"
						id="route-line"
						paint={{
							"line-color": colors.primary,
							"line-width": 5,
						}}
						layout={{
							"line-cap": "round",
							"line-join": "round",
						}}
					/>
				</GeoJSONSource>
			)}

			{userLocation}
		</Map>
	);
});

const styles = StyleSheet.create({
	map: { ...StyleSheet.absoluteFillObject },
});

export default RideMap;
