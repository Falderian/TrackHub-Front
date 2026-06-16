import { router, useFocusEffect } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	useWindowDimensions,
	View,
} from "react-native";
import { BarChart } from "react-native-gifted-charts";
import {
	ActivityIndicator,
	IconButton,
	SegmentedButtons,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StatCard from "../components/StatCard";
import { api } from "../services/api";
import type { RideStats } from "../types";

type Range = "weekly" | "monthly" | "annual";
type Metric = "distance" | "rides" | "time";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTH_NAMES = [
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

function computeRange(r: Range): { from: string; to: string } {
	const now = new Date();
	const to = now.toISOString();
	const d = new Date(now);
	switch (r) {
		case "weekly":
			d.setDate(d.getDate() - 7);
			break;
		case "monthly":
			d.setDate(d.getDate() - 30);
			break;
		case "annual":
			d.setDate(d.getDate() - 365);
			break;
	}
	return { from: d.toISOString(), to };
}

function fmtLabel(raw: string, granularity: "day" | "week" | "month"): string {
	const d = new Date(`${raw}T00:00:00`);
	if (granularity === "month") return MONTH_NAMES[d.getMonth()];
	if (granularity === "week")
		return `${MONTH_NAMES[d.getMonth()]} ${d.getDate()}`;
	return DAY_NAMES[d.getDay()];
}

type Bucket = {
	label: string;
	distance: number;
	rides: number;
	minutes: number;
};

export default function StatsScreen() {
	const { colors } = useTheme();
	const { width: screenW } = useWindowDimensions();
	const insets = useSafeAreaInsets();

	const [range, setRange] = useState<Range>("weekly");
	const [metric, setMetric] = useState<Metric>("distance");
	const [stats, setStats] = useState<RideStats | null>(null);
	const [buckets, setBuckets] = useState<Bucket[]>([]);
	const [loading, setLoading] = useState(true);
	const [focusedBar, setFocusedBar] = useState<{
		label: string;
		value: string;
	} | null>(null);

	const granularity =
		range === "annual" ? "month" : range === "monthly" ? "week" : "day";
	const dates = useMemo(() => computeRange(range), [range]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: must reset on change
	useEffect(() => {
		setFocusedBar(null);
	}, [range, metric]);

	useFocusEffect(
		useCallback(() => {
			(async () => {
				setLoading(true);
				try {
					const [s, b] = await Promise.all([
						api.getRideStats(dates.from, dates.to),
						api.getStatsBuckets(dates.from, dates.to, granularity),
					]);
					setStats(s);
					setBuckets(b);
				} catch {
					setStats(null);
					setBuckets([]);
				}
				setLoading(false);
			})();
		}, [dates.from, dates.to, granularity]),
	);

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

	const barCount = chartData.length || 1;
	const chartW = screenW - 48 - 40 - 32;
	const barSpacing = 6;
	const barW = (chartW - barSpacing * (barCount + 1)) / barCount;

	const rawMax = Math.max(...chartData.map((d) => d.value), 0);
	const maxBar = rawMax > 0 ? rawMax : 5;
	const unit = metric === "rides" ? "rides" : metric === "time" ? "hrs" : "km";

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={[styles.header, { paddingTop: insets.top + 16 }]}>
				<IconButton
					icon="arrow-left"
					size={24}
					iconColor={colors.onBackground}
					onPress={() => router.back()}
				/>
				<Text
					variant="titleLarge"
					style={{ color: colors.onBackground, fontWeight: "700" }}
				>
					Stats
				</Text>
				<View style={{ width: 48 }} />
			</View>

			<ScrollView
				contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
				showsVerticalScrollIndicator={false}
			>
				<SegmentedButtons
					value={range}
					onValueChange={(v) => setRange(v as Range)}
					buttons={[
						{ value: "weekly", label: "Weekly" },
						{ value: "monthly", label: "Monthly" },
						{ value: "annual", label: "Annual" },
					]}
					style={styles.segment}
				/>

				{loading ? (
					<ActivityIndicator
						size="large"
						color={colors.primary}
						style={{ marginTop: 60 }}
					/>
				) : (
					<>
						{stats && (
							<View style={styles.summaryRow}>
								<StatCard
									icon="routes"
									value={stats.totalRides}
									label="Rides"
								/>
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
						)}

						{chartData.length > 0 && (
							<Surface
								style={[styles.chartCard, { backgroundColor: colors.surface }]}
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
									{focusedBar
										? `${focusedBar.label}: ${focusedBar.value} ${unit}`
										: " "}
								</Text>
								<BarChart
									key={`${range}-${metric}`}
									data={chartData}
									barWidth={barW}
									spacing={barSpacing}
									initialSpacing={barSpacing}
									endSpacing={barSpacing}
									maxValue={maxBar * 1.2}
									noOfSections={4}
									yAxisTextStyle={{
										color: colors.onSurfaceVariant,
										fontSize: 10,
									}}
									xAxisLabelTextStyle={{
										color: colors.onSurfaceVariant,
										fontSize: 10,
									}}
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
						)}

						{!loading && chartData.length === 0 && (
							<Text
								variant="bodyLarge"
								style={{
									color: colors.onSurfaceVariant,
									textAlign: "center",
									marginTop: 60,
								}}
							>
								No rides in this period
							</Text>
						)}
					</>
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 8,
		paddingBottom: 16,
	},
	segment: { marginHorizontal: 24, marginBottom: 24 },
	summaryRow: {
		flexDirection: "row",
		gap: 12,
		paddingHorizontal: 24,
		marginBottom: 24,
	},
	chartCard: {
		marginHorizontal: 24,
		padding: 20,
		borderRadius: 14,
	},
});
