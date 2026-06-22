import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { IconButton, useTheme } from "react-native-paper";
import { useRecordLayoutUI, useRecordMapUI } from "../contexts/RecordUIContext";
import type { RideData } from "../hooks/useRide";
import StatusPill from "./StatusPill";

interface Props {
	ride: RideData;
}

export default function RideTopBar({ ride }: Props) {
	const { colors } = useTheme();
	const { autoCenter, setAutoCenter, mapRef } = useRecordMapUI();
	const { expanded, setExpanded } = useRecordLayoutUI();

	const handleCrosshairPress = () => {
		setAutoCenter((v) => !v);
		if (!autoCenter) {
			mapRef.current?.recenter();
		}
	};

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
					onPress={() => setExpanded((v) => !v)}
					style={styles.btn}
				/>
				<IconButton
					icon={autoCenter ? "crosshairs-gps" : "crosshairs"}
					size={20}
					iconColor={autoCenter ? colors.primary : colors.onSurfaceVariant}
					onPress={handleCrosshairPress}
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
