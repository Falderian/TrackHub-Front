import { router } from "expo-router";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";
import { relativeTime } from "../helpers/date";
import { fmtDist, rideDuration } from "../helpers/ride";
import type { Ride } from "../types";

export default function RideCard({ ride }: { ride: Ride }) {
	const { colors } = useTheme();
	const speedLabel = "km/h";
	const distDisplay =
		ride.distance != null ? fmtDist(ride.distance, "metric") : "—";
	const timeAgo = relativeTime(ride.startTime);
	const duration = rideDuration(ride.startTime, ride.endTime);

	const metaParts: string[] = [timeAgo, distDisplay];
	if (ride.avgSpeed != null)
		metaParts.push(`${ride.avgSpeed.toFixed(1)} ${speedLabel}`);
	if (duration) metaParts.push(duration);

	return (
		<Pressable onPress={() => router.push(`/ride/${ride.id}`)}>
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
						{ride.title}
					</Text>
					<Text
						variant="labelSmall"
						style={{ color: colors.onSurfaceVariant }}
						numberOfLines={1}
					>
						{metaParts.join(" · ")}
					</Text>
				</View>
				<Icon
					source="chevron-right"
					size={18}
					color={colors.onSurfaceVariant}
				/>
			</Surface>
		</Pressable>
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
