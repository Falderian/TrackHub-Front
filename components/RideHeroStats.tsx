import { StyleSheet, View } from "react-native";
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
	return (
		<View style={styles.row}>
			<HeroStat value={distanceKm} unit="km" icon="map-marker-distance" />
			<HeroStat value={duration} unit="" icon="clock-outline" />
			<HeroStat value={elevationGain} unit="m" icon="elevation-rise" />
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 20,
		marginBottom: 24,
	},
});
