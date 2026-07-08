import { StyleSheet, View } from "react-native";
import { Divider, Icon, Surface, Text, useTheme } from "react-native-paper";
import type { DetailStat } from "../hooks/useRideDetail";

interface Props {
	distanceKm: string;
	duration: string;
	elevationGain: string;
	details: DetailStat[];
}

function chunk<T>(arr: T[], size: number): T[][] {
	const out: T[][] = [];
	for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
	return out;
}

const StatCell = ({
	d,
	borderRight,
	borderTop,
}: {
	d: DetailStat;
	borderRight: boolean;
	borderTop: boolean;
}) => {
	const { colors } = useTheme();
	return (
		<View
			style={[
				styles.cell,
				borderTop && { borderTopWidth: 1, borderTopColor: colors.outline },
				borderRight && {
					borderRightWidth: 1,
					borderRightColor: colors.outline,
				},
			]}
		>
			<Icon source={d.icon} size={16} color={colors.onSurfaceVariant} />
			<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
				{d.label}
			</Text>
			<Text
				variant="bodyLarge"
				numberOfLines={1}
				adjustsFontSizeToFit
				style={{
					color: colors.onSurface,
					fontWeight: "600",
					fontVariant: ["tabular-nums"],
				}}
			>
				{d.value}
			</Text>
		</View>
	);
};

export default function RideStatsCard({
	distanceKm,
	duration,
	elevationGain,
	details,
}: Props) {
	const { colors } = useTheme();
	const rows = chunk(details, 2);

	return (
		<Surface
			style={[styles.card, { backgroundColor: colors.surface }]}
			elevation={0}
		>
			{/* ── Hero row ─────────────────────────────────── */}

			<View style={styles.hero}>
				<View style={styles.heroStat}>
					<Text
						variant="headlineMedium"
						style={[styles.heroValue, { color: colors.primary }]}
						numberOfLines={1}
						adjustsFontSizeToFit
					>
						{distanceKm}
					</Text>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						km
					</Text>
				</View>

				<View style={styles.heroStat}>
					<Text
						variant="headlineMedium"
						style={[styles.heroValue, { color: colors.primary }]}
						numberOfLines={1}
						adjustsFontSizeToFit
					>
						{duration}
					</Text>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						{duration.split(":").length > 2 ? "h" : "min"}
					</Text>
				</View>

				<View style={styles.heroStat}>
					<Text
						variant="headlineMedium"
						style={[styles.heroValue, { color: colors.primary }]}
						numberOfLines={1}
						adjustsFontSizeToFit
					>
						{elevationGain}
					</Text>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						m &uarr;
					</Text>
				</View>
			</View>

			{/* ── Divider ──────────────────────────────────── */}

			<Divider style={{ backgroundColor: colors.outline }} />

			{/* ── Detail grid ──────────────────────────────── */}

			{rows.map((row, ri) => (
				<View key={row.toString()} style={styles.gridRow}>
					<StatCell
						d={row[0]}
						borderRight={row.length === 2}
						borderTop={ri > 0}
					/>
					{row[1] ? (
						<StatCell d={row[1]} borderRight={false} borderTop={ri > 0} />
					) : (
						<View
							style={[
								styles.cell,
								ri > 0 && {
									borderTopWidth: 1,
									borderTopColor: colors.outline,
								},
							]}
						/>
					)}
				</View>
			))}
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: {
		borderRadius: 12,
		marginTop: 12,
		marginBottom: 16,
	},
	hero: {
		flexDirection: "row",
		justifyContent: "space-around",
		paddingVertical: 14,
		paddingHorizontal: 4,
	},
	heroStat: {
		alignItems: "center",
		gap: 2,
		flex: 1,
	},
	heroValue: {
		fontWeight: "800",
		fontVariant: ["tabular-nums"],
	},
	gridRow: {
		flexDirection: "row",
	},
	cell: {
		flex: 1,
		alignItems: "center",
		gap: 2,
		paddingVertical: 10,
		paddingHorizontal: 4,
	},
});
