import { StyleSheet, View } from "react-native";
import { Surface, useTheme } from "react-native-paper";
import HeroStat from "./HeroStat";

interface Props {
	distanceKm: string;
	duration: string;
	elevationGain: string;
}

export default function RideHeroStats({
	distanceKm,
	duration,
	elevationGain,
}: Props) {
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
			<View style={styles.row}>
				<HeroStat value={distanceKm} unit="km" icon="map-marker-distance" />
				<HeroStat value={duration} unit="" icon="clock-outline" />
				<HeroStat value={elevationGain} unit="m" icon="elevation-rise" />
			</View>
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 12,
		borderWidth: 1,
		padding: 12,
		marginTop: 12,
		marginBottom: 16,
	},
	row: {
		flexDirection: "row",
		justifyContent: "space-around",
	},
});
