import { StyleSheet, View } from "react-native";
import { Divider, Icon, Surface, Text, useTheme } from "react-native-paper";
import type { DetailStat } from "../hooks/useRideDetail";

interface Props {
	items: DetailStat[];
}

export default function RideDetailGrid({ items }: Props) {
	const { colors } = useTheme();

	return (
		<Surface
			style={[
				styles.card,
				{
					backgroundColor: colors.surface,
					borderColor: colors.outlineVariant,
				},
			]}
			elevation={0}
		>
			{items.map((d, i) => (
				<View key={d.label}>
					{i > 0 && (
						<Divider style={{ backgroundColor: colors.outlineVariant }} />
					)}
					<View style={styles.row}>
						<Icon source={d.icon} size={20} color={colors.primary} />
						<Text
							variant="bodyMedium"
							style={[styles.label, { color: colors.onSurfaceVariant }]}
						>
							{d.label}
						</Text>
						<Text
							variant="bodyLarge"
							style={[styles.value, { color: colors.onSurface }]}
						>
							{d.value}
						</Text>
					</View>
				</View>
			))}
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 12,
		borderWidth: 1,
		marginBottom: 16,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
	label: {
		flex: 1,
	},
	value: {
		fontWeight: "600",
		fontVariant: ["tabular-nums"],
	},
});
