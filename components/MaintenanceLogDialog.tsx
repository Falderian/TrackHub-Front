import { useState } from "react";
import { StyleSheet, TextInput, View } from "react-native";
import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";
import type {
	MaintenanceAction,
	MaintenanceType,
	MaintenanceTypeInfo,
} from "../types";
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

interface Props {
	visible: boolean;
	type: MaintenanceType;
	action: MaintenanceAction;
	saving: boolean;
	onDismiss: () => void;
	onSave: (odometerKm: number) => void;
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
	const [odo, setOdo] = useState("");

	const defs = getDefaults(type, action);
	const info = TYPE_INFO[type];

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
						Current odometer (km):
					</Text>
					<TextInput
						value={odo}
						onChangeText={setOdo}
						keyboardType="numeric"
						placeholder="e.g. 3427"
						placeholderTextColor={colors.onSurfaceVariant}
						style={[
							styles.input,
							{
								color: colors.onSurface,
								backgroundColor: colors.surfaceVariant,
							},
						]}
						autoFocus
					/>
					<View style={styles.quickRow}>
						{["+100", "+500", "+1000"].map((l) => (
							<Button
								key={l}
								mode="outlined"
								compact
								style={{ flex: 1 }}
								onPress={() =>
									setOdo(
										String(
											(Number.parseFloat(odo) || 0) + Number.parseInt(l, 10),
										),
									)
								}
							>
								{l}
							</Button>
						))}
					</View>
					<Text
						variant="labelSmall"
						style={{
							color: colors.onSurfaceVariant,
							marginTop: 8,
							textAlign: "center",
						}}
					>
						Interval:{" "}
						{[
							defs.km ? `${defs.km} km` : "",
							defs.days ? `${defs.days} days` : "",
						]
							.filter(Boolean)
							.join(" · ") || "none"}
					</Text>
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={onDismiss}>Cancel</Button>
					<Button
						onPress={() => {
							const n = Number.parseFloat(odo);
							if (!Number.isNaN(n) && n >= 0) onSave(n);
						}}
						loading={saving}
					>
						Save
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}

const styles = StyleSheet.create({
	input: {
		fontSize: 28,
		fontWeight: "800",
		textAlign: "center",
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		marginBottom: 12,
	},
	quickRow: { flexDirection: "row", gap: 6 },
});
