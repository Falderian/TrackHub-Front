import { StyleSheet, View } from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";

interface StatItem {
	icon: string;
	value: string;
	unit: string;
	highlight?: boolean;
}

interface Props {
	stats: StatItem[];
}

export default function RideStatsGrid({ stats }: Props) {
	const { colors } = useTheme();

	return (
		<View style={styles.grid}>
			{stats.map((s) => {
				const accent = s.highlight ? colors.primary : colors.onSurface;
				return (
					<Surface
						key={s.icon + s.unit}
						style={[styles.card, { backgroundColor: colors.surface }]}
						elevation={1}
					>
						<Icon
							source={s.icon}
							size={18}
							color={s.highlight ? colors.primary : colors.onSurfaceVariant}
						/>
						<Text
							variant="titleMedium"
							style={[styles.value, { color: accent }]}
							numberOfLines={1}
							adjustsFontSizeToFit
						>
							{s.value}
						</Text>
						<Text
							variant="labelSmall"
							style={{ color: colors.onSurfaceVariant }}
						>
							{s.unit}
						</Text>
					</Surface>
				);
			})}
		</View>
	);
}

const styles = StyleSheet.create({
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 10,
		paddingHorizontal: 20,
	},
	card: {
		flex: 1,
		minWidth: "30%",
		borderRadius: 14,
		padding: 12,
		alignItems: "center",
		gap: 2,
	},
	value: { fontWeight: "800" },
});
