import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { Text, useTheme } from "react-native-paper";
import { computeXLabels, fmtElevation } from "../helpers/ride";
import type { ChartPoint } from "../types";

interface Props {
	data: ChartPoint[];
	width: number;
	height?: number;
}

export default function ElevationProfile({
	data: points,
	width,
	height = 180,
}: Props) {
	const { colors } = useTheme();
	const elevUnit = "m";

	const { series, minV, maxV, range, xLabels } = useMemo(() => {
		if (points.length < 2)
			return {
				series: [],
				minV: 0,
				maxV: 0,
				range: 1,
				xLabels: [] as { label: string; frac: number }[],
			};

		let min = Infinity,
			max = -Infinity;
		for (const p of points) {
			if (p.v < min) min = p.v;
			if (p.v > max) max = p.v;
		}
		const r = max - min || 1;
		const pad = r * 0.15;
		const paddedMin = min - pad;
		const paddedMax = max + pad;

		const seriesData = points.map((p) => ({ value: p.v }));
		const labels = computeXLabels(points, "metric");

		return {
			series: seriesData,
			minV: paddedMin,
			maxV: paddedMax,
			range: r + pad * 2,
			xLabels: labels,
		};
	}, [points, "metric"]);

	if (series.length < 2) return null;

	const chartW = width - 52;

	return (
		<View>
			<View style={styles.row}>
				<View style={[styles.yAxis, { height }]}>
					<Text
						variant="labelSmall"
						style={[styles.axis, { color: colors.onSurfaceVariant }]}
					>
						{fmtElevation(maxV, "metric")} {elevUnit}
					</Text>
					<Text
						variant="labelSmall"
						style={[styles.axis, { color: colors.onSurfaceVariant }]}
					>
						{fmtElevation(minV + range / 2, "metric")} {elevUnit}
					</Text>
					<Text
						variant="labelSmall"
						style={[styles.axis, { color: colors.onSurfaceVariant }]}
					>
						{fmtElevation(minV, "metric")} {elevUnit}
					</Text>
				</View>

				<LineChart
					areaChart
					data={series}
					width={chartW}
					height={height}
					color={colors.primary}
					startFillColor={colors.primary}
					startOpacity={0.25}
					endFillColor={colors.primary}
					endOpacity={0.02}
					thickness={2}
					hideDataPoints
					hideRules
					hideYAxisText
					hideAxesAndRules
					initialSpacing={0}
					endSpacing={0}
					spacing={chartW / Math.max(series.length - 1, 1)}
					isAnimated
					curved
					yAxisOffset={minV}
					scrollToEnd={false}
				/>
			</View>

			<View style={styles.xRow}>
				<View style={styles.yAxis} />
				<View style={[styles.xTrack, { width: chartW }]}>
					{xLabels.map((xl, i) => (
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
