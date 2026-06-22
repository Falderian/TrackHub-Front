import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { RideData } from "../hooks/useRide";

interface Props {
	ride: RideData;
}

type ThemeColors = ReturnType<typeof useTheme>["colors"] & {
	warning: string;
	warningContainer: string;
	onWarningContainer: string;
};

export default function StatusPill({ ride }: Props) {
	const { colors } = useTheme() as { colors: ThemeColors };

	const bg = ride.isIdle
		? colors.surfaceVariant
		: ride.isPaused
			? colors.warningContainer
			: colors.tertiaryContainer;
	const border = ride.isIdle
		? colors.outline
		: ride.isPaused
			? colors.warning
			: colors.tertiary;
	const dot = ride.isIdle
		? colors.outline
		: ride.isPaused
			? colors.warning
			: colors.tertiary;
	const textColor = ride.isIdle
		? colors.onSurfaceVariant
		: ride.isPaused
			? colors.onWarningContainer
			: colors.onTertiaryContainer;
	const label = ride.isIdle
		? "Ready to ride"
		: ride.isPaused
			? "PAUSED"
			: "Riding…";

	return (
		<View style={[styles.pill, { backgroundColor: bg, borderColor: border }]}>
			<View style={[styles.dot, { backgroundColor: dot }]} />
			<Text
				variant="labelMedium"
				style={{ color: textColor, fontWeight: "600" }}
			>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	pill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingHorizontal: 16,
		paddingVertical: 6,
		borderRadius: 20,
		borderWidth: 1,
	},
	dot: { width: 8, height: 8, borderRadius: 4 },
});
