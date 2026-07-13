import * as Location from "expo-location";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import {
	Icon,
	Surface,
	Text,
	TouchableRipple,
	useTheme,
} from "react-native-paper";
import { requestBatteryExemption } from "../services/battery";

type PermState = "granted" | "denied" | "checking";

interface Row {
	icon: string;
	label: string;
	state: PermState;
	onPress?: () => void;
}

export default function PermissionCheck() {
	const { colors } = useTheme();
	const [rows, setRows] = useState<Row[]>([
		{ icon: "map-marker", label: "Location", state: "checking" },
		{
			icon: "map-marker-radius",
			label: "Background location",
			state: "checking",
		},
		{
			icon: "battery-heart",
			label: "Battery optimisation",
			state: "checking",
			onPress: requestBatteryExemption,
		},
	]);

	useEffect(() => {
		(async () => {
			const fg = await Location.getForegroundPermissionsAsync();
			const bg = await Location.getBackgroundPermissionsAsync();
			setRows((prev) => {
				const next = [...prev];
				next[0].state = fg.granted ? "granted" : "denied";
				next[1].state = bg.granted ? "granted" : "denied";
				next[2].state = "denied"; // battery: always show action, can't read real state
				return next;
			});
		})();
	}, []);

	return (
		<View style={styles.wrapper}>
			<Text
				variant="titleSmall"
				style={{ color: colors.onSurface, fontWeight: "700", marginBottom: 12 }}
			>
				Permissions
			</Text>

			<Surface
				style={[styles.card, { backgroundColor: colors.surface }]}
				elevation={0}
			>
				{rows.map((row, i) => (
					<TouchableRipple
						key={row.label}
						onPress={row.onPress}
						disabled={!row.onPress}
						borderless
						style={[
							styles.row,
							i < rows.length - 1 && {
								borderBottomWidth: StyleSheet.hairlineWidth,
								borderColor: colors.outlineVariant,
							},
						]}
					>
						<>
							<Icon
								source={row.icon}
								size={20}
								color={colors.onSurfaceVariant}
							/>
							<Text
								variant="bodyMedium"
								style={{ color: colors.onSurface, flex: 1 }}
							>
								{row.label}
							</Text>
							{row.state === "checking" ? (
								<Text
									variant="bodySmall"
									style={{ color: colors.onSurfaceVariant }}
								>
									Checking…
								</Text>
							) : row.state === "granted" ? (
								<View
									style={[
										styles.badge,
										{ backgroundColor: colors.primaryContainer },
									]}
								>
									<Text
										variant="labelSmall"
										style={{ color: colors.primary, fontWeight: "600" }}
									>
										Granted
									</Text>
								</View>
							) : row.onPress ? (
								<View
									style={[
										styles.badge,
										{ backgroundColor: colors.errorContainer },
									]}
								>
									<Text
										variant="labelSmall"
										style={{ color: colors.error, fontWeight: "600" }}
									>
										Fix
									</Text>
								</View>
							) : (
								<View
									style={[
										styles.badge,
										{ backgroundColor: colors.errorContainer },
									]}
								>
									<Text
										variant="labelSmall"
										style={{ color: colors.error, fontWeight: "600" }}
									>
										Denied
									</Text>
								</View>
							)}
						</>
					</TouchableRipple>
				))}
			</Surface>
		</View>
	);
}

const styles = StyleSheet.create({
	wrapper: { marginBottom: 8 },
	card: { borderRadius: 14, overflow: "hidden" },
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingVertical: 14,
		paddingHorizontal: 16,
	},
	badge: {
		borderRadius: 8,
		paddingHorizontal: 10,
		paddingVertical: 4,
	},
});
