import { StyleSheet, View } from "react-native";
import type { RideStats } from "../types";
import StatCard from "./StatCard";

interface Props {
	stats: RideStats;
}

export default function StatsSummary({ stats }: Props) {
	return (
		<View style={styles.row}>
			<StatCard icon="routes" value={stats.totalRides} label="Rides" />
			<StatCard
				icon="map-marker-distance"
				value={stats.totalKm.toFixed(1)}
				label="km"
			/>
			<StatCard
				icon="clock-outline"
				value={(stats.totalMin / 60).toFixed(1)}
				label="Hours"
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		gap: 12,
		paddingHorizontal: 24,
		marginBottom: 24,
	},
});
