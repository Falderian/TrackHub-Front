import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";
import { fmtDist } from "../helpers/ride";
import type { Ride } from "../types";
import SwipeableRow from "./SwipeableRow";

export default function RideRow({
	ride,
	onDelete,
}: { ride: Ride; onDelete?: () => void }) {
	const { colors } = useTheme();
	const speedLabel = "km/h";
	const dur =
		ride.startTime && ride.endTime
			? Math.round(
					(new Date(ride.endTime).getTime() -
						new Date(ride.startTime).getTime()) /
						60000,
				)
			: null;

	const distDisplay =
		ride.distance != null
			? fmtDist(ride.distance / 1000, "metric")
			: null;

	const content = (
		<Pressable onPress={() => router.push(`/ride/${ride.id}`)}>
			<Surface
				style={[styles.card, { backgroundColor: colors.surface }]}
				elevation={1}
			>
				<View
					style={[styles.icon, { backgroundColor: colors.surfaceVariant }]}
				>
					<Icon source="bike" size={20} color={colors.primary} />
				</View>
				<View style={styles.body}>
					<Text
						variant="labelLarge"
						style={{ color: colors.onSurface, fontWeight: "600" }}
						numberOfLines={1}
					>
						{ride.title}
					</Text>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						{dur != null ? `${dur}min` : ""}
						{distDisplay != null
							? `${dur != null ? " · " : ""}${distDisplay}`
							: ""}
					</Text>
				</View>
				<View style={styles.speed}>
					<Text
						variant="labelMedium"
						style={{ color: colors.onSurface, fontWeight: "600" }}
					>
						{ride.avgSpeed != null ? `${ride.avgSpeed.toFixed(1)}` : "—"}
					</Text>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						{speedLabel}
					</Text>
				</View>
			</Surface>
		</Pressable>
	);

	if (onDelete) {
		return <SwipeableRow onDelete={onDelete}>{content}</SwipeableRow>;
	}
	return content;
}

const styles = StyleSheet.create({
	card: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		padding: 14,
		borderRadius: 12,
		marginBottom: 8,
	},
	icon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	body: { flex: 1 },
	speed: { alignItems: "flex-end" },
});
