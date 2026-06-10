import { StyleSheet, useWindowDimensions, View } from "react-native";
import { Icon, Surface, Text, useTheme } from "react-native-paper";
import type { ChartArrays } from "../types";
import ElevationProfile from "./ElevationProfile";
import SpeedChart from "./SpeedChart";

interface Props {
	chart: ChartArrays;
}

export default function RideChartPanel({ chart }: Props) {
	const { colors } = useTheme();
	const { width: screenWidth } = useWindowDimensions();
	const chartW = screenWidth - 92;
	const chartHeight = 160;

	return (
		<View style={styles.wrap}>
			<Surface
				style={[styles.card, { backgroundColor: colors.surface }]}
				elevation={1}
			>
				<View style={styles.header}>
					<Icon source="image-filter-hdr" size={16} color={colors.primary} />
					<Text
						variant="labelMedium"
						style={{ color: colors.onSurface, fontWeight: "700" }}
					>
						Elevation
					</Text>
				</View>
				<ElevationProfile
					data={chart.elevation}
					width={chartW}
					height={chartHeight}
				/>
			</Surface>

			<Surface
				style={[styles.card, { backgroundColor: colors.surface }]}
				elevation={1}
			>
				<View style={styles.header}>
					<Icon source="speedometer" size={16} color={colors.primary} />
					<Text
						variant="labelMedium"
						style={{ color: colors.onSurface, fontWeight: "700" }}
					>
						Speed
					</Text>
				</View>
				<SpeedChart data={chart.speed} width={chartW} height={chartHeight} />
			</Surface>

			<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
				distance →
			</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	wrap: { paddingHorizontal: 20, gap: 12 },
	card: { borderRadius: 16, overflow: "hidden", padding: 8 },
	header: { flexDirection: "row", alignItems: "center", gap: 6 },
});
