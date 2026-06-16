import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";
import { computeXLabels, zoneColor } from "../helpers/ride";
import type { ChartPoint } from "../types";

interface Props {
	data: ChartPoint[];
	width: number;
	height?: number;
}

export default function SpeedChart({
	data: points,
	width,
	height = 180,
}: Props) {
	const { colors } = useTheme();
	const speedUnit = "km/h";

	const { series, maxV, xLabels } = useMemo(() => {
		if (points.length < 2)
			return {
				series: [],
				maxV: 1,
				xLabels: [] as { label: string; frac: number }[],
			};

		let max = -Infinity;
		for (const p of points) {
			if (p.v > max) max = p.v;
		}
		const paddedMax = max * 1.2;

		const seriesData = points.map((p) => ({
			value: p.v,
			dataPointColor: zoneColor(p.v, colors),
		}));

		const labels = computeXLabels(points, "metric");

		return { series: seriesData, maxV: paddedMax, xLabels: labels };
	}, [points, colors, "metric"]);

	if (series.length < 2) return null;

	const zones = [colors.primary, "#e5a412", colors.error];
	const chartW = width - 52;

	return (
		<View>
			<View style={styles.legend}>
				{[
					{ c: zones[0], l: "0–20" },
					{ c: zones[1], l: "20–35" },
					{ c: zones[2], l: "35+" },
				].map((z) => (
					<View key={z.l} style={styles.legendItem}>
						<View style={[styles.dot, { backgroundColor: z.c }]} />
						<Text
							variant="labelSmall"
							style={{ color: colors.onSurfaceVariant }}
						>
							{z.l}
						</Text>
					</View>
				))}
				<Text
					variant="labelSmall"
					style={{ color: colors.onSurfaceVariant, marginLeft: "auto" }}
				>
					{speedUnit}
				</Text>
			</View>

			<View style={styles.row}>
				<View style={[styles.yAxis, { height }]}>
					<Text
						variant="labelSmall"
						style={[styles.axis, { color: colors.onSurfaceVariant }]}
					>
						{Math.round(maxV)}
					</Text>
					<Text
						variant="labelSmall"
						style={[styles.axis, { color: colors.onSurfaceVariant }]}
					>
						{Math.round(maxV / 2)}
					</Text>
					<Text
						variant="labelSmall"
						style={[styles.axis, { color: colors.onSurfaceVariant }]}
					>
						0
					</Text>
				</View>

				<LineChart
					data={series}
					width={chartW}
					height={height}
					color={colors.primary}
					thickness={2.5}
					dataPointsRadius={3}
					hideDataPoints={false}
					hideRules
					hideYAxisText
					hideAxesAndRules
					initialSpacing={0}
					endSpacing={0}
					spacing={chartW / Math.max(series.length - 1, 1)}
					isAnimated
					curved
					scrollToEnd={false}
				/>
			</View>

			<View style={styles.xRow}>
				<View style={styles.yAxis} />
				<View style={[styles.xTrack, { width: chartW }]}>
					{xLabels.map((xl) => (
						<Text
							key={xl.label}
							variant="labelSmall"
							style={[
								styles.xLabel,
								{ color: colors.onSurfaceVariant, left: `${xl.frac * 100}%` },
							]}
						>
							{xl.label}
						</Text>
					))}
				</View>
			</View>

			<View style={styles.xRow}>
				<View style={styles.yAxis} />
				<View
					style={[
						styles.xLine,
						{ width: chartW, backgroundColor: colors.outline },
					]}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", alignItems: "flex-start" },
	yAxis: { width: 48, justifyContent: "space-between", paddingRight: 4 },
	axis: { textAlign: "right", fontVariant: ["tabular-nums"] },
	legend: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 8,
		paddingLeft: 4,
	},
	legendItem: { flexDirection: "row", alignItems: "center", gap: 4 },
	dot: { width: 8, height: 8, borderRadius: 4 },
	xRow: { flexDirection: "row", marginTop: 2 },
	xTrack: { position: "relative", height: 16 },
	xLabel: {
		position: "absolute",
		fontSize: 10,
		fontVariant: ["tabular-nums"],
		marginLeft: -20,
		width: 40,
		textAlign: "center",
	},
	xLine: { height: 1 },
});
