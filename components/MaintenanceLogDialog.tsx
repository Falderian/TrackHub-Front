import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import {
	Button,
	Chip,
	Dialog,
	Portal,
	Text,
	useTheme,
} from "react-native-paper";
import type {
	MaintenanceAction,
	MaintenanceType,
	MaintenanceTypeInfo,
} from "../types";
import { BRAKE_PAD_MATERIALS, FORK_TYPES } from "../types";
import { getDefaults } from "./MaintenanceStatusCard";

const TYPE_INFO: Record<string, MaintenanceTypeInfo> = {};
for (const t of [
	{
		type: "brake_pads" as MaintenanceType,
		label: "Brake Pads",
		icon: "car-brake-alert",
	},
	{
		type: "fork" as MaintenanceType,
		label: "Fork Service",
		icon: "car-shift-pattern",
	},
	{ type: "tires" as MaintenanceType, label: "Tires", icon: "tire" },
	{ type: "chain" as MaintenanceType, label: "Chain", icon: "link-variant" },
	{ type: "cassette" as MaintenanceType, label: "Cassette", icon: "cog" },
	{ type: "other" as MaintenanceType, label: "Other", icon: "wrench" },
])
	TYPE_INFO[t.type] = t;

export interface MaintenanceLogData {
	intervalKm?: number;
	intervalDays?: number;
}

interface Props {
	visible: boolean;
	type: MaintenanceType;
	action: MaintenanceAction;
	saving: boolean;
	onDismiss: () => void;
	onSave: (data: MaintenanceLogData) => void;
}

export default function MaintenanceLogDialog({
	visible,
	type,
	action,
	saving,
	onDismiss,
	onSave,
}: Props) {
	const { colors } = useTheme();
	const defs = getDefaults(type, action);
	const info = TYPE_INFO[type];

	const [intervalKm, setIntervalKm] = useState(defs.km);
	const [intervalDays, setIntervalDays] = useState(defs.days);

	const handleSave = () => {
		const kmNum = intervalKm ? Number.parseFloat(intervalKm) : undefined;
		const daysNum = intervalDays
			? Number.parseInt(intervalDays, 10)
			: undefined;
		const data: MaintenanceLogData = {
			intervalKm: kmNum && !Number.isNaN(kmNum) ? kmNum : undefined,
			intervalDays: daysNum && !Number.isNaN(daysNum) ? daysNum : undefined,
		};
		onSave(data);
		setIntervalKm(defs.km);
		setIntervalDays(defs.days);
	};

	const presets: { label: string; km: number; days: number }[] = [];
	if (type === "brake_pads") {
		for (const m of BRAKE_PAD_MATERIALS)
			presets.push({ label: m.label, km: m.intervalKm, days: 0 });
	} else if (type === "fork") {
		for (const f of FORK_TYPES)
			presets.push({ label: f.label, km: f.intervalKm, days: f.intervalDays });
	}

	return (
		<Portal>
			<Dialog visible={visible} onDismiss={onDismiss}>
				<Dialog.Title>
					{info?.label ?? type} · {action}
				</Dialog.Title>
				<Dialog.Content>
					<Text
						variant="bodyMedium"
						style={{ color: colors.onSurfaceVariant, marginBottom: 12 }}
					>
						Odometer auto-fills from total ride distance. Set service intervals:
					</Text>

					<View style={styles.row}>
						<View style={{ flex: 1 }}>
							<Text
								variant="labelSmall"
								style={{ color: colors.onSurfaceVariant, marginBottom: 4 }}
							>
								Every (km)
							</Text>
							<TextInput
								value={intervalKm}
								onChangeText={setIntervalKm}
								keyboardType="numeric"
								placeholder="e.g. 2000"
								placeholderTextColor={colors.onSurfaceVariant}
								style={[
									styles.input,
									{
										color: colors.onSurface,
										backgroundColor: colors.surfaceVariant,
									},
								]}
							/>
						</View>
						<View style={{ flex: 1 }}>
							<Text
								variant="labelSmall"
								style={{ color: colors.onSurfaceVariant, marginBottom: 4 }}
							>
								Every (days)
							</Text>
							<TextInput
								value={intervalDays}
								onChangeText={setIntervalDays}
								keyboardType="numeric"
								placeholder="e.g. 90"
								placeholderTextColor={colors.onSurfaceVariant}
								style={[
									styles.input,
									{
										color: colors.onSurface,
										backgroundColor: colors.surfaceVariant,
									},
								]}
							/>
						</View>
					</View>

					{presets.length > 0 && (
						<View style={styles.chips}>
							{presets.map((p) => (
								<Chip
									key={p.label}
									compact
									mode="outlined"
									style={{ marginRight: 6, marginBottom: 4 }}
									onPress={() => {
										setIntervalKm(String(p.km));
										setIntervalDays(p.days > 0 ? String(p.days) : "");
									}}
								>
									{p.label}
								</Chip>
							))}
						</View>
					)}
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={onDismiss}>Cancel</Button>
					<Button onPress={handleSave} loading={saving}>
						Save
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: 10, marginBottom: 4 },
	chips: { flexDirection: "row", flexWrap: "wrap", marginTop: 8 },
	input: {
		fontSize: 16,
		paddingVertical: 10,
		paddingHorizontal: 14,
		borderRadius: 10,
		marginBottom: 10,
	},
});
