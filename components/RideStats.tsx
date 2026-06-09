import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";

interface Props {
	distanceKm: string;
	elapsedStr: string;
	speedKmh: string;
}

export default function RideStats({ distanceKm, elapsedStr, speedKmh }: Props) {
	const { colors } = useTheme();

	return (
		<View style={styles.row}>
			<Stat value={distanceKm} label="kilometres" color={colors.primary} />
			<View style={[styles.divider, { backgroundColor: colors.outline }]} />
			<Stat value={elapsedStr} label="elapsed" color={colors.onSurface} />
			<View style={[styles.divider, { backgroundColor: colors.outline }]} />
			<Stat value={speedKmh} label="km/h" color={colors.onSurface} />
		</View>
	);
}

function Stat({
	value,
	label,
	color,
}: {
	value: string;
	label: string;
	color: string;
}) {
	const { colors } = useTheme();
	return (
		<View style={styles.stat}>
			<Text variant="displaySmall" style={[styles.value, { color }]}>
				{value}
			</Text>
			<Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
				{label}
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-evenly",
	},
	stat: { alignItems: "center", gap: 2 },
	value: { fontWeight: "800" },
	divider: { width: 1, height: 40, opacity: 0.3 },
});
