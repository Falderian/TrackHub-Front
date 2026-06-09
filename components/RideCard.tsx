import { StyleSheet, View } from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";
import type { Ride } from "../types";

export default function RideCard({ ride }: { ride: Ride }) {
	const { colors } = useTheme();

	return (
		<Surface
			style={[styles.card, { backgroundColor: colors.surface }]}
			elevation={1}
		>
			<Icon source="bike" size={24} color={colors.primary} />
			<View style={styles.body}>
				<Text
					variant="labelLarge"
					style={{ color: colors.onSurface, fontWeight: "600" }}
					numberOfLines={1}
				>
					{ride.title ?? "Untitled Ride"}
				</Text>
				<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
					{new Date(ride.startTime).toLocaleDateString()}
					{" · "}
					{ride.distance != null ? `${ride.distance.toFixed(1)} km` : "—"}
					{ride.avgSpeed != null ? ` · ${ride.avgSpeed.toFixed(1)} km/h` : ""}
				</Text>
			</View>
			<Icon source="chevron-right" size={18} color={colors.onSurfaceVariant} />
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 12,
		paddingHorizontal: 14,
		borderRadius: 12,
		marginBottom: 8,
	},
	body: { flex: 1 },
});
