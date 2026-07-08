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
	unknown: MaintenanceStatus[],
): string {
	// No history at all — nudge to set up tracking
	if (due.length === 0 && soon.length === 0 && unknown.length > 0) {
		return `${unknown.length} maintenance item${unknown.length > 1 ? "s" : ""} not set up — Tap to configure`;
	}

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

	const relevant = statuses.filter(
		(s) => !s.disabled && (s.status === "due" || s.status === "soon"),
	);

	const unknown = statuses.filter((s) => !s.disabled && s.status === "unknown");

	const due = relevant.filter((s) => s.status === "due");
	const soon = relevant.filter((s) => s.status === "soon");

	const [dismissed, setDismissed] = useState(false);

	const allAlertItems = [...relevant, ...unknown];
	const fingerprint = allAlertItems
		.map((s) => `${s.type}:${s.action}:${s.status}`)
		.sort()
		.join("|");

	useEffect(() => {
		if (fingerprint) setDismissed(false);
	}, [fingerprint]);

	if (allAlertItems.length === 0 || dismissed) return null;

	const hasDue = due.length > 0;
	const hasSoon = soon.length > 0;
	const message = buildMessage(due, soon, unknown);

	// Colors: due=error, soon=warning, unknown=primary setup nudge
	const backgroundColor = hasDue
		? colors.errorContainer
		: hasSoon
			? colors.surfaceVariant
			: colors.primaryContainer;
	const textColor = hasDue
		? colors.onErrorContainer
		: hasSoon
			? colors.onSurfaceVariant
			: colors.onPrimaryContainer;
	const iconColor = hasDue
		? colors.error
		: hasSoon
			? "#e6a817"
			: colors.primary;
	const iconName = hasDue
		? "alert-circle"
		: hasSoon
			? "clock-alert-outline"
			: "wrench-outline";

	const handlePress = () => {
		router.push("/maintenance");
	};

	const handleDismiss = () => {
		setDismissed(true);
	};

	return (
		<Pressable onPress={handlePress}>
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
					onPress={handleDismiss}
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
	message: {
		flex: 1,
	},
	dismiss: {
		margin: 0,
	},
});
