import { StyleSheet, View } from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";

export default function EmptyRides() {
	const { colors } = useTheme();

	return (
		<Surface
			style={[styles.card, { backgroundColor: colors.surface }]}
			elevation={1}
		>
			<View style={[styles.icon, { backgroundColor: colors.primaryContainer }]}>
				<Icon source="bike" size={40} color={colors.primary} />
			</View>
			<Text
				variant="titleMedium"
				style={{ color: colors.onSurface, marginTop: 12 }}
			>
				No rides yet
			</Text>
			<Text
				variant="bodySmall"
				style={{
					color: colors.onSurfaceVariant,
					textAlign: "center",
					marginTop: 4,
				}}
			>
				Hit Start a Ride to record your first one
			</Text>
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: { borderRadius: 14, padding: 32, alignItems: "center" },
	icon: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: "center",
		justifyContent: "center",
	},
});
