import { useEffect, useMemo, useState } from "react";
import { StyleSheet, useWindowDimensions } from "react-native";
import { BarChart } from "react-native-gifted-charts";
import { SegmentedButtons, Surface, Text, useTheme } from "react-native-paper";
import {
	computeGranularity,
	fmtLabel,
	type Metric,
	type Range,
} from "../helpers/stats";

interface Bucket {
	label: string;
	distance: number;
	rides: number;
	minutes: number;
}

interface Props {
	range: Range;
	buckets: Bucket[];
	onRangeChange?: () => void; // unused, kept for symmetry
}

export default function StatsChart({ range, buckets }: Props) {
	const { colors } = useTheme();
	const { width: screenW } = useWindowDimensions();

	const [metric, setMetric] = useState<Metric>("distance");
	const [focusedBar, setFocusedBar] = useState<{
		label: string;
		value: string;
	} | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: range is a prop, metric is state — both cause re-renders
	useEffect(() => {
		setFocusedBar(null);
	}, [range, metric]);

	const granularity = computeGranularity(range);

	const chartData = useMemo(() => {
		return buckets.map((b) => {
			let value: number;
			switch (metric) {
				case "rides":
					value = b.rides;
					break;
				case "time":
					value = +(b.minutes / 60).toFixed(1);
					break;
				default:
					value = b.distance;
			}
			const label = fmtLabel(b.label, granularity);
			return {
				value,
				label,
				frontColor: colors.primary,
				onPress: () =>
					setFocusedBar((prev) =>
						prev?.label === label ? null : { label, value: String(value) },
					),
			};
		});
	}, [buckets, metric, granularity, colors.primary]);

	const chartKey = `${range}-${metric}`;

	const barCount = chartData.length || 1;
	const chartW = screenW - 48 - 40 - 35;
	const rawBarW = (chartW - 6 * (barCount + 2)) / barCount;
	const barW = Math.min(rawBarW, 40);
	const barSpacing =
		rawBarW > 40 ? Math.max((chartW - barCount * 40) / (barCount + 2), 4) : 6;

	const rawMax = Math.max(...chartData.map((d) => d.value), 0);
	const maxBar = rawMax > 0 ? rawMax : 5;
	const unit = metric === "rides" ? "rides" : metric === "time" ? "hrs" : "km";

	return (
		<Surface
			style={[styles.card, { backgroundColor: colors.surface }]}
			elevation={1}
		>
			<SegmentedButtons
				value={metric}
				onValueChange={(v) => setMetric(v as Metric)}
				buttons={[
					{ value: "distance", label: "Distance" },
					{ value: "rides", label: "Rides" },
					{ value: "time", label: "Time" },
				]}
				style={{ marginBottom: 20 }}
			/>

			<Text
				variant="labelMedium"
				style={{
					color: focusedBar ? colors.primary : "transparent",
					textAlign: "center",
					marginBottom: 8,
					fontWeight: "700",
				}}
			>
				{focusedBar ? `${focusedBar.label}: ${focusedBar.value} ${unit}` : " "}
			</Text>

			<BarChart
				key={chartKey}
				data={chartData}
				barWidth={barW}
				spacing={barSpacing}
				initialSpacing={barSpacing}
				endSpacing={barSpacing}
				maxValue={maxBar * 1.2}
				noOfSections={4}
				yAxisTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10 }}
				xAxisLabelTextStyle={{ color: colors.onSurfaceVariant, fontSize: 10 }}
				hideRules
				isAnimated
				roundedTop
				focusBarOnPress
			/>

			<Text
				variant="labelSmall"
				style={{
					color: colors.onSurfaceVariant,
					textAlign: "right",
					marginTop: 8,
				}}
			>
				{unit}
			</Text>
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: {
		marginHorizontal: 24,
		padding: 20,
		borderRadius: 14,
	},
});
