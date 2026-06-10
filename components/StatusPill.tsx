import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface Props {
	isIdle: boolean;
	isActive: boolean;
	isPaused: boolean;
}

export default function StatusPill({ isIdle, isPaused }: Props) {
	const { colors } = useTheme();

	const bg = isIdle
		? colors.surfaceVariant
		: isPaused
			? colors.warningContainer
			: colors.tertiaryContainer;
	const border = isIdle
		? colors.outline
		: isPaused
			? colors.warning
			: colors.tertiary;
	const dot = isIdle
		? colors.outline
		: isPaused
			? colors.warning
			: colors.tertiary;
	const textColor = isIdle
		? colors.onSurfaceVariant
		: isPaused
			? colors.onWarningContainer
			: colors.onTertiaryContainer;
	const label = isIdle ? "Ready to ride" : isPaused ? "PAUSED" : "Riding…";

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
