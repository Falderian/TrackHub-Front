import { StyleSheet } from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";

export default function StatCard({
	icon,
	value,
	label,
}: {
	icon: string;
	value: string | number;
	label: string;
}) {
	const { colors } = useTheme();
	return (
		<Surface
			style={[styles.card, { backgroundColor: colors.surface }]}
			elevation={1}
		>
			<Icon source={icon} size={22} color={colors.primary} />
			<Text
				variant="titleLarge"
				style={[styles.value, { color: colors.onSurface }]}
			>
				{value}
			</Text>
			<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
				{label}
			</Text>
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: {
		flex: 1,
		borderRadius: 14,
		padding: 16,
		alignItems: "center",
		gap: 4,
	},
	value: { fontWeight: "800" },
});
