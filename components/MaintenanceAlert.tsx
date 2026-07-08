import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon, IconButton, Surface, Text, useTheme } from "react-native-paper";
import type { MaintenanceStatus, MaintenanceType } from "../types";

const TYPE_LABEL: Record<MaintenanceType, string> = {
	brake_pads: "Brake pads",
	fork: "Fork",
	tires: "Tires",
	chain: "Chain",
	cassette: "Cassette",
	other: "Maintenance",
};

function formatLabel(s: MaintenanceStatus): string {
	const parts: string[] = [];
	if (s.remainingKm !== null) {
		parts.push(
			s.remainingKm <= 0
				? `${Math.abs(s.remainingKm)} km ago`
				: `${s.remainingKm} km left`,
		);
	}
	if (s.remainingDays !== null) {
		parts.push(
			s.remainingDays <= 0
				? `${Math.abs(s.remainingDays)}d ago`
				: `${s.remainingDays}d left`,
		);
	}
	return parts.join(" · ");
}

function buildMessage(
	due: MaintenanceStatus[],
	soon: MaintenanceStatus[],
): string {
	if (due.length === 1 && soon.length === 0) {
		const s = due[0];
		const typeLabel = TYPE_LABEL[s.type] ?? s.type;
		const action = s.action === "replace" ? "replacement" : "check";
		const label = formatLabel(s);
		return `${typeLabel} ${action} overdue — ${label}`;
	}
	if (due.length === 0 && soon.length === 1) {
		const s = soon[0];
		const typeLabel = TYPE_LABEL[s.type] ?? s.type;
		const action = s.action === "replace" ? "replacement" : "check";
		const label = formatLabel(s);
		return `${typeLabel} ${action} due soon — ${label}`;
	}

	const parts: string[] = [];
	if (due.length > 0)
		parts.push(`${due.length} item${due.length > 1 ? "s" : ""} overdue`);
	if (soon.length > 0) parts.push(`${soon.length} due soon`);
	return `${parts.join(", ")} — Tap to review`;
}

interface Props {
	statuses: MaintenanceStatus[];
}

export default function MaintenanceAlert({ statuses }: Props) {
	const { colors } = useTheme();
	const c = colors as unknown as Record<string, string>;
	const warning = c.warning ?? "#c9a050";
	const warningContainer = c.warningContainer ?? "#3d3018";
	const onWarningContainer = c.onWarningContainer ?? "#f0deaa";

	const relevant = statuses.filter(
		(s) => !s.disabled && (s.status === "due" || s.status === "soon"),
	);
	const due = relevant.filter((s) => s.status === "due");
	const soon = relevant.filter((s) => s.status === "soon");

	const [dismissed, setDismissed] = useState(false);

	const fingerprint = relevant
		.map((s) => `${s.type}:${s.action}:${s.status}`)
		.sort()
		.join("|");

	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		setDismissed(false);
	}, [fingerprint]);

	if (relevant.length === 0 || dismissed) return null;

	const hasDue = due.length > 0;
	const message = buildMessage(due, soon);

	const backgroundColor = hasDue ? colors.errorContainer : warningContainer;
	const textColor = hasDue ? colors.onErrorContainer : onWarningContainer;
	const iconColor = hasDue ? colors.error : warning;
	const iconName = hasDue ? "alert-circle" : "clock-alert-outline";

	return (
		<Pressable onPress={() => router.push("/maintenance")}>
			<Surface style={[styles.card, { backgroundColor }]} elevation={0}>
				<View style={styles.row}>
					<Icon source={iconName} size={20} color={iconColor} />
					<Text
						variant="bodyMedium"
						style={[styles.message, { color: textColor }]}
						numberOfLines={3}
					>
						{message}
					</Text>
				</View>
				<IconButton
					icon="close"
					size={18}
					iconColor={textColor}
					onPress={() => setDismissed(true)}
					style={styles.dismiss}
				/>
			</Surface>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		marginHorizontal: 24,
		marginBottom: 16,
		borderRadius: 12,
		padding: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
		marginRight: 8,
	},
	message: { flex: 1 },
	dismiss: { margin: 0 },
});
