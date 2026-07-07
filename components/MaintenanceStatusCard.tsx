import { StyleSheet, View } from "react-native";
import {
	Icon,
	IconButton,
	Surface,
	Switch,
	Text,
	useTheme,
} from "react-native-paper";
import type {
	MaintenanceAction,
	MaintenanceStatus,
	MaintenanceType,
	MaintenanceTypeInfo,
} from "../types";
import {
	BRAKE_PAD_MATERIALS,
	FORK_TYPES,
	MAINTENANCE_DEFAULTS,
} from "../types";

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
])
	TYPE_INFO[t.type] = t;

function dotColor(
	status: string,
	disabled: boolean,
	colors: ReturnType<typeof useTheme>["colors"],
) {
	if (disabled) return colors.onSurfaceVariant;
	switch (status) {
		case "due":
			return colors.error;
		case "soon":
			return "#e6a817";
		case "ok":
			return "#4caf50";
		default:
			return colors.onSurfaceVariant;
	}
}

function label(s: MaintenanceStatus): string {
	if (s.status === "unknown") return s.disabled ? "Disabled" : "No data";
	const p: string[] = [];
	if (s.remainingKm !== null)
		p.push(
			s.remainingKm <= 0
				? `Overdue ${Math.abs(s.remainingKm)}km`
				: `${s.remainingKm}km left`,
		);
	if (s.remainingDays !== null)
		p.push(
			s.remainingDays <= 0
				? `Overdue ${Math.abs(s.remainingDays)}d`
				: `${s.remainingDays}d left`,
		);
	return p.length > 0 ? p.join(" · ") : s.status === "ok" ? "OK" : "DUE";
}

export function getDefaults(type: MaintenanceType, action: MaintenanceAction) {
	const def = MAINTENANCE_DEFAULTS[type];
	let km = action === "check" ? def.checkKm : def.replaceKm;
	let days = action === "check" ? def.checkDays : def.replaceDays;
	if (km === 0 && days === 0) {
		if (type === "brake_pads") km = BRAKE_PAD_MATERIALS[0].intervalKm;
		if (type === "fork") {
			km = FORK_TYPES[0].intervalKm;
			days = FORK_TYPES[0].intervalDays;
		}
	}
	return { km: km > 0 ? String(km) : "", days: days > 0 ? String(days) : "" };
}

interface Props {
	type: MaintenanceType;
	pair: { check?: MaintenanceStatus; replace?: MaintenanceStatus };
	disabled: boolean;
	onToggle: () => void;
	onLog: (action: MaintenanceAction) => void;
	onQuickService: (action: MaintenanceAction) => void;
}

export default function MaintenanceStatusCard({
	type,
	pair,
	disabled,
	onToggle,
	onLog,
	onQuickService,
}: Props) {
	const { colors } = useTheme();
	const info = TYPE_INFO[type];
	if (!info) return null;

	return (
		<Surface
			style={[styles.card, { backgroundColor: colors.surface }]}
			elevation={0}
		>
			<View style={styles.header}>
				<Icon
					source={info.icon}
					size={22}
					color={disabled ? colors.onSurfaceVariant : colors.primary}
				/>
				<Text
					variant="titleSmall"
					style={{
						color: disabled ? colors.onSurfaceVariant : colors.onSurface,
						fontWeight: "700",
						flex: 1,
					}}
				>
					{info.label}
				</Text>
				<Switch
					value={!disabled}
					onValueChange={onToggle}
					color={colors.primary}
				/>
			</View>

			{(["check", "replace"] as MaintenanceAction[]).map((action) => {
				const s = pair[action];
				const defs = getDefaults(type, action);
				const clr =
					s && !disabled
						? dotColor(s.status, false, colors)
						: colors.onSurfaceVariant;
				let txt: string;
				if (disabled) txt = "Disabled";
				else if (s) txt = label(s);
				else {
					const p = [
						defs.km ? `every ${defs.km}km` : "",
						defs.days ? `every ${defs.days}d` : "",
					].filter(Boolean);
					txt = p.length > 0 ? p.join(" · ") : "—";
				}

				return (
					<View
						key={action}
						style={[styles.row, { opacity: disabled ? 0.4 : 1 }]}
					>
						<View style={styles.rowLeft}>
							<View style={[styles.dot, { backgroundColor: clr }]} />
							<Text
								variant="bodyMedium"
								style={{
									color: disabled ? colors.onSurfaceVariant : colors.onSurface,
									fontWeight: "500",
								}}
							>
								{action === "check" ? "Check" : "Replace"}
							</Text>
						</View>
						<Text
							variant="bodySmall"
							style={{ color: colors.onSurfaceVariant, flex: 1 }}
							numberOfLines={1}
						>
							{txt}
						</Text>
						<IconButton
							icon="checkbox-marked-circle-outline"
							size={20}
							iconColor={disabled ? colors.onSurfaceVariant : "#4caf50"}
							onPress={() => onQuickService(action)}
							style={{ margin: 0 }}
						/>
						<IconButton
							icon="pencil-outline"
							size={18}
							iconColor={
								disabled ? colors.onSurfaceVariant : colors.onSurfaceVariant
							}
							onPress={() => onLog(action)}
							style={{ margin: 0, marginLeft: -4 }}
						/>
					</View>
				);
			})}
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: { marginBottom: 10, borderRadius: 14, padding: 16 },
	header: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		marginBottom: 12,
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingVertical: 6,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: "rgba(128,128,128,0.2)",
	},
	rowLeft: { flexDirection: "row", alignItems: "center", gap: 8, width: 80 },
	dot: { width: 10, height: 10, borderRadius: 5 },
});
