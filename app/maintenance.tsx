import { router, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useState } from "react";
import {
	Alert,
	FlatList,
	StyleSheet,
	useColorScheme,
	View,
} from "react-native";
import {
	Button,
	Dialog,
	IconButton,
	Portal,
	SegmentedButtons,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorBanner from "../components/ErrorBanner";
import MaintenanceHistoryList from "../components/MaintenanceHistoryList";
import MaintenanceLogDialog from "../components/MaintenanceLogDialog";
import MaintenanceStatusCard, {
	getDefaults,
} from "../components/MaintenanceStatusCard";
import {
	useCreateMaintenanceLogMutation,
	useDeleteMaintenanceLogMutation,
	useMaintenanceLogsQuery,
	useMaintenanceSummaryQuery,
} from "../hooks/queries";
import { api } from "../services/api";
import type {
	MaintenanceAction,
	MaintenanceStatus,
	MaintenanceType,
} from "../types";
import { MAINTENANCE_TYPES } from "../types";

export default function MaintenanceScreen() {
	const { colors } = useTheme();
	const scheme = useColorScheme();
	const insets = useSafeAreaInsets();

	const summary = useMaintenanceSummaryQuery();
	const logs = useMaintenanceLogsQuery({ pageSize: 50 });
	const createLog = useCreateMaintenanceLogMutation();
	const deleteLog = useDeleteMaintenanceLogMutation();

	const [tab, setTab] = useState<"status" | "history">("status");
	const [disabled, setDisabled] = useState<Set<string>>(new Set());
	const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
	const [dialog, setDialog] = useState<{
		type: MaintenanceType;
		action: MaintenanceAction;
	} | null>(null);

	useFocusEffect(
		useCallback(() => {
			summary.refetch();
			logs.refetch();
		}, [summary.refetch, logs.refetch]),
	);

	if (summary.data && disabled.size === 0) {
		const d = summary.data.filter((s) => s.disabled).map((s) => s.type);
		if (d.length > 0) setDisabled(new Set(d));
	}

	const summaryByType: Record<
		string,
		{ check?: MaintenanceStatus; replace?: MaintenanceStatus }
	> = {};
	for (const s of summary.data ?? []) {
		if (!summaryByType[s.type]) summaryByType[s.type] = {};
		summaryByType[s.type][s.action] = s;
	}

	const toggle = useCallback(
		async (type: MaintenanceType) => {
			const cur = disabled.has(type);
			const next = !cur;
			setDisabled((prev) => {
				const s = new Set(prev);
				next ? s.add(type) : s.delete(type);
				return s;
			});
			try {
				await api.toggleMaintenanceSetting(type, next);
			} catch {
				setDisabled((prev) => {
					const s = new Set(prev);
					next ? s.delete(type) : s.add(type);
					return s;
				});
				Alert.alert("Failed", "Could not update setting");
			}
		},
		[disabled],
	);

	const handleSave = useCallback(
		async (odoKm: number) => {
			if (!dialog) return;
			const defs = getDefaults(dialog.type, dialog.action);
			try {
				await createLog.mutateAsync({
					type: dialog.type,
					action: dialog.action,
					odometerKm: odoKm,
					intervalKm: defs.km ? Number.parseFloat(defs.km) : undefined,
					intervalDays: defs.days ? Number.parseInt(defs.days, 10) : undefined,
					performedAt: new Date().toISOString(),
				});
				setDialog(null);
			} catch (e: unknown) {
				Alert.alert(
					"Failed",
					e instanceof Error ? e.message : "Something went wrong",
				);
			}
		},
		[dialog, createLog],
	);

	const handleDelete = useCallback(async () => {
		if (deleteTarget == null) return;
		try {
			await deleteLog.mutateAsync(deleteTarget);
		} catch (e: unknown) {
			Alert.alert(
				"Delete failed",
				e instanceof Error ? e.message : "Something went wrong",
			);
		} finally {
			setDeleteTarget(null);
		}
	}, [deleteTarget, deleteLog]);

	const isError = summary.isError || logs.isError;
	const errMsg =
		summary.error instanceof Error
			? summary.error.message
			: logs.error instanceof Error
				? logs.error.message
				: "Unable to load data";
	const logsData = logs.data?.data ?? [];

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<StatusBar
				style={scheme === "dark" ? "light" : "dark"}
				backgroundColor={colors.background}
			/>
			<View style={[styles.nav, { paddingTop: insets.top + 8 }]}>
				<IconButton icon="arrow-left" size={22} onPress={() => router.back()} />
				<Text
					variant="titleMedium"
					style={{ color: colors.onBackground, fontWeight: "700", flex: 1 }}
				>
					Maintenance
				</Text>
			</View>
			{isError && (
				<ErrorBanner
					message={errMsg}
					onRetry={() => {
						summary.refetch();
						logs.refetch();
					}}
				/>
			)}

			<View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
				<SegmentedButtons
					value={tab}
					onValueChange={(v) => setTab(v as "status" | "history")}
					buttons={[
						{ value: "status", label: "Status" },
						{ value: "history", label: `History (${logsData.length})` },
					]}
				/>
			</View>

			{tab === "status" ? (
				<FlatList
					data={MAINTENANCE_TYPES.filter((t) => t.type !== "other")}
					keyExtractor={(item) => item.type}
					renderItem={({ item: info }) => (
						<MaintenanceStatusCard
							type={info.type}
							pair={summaryByType[info.type] ?? {}}
							disabled={disabled.has(info.type)}
							onToggle={() => toggle(info.type)}
							onLog={(action) => setDialog({ type: info.type, action })}
						/>
					)}
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingBottom: insets.bottom + 16,
					}}
					showsVerticalScrollIndicator={false}
				/>
			) : (
				<MaintenanceHistoryList
					data={logsData}
					onDelete={(id) => setDeleteTarget(id)}
					contentContainerStyle={{
						paddingHorizontal: 24,
						paddingBottom: insets.bottom + 16,
					}}
					showsVerticalScrollIndicator={false}
				/>
			)}

			<MaintenanceLogDialog
				visible={dialog !== null}
				type={dialog?.type ?? "other"}
				action={dialog?.action ?? "check"}
				saving={createLog.isPending}
				onDismiss={() => setDialog(null)}
				onSave={handleSave}
			/>

			<Portal>
				<Dialog
					visible={deleteTarget !== null}
					onDismiss={() => setDeleteTarget(null)}
				>
					<Dialog.Title>Delete log?</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">Remove this service record?</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setDeleteTarget(null)}>Cancel</Button>
						<Button
							onPress={handleDelete}
							loading={deleteLog.isPending}
							textColor={colors.error}
						>
							Delete
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	nav: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingBottom: 4,
	},
});
