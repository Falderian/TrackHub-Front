import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { DetailStat } from "../hooks/useRideDetail";

interface Props {
	items: DetailStat[];
}

export default function RideDetailGrid({ items }: Props) {
	const { colors } = useTheme();

	return (
		<View style={styles.grid}>
			{items.map((d) => (
				<View
					key={d.label}
					style={[styles.cell, { backgroundColor: colors.surfaceVariant }]}
				>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						{d.label}
					</Text>
					<Text
						variant="bodyLarge"
						style={{
							color: colors.onBackground,
							fontWeight: "600",
							marginTop: 2,
						}}
					>
						{d.value}
					</Text>
				</View>
			))}
		</View>
	);
}

const styles = StyleSheet.create({
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 12,
		marginBottom: 24,
	},
	cell: {
		flex: 1,
		minWidth: "45%",
		borderRadius: 12,
		padding: 14,
	},
});
