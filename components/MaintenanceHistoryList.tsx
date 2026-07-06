import type { FlatListProps } from "react-native";
import { FlatList, StyleSheet, View } from "react-native";
import {
	Chip,
	Icon,
	IconButton,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import type { MaintenanceLog, MaintenanceTypeInfo } from "../types";

const TYPE_INFO: Record<string, MaintenanceTypeInfo> = {};
for (const t of [
	{ type: "brake_pads" as const, label: "Brake Pads", icon: "car-brake-alert" },
	{ type: "fork" as const, label: "Fork Service", icon: "car-shift-pattern" },
	{ type: "tires" as const, label: "Tires", icon: "tire" },
	{ type: "chain" as const, label: "Chain", icon: "link-variant" },
	{ type: "cassette" as const, label: "Cassette", icon: "cog" },
	{ type: "other" as const, label: "Other", icon: "wrench" },
])
	TYPE_INFO[t.type] = t;

interface Props
	extends Omit<FlatListProps<MaintenanceLog>, "renderItem" | "keyExtractor"> {
	onDelete: (id: number) => void;
}

export default function MaintenanceHistoryList({ onDelete, ...rest }: Props) {
	const { colors } = useTheme();

	return (
		<FlatList
			{...rest}
			keyExtractor={(item) => String(item.id)}
			ListEmptyComponent={
				<View style={styles.empty}>
					<Icon source="wrench" size={40} color={colors.onSurfaceVariant} />
					<Text
						variant="bodyMedium"
						style={{ color: colors.onSurfaceVariant, marginTop: 8 }}
					>
						No service logs yet
					</Text>
				</View>
			}
			renderItem={({ item }) => {
				const info = TYPE_INFO[item.type];
				return (
					<Surface
						style={[styles.card, { backgroundColor: colors.surface }]}
						elevation={0}
					>
						<View style={styles.row}>
							<View style={styles.info}>
								<View style={styles.typeRow}>
									<Icon
										source={info?.icon ?? "wrench"}
										size={16}
										color={colors.primary}
									/>
									<Text
										variant="labelMedium"
										style={{ color: colors.onSurface, fontWeight: "600" }}
									>
										{info?.label ?? item.type}
									</Text>
									<Chip
										compact
										textStyle={{ fontSize: 10 }}
										style={{ height: 20 }}
									>
										{item.action}
									</Chip>
								</View>
								<Text
									variant="bodySmall"
									style={{ color: colors.onSurfaceVariant }}
								>
									{new Date(item.performedAt).toLocaleDateString()} ·{" "}
									{item.odometerKm} km
									{item.intervalKm ? ` · every ${item.intervalKm} km` : ""}
									{item.intervalDays ? ` · every ${item.intervalDays}d` : ""}
									{item.cost != null ? ` · $${item.cost}` : ""}
								</Text>
								{item.notes && (
									<Text
										variant="bodySmall"
										style={{ color: colors.onSurfaceVariant }}
									>
										{item.notes}
									</Text>
								)}
							</View>
							<IconButton
								icon="delete-outline"
								size={18}
								iconColor={colors.error}
								onPress={() => onDelete(item.id)}
							/>
						</View>
					</Surface>
				);
			}}
		/>
	);
}

const styles = StyleSheet.create({
	card: { marginBottom: 8, borderRadius: 12, padding: 12 },
	row: { flexDirection: "row", alignItems: "center" },
	info: { flex: 1, gap: 2 },
	typeRow: { flexDirection: "row", alignItems: "center", gap: 6 },
	empty: { alignItems: "center", paddingVertical: 40 },
});
