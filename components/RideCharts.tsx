import { StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import type { ChartPoint } from "../types";
import ElevationProfile from "./ElevationProfile";
import SpeedChart from "./SpeedChart";

interface Props {
	speedData: ChartPoint[];
	elevationData: ChartPoint[];
	width: number;
}

export default function RideCharts({ speedData, elevationData, width }: Props) {
	const { colors } = useTheme();

	return (
		<>
			<View style={[styles.card, { backgroundColor: colors.surface }]}>
				<Text
					variant="titleSmall"
					style={{
						color: colors.onSurface,
						fontWeight: "600",
						marginBottom: 12,
					}}
				>
					Speed
				</Text>
				<SpeedChart data={speedData} width={width} />
			</View>

			<View style={[styles.card, { backgroundColor: colors.surface }]}>
				<Text
					variant="titleSmall"
					style={{
						color: colors.onSurface,
						fontWeight: "600",
						marginBottom: 12,
					}}
				>
					Elevation
				</Text>
				<ElevationProfile data={elevationData} width={width} />
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 16,
		padding: 14,
		marginBottom: 12,
	},
});
