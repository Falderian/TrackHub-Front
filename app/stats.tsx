import { router } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import {
	ActivityIndicator,
	IconButton,
	SegmentedButtons,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import StatsChart from "../components/StatsChart";
import StatsSummary from "../components/StatsSummary";
import { computeRange, type Range } from "../helpers/stats";
import { useRideStatsQuery, useStatsBucketsQuery } from "../hooks/queries";

export default function StatsScreen() {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();

	const [range, setRange] = useState<Range>("weekly");

	const granularity =
		range === "annual" ? "month" : range === "monthly" ? "week" : "day";
	const dates = useMemo(() => computeRange(range), [range]);

	const { data: stats, isLoading } = useRideStatsQuery(dates.from, dates.to);
	const { data: buckets = [] } = useStatsBucketsQuery(
		dates.from,
		dates.to,
		granularity,
	);

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

				{isLoading ? (
					<ActivityIndicator
						size="large"
						color={colors.primary}
						style={{ marginTop: 60 }}
					/>
				) : (
					<>
						{stats && <StatsSummary stats={stats} />}

						{buckets.length > 0 ? (
							<StatsChart range={range} buckets={buckets} />
						) : (
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
});
