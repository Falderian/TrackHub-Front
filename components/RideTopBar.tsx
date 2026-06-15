import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import type { RideData } from "../hooks/useRide";
import type { RideMapHandle } from "./RideMap";
import StatusPill from "./StatusPill";

interface Props {
	ride: RideData;
	mapRef: React.RefObject<RideMapHandle | null>;
	expanded: boolean;
	onToggle: () => void;
}

export default function RideTopBar({
	ride,
	mapRef,
	expanded,
	onToggle,
}: Props) {
	const { colors } = useTheme();
	const autoCenter = mapRef.current?.autoCenter ?? false;

	return (
		<View style={styles.row}>
			<View style={styles.side}>
				<IconButton
					icon="arrow-left"
					size={20}
					iconColor={colors.primary}
					onPress={() => router.back()}
					style={styles.btn}
				/>
			</View>

			<StatusPill ride={ride} />

			<View style={styles.controls}>
				<IconButton
					icon={expanded ? "arrow-collapse" : "arrow-expand"}
					size={20}
					iconColor={colors.primary}
					onPress={onToggle}
					style={styles.btn}
				/>
				<IconButton
					icon={autoCenter ? "crosshairs" : "crosshairs-gps"}
					size={20}
					iconColor={colors.primary}
					onPress={() => mapRef.current?.toggleAutoCenter()}
					style={styles.btn}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", alignItems: "center" },
	side: { flex: 1, flexDirection: "row", alignItems: "center" },
	controls: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "flex-end",
		gap: 4,
	},
	btn: { margin: 0, width: 36, height: 36 },
});
