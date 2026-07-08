import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { Icon, IconButton, Surface, Text, useTheme } from "react-native-paper";
import { buildMessage } from "../helpers/maintenance";
import type { MaintenanceStatus } from "../types";

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
