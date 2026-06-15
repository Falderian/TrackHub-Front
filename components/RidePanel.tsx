import { router } from "expo-router";
import { useCallback } from "react";
import { StyleSheet } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import type { RideData } from "../hooks/useRide";
import RideControls from "./RideControls";
import RideExpandedStats from "./RideExpandedStats";
import type { RideMapHandle } from "./RideMap";
import RideStats from "./RideStats";
import RideTopBar from "./RideTopBar";

interface Props {
	ride: RideData;
	mapRef: React.RefObject<RideMapHandle | null>;
	expanded: boolean;
	onToggle: () => void;
}

export default function RidePanel({ ride, mapRef, expanded, onToggle }: Props) {
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
			style={[
				expanded ? styles.expanded : styles.compact,
				{ backgroundColor: colors.surface },
			]}
			elevation={5}
		>
			<RideTopBar
				ride={ride}
				mapRef={mapRef}
				expanded={expanded}
				onToggle={onToggle}
			/>

			{expanded ? <RideExpandedStats ride={ride} /> : <RideStats ride={ride} />}

			<RideControls
				ride={ride}
				onStart={handleStart}
				onPause={ride.pause}
				onResume={handleResume}
				onStop={handleStop}
			/>
		</Surface>
	);
}

const styles = StyleSheet.create({
	compact: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		paddingTop: 16,
		paddingBottom: 60,
		paddingHorizontal: 20,
		borderTopLeftRadius: 28,
		borderTopRightRadius: 28,
		gap: 16,
	},
	expanded: {
		paddingTop: 16,
		paddingBottom: 60,
		paddingHorizontal: 20,
		gap: 16,
	},
});
