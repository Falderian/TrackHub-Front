import { router, useFocusEffect } from "expo-router";
import { Fragment, useCallback, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, View } from "react-native";
import {
	Button,
	Dialog,
	Icon,
	IconButton,
	Portal,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import RideRow from "../components/RideRow";
import { api } from "../services/api";
import type { Ride, RideStats } from "../types";

export default function DashboardScreen() {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const [rides, setRides] = useState<Ride[]>([]);
	const [totalRides, setTotalRides] = useState(0);
	const [stats, setStats] = useState<RideStats>({
		totalRides: 0,
		totalKm: 0,
		totalMin: 0,
	});
	const [loading, setLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);
	const [deleteTarget, setDeleteTarget] = useState<Ride | null>(null);
	const [deleting, setDeleting] = useState(false);

	const fetchData = useCallback(async () => {
		const [ridesRes, statsRes] = await Promise.all([
			api.getRides({ pageSize: 100 }),
			api.getRideStats().catch(() => null),
		]);
		setRides(ridesRes.data);
		setTotalRides(ridesRes.meta.total);
		if (statsRes) setStats(statsRes);
	}, []);

	useFocusEffect(
		useCallback(() => {
			fetchData().finally(() => setLoading(false));
		}, [fetchData]),
	);

	const onRefresh = useCallback(async () => {
		setRefreshing(true);
		await fetchData();
		setRefreshing(false);
	}, [fetchData]);

	const handleDelete = useCallback(async () => {
		if (!deleteTarget) return;
		setDeleting(true);
		try {
			await api.deleteRide(deleteTarget.id);
			setRides((prev) => prev.filter((r) => r.id !== deleteTarget.id));
			setTotalRides((prev) => prev - 1);
		} catch {
			// Failed — keep the ride in the list
		} finally {
			setDeleting(false);
			setDeleteTarget(null);
		}
	}, [deleteTarget]);

	const totalHrs = (stats.totalMin / 60).toFixed(1);
	const totalEle = rides.reduce((s, r) => s + (r.elevationGain ?? 0), 0);

	return (
		<Fragment>
			<View
				style={[
					styles.container,
					{ backgroundColor: colors.background, paddingBottom: insets.bottom },
				]}
			>
				<View style={[styles.nav, { paddingTop: insets.top + 8 }]}>
					<IconButton
						icon="arrow-left"
						size={22}
						onPress={() => router.back()}
					/>
					<Text
						variant="titleMedium"
						style={{ color: colors.onBackground, fontWeight: "700", flex: 1 }}
					>
						All Rides
					</Text>
				</View>

				{!loading && rides.length > 0 && (
					<View style={styles.summary}>
						<Stat label={`${totalRides} rides`} />
						<Stat label={`${stats.totalKm.toFixed(0)} km`} />
						<Stat label={`${totalHrs}h`} />
						{totalEle > 0 && <Stat label={`+${totalEle}m`} />}
					</View>
				)}

				{loading ? (
					<View style={styles.loading}>
						<ActivityIndicator size="large" color={colors.primary} />
					</View>
				) : (
					<FlatList
						data={rides}
						keyExtractor={(item) => String(item.id)}
						renderItem={({ item }) => (
							<RideRow ride={item} onDelete={() => setDeleteTarget(item)} />
						)}
						contentContainerStyle={[
							styles.list,
							{ paddingBottom: insets.bottom + 16 },
						]}
						refreshing={refreshing}
						onRefresh={onRefresh}
						showsVerticalScrollIndicator={false}
						ListEmptyComponent={
							<View style={styles.empty}>
								<Icon source="bike" size={48} color={colors.onSurfaceVariant} />
								<Text
									variant="bodyLarge"
									style={{ color: colors.onSurfaceVariant, marginTop: 12 }}
								>
									No rides yet
								</Text>
							</View>
						}
					/>
				)}
			</View>
			<Portal>
				<Dialog
					visible={deleteTarget !== null}
					onDismiss={() => setDeleteTarget(null)}
				>
					<Dialog.Title>Delete ride?</Dialog.Title>
					<Dialog.Content>
						<Text variant="bodyMedium">
							Permanently delete "{deleteTarget?.title ?? "this ride"}" and all
							its track data?
						</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setDeleteTarget(null)}>Cancel</Button>
						<Button
							onPress={handleDelete}
							loading={deleting}
							textColor={colors.error}
						>
							Delete
						</Button>
					</Dialog.Actions>
				</Dialog>
			</Portal>
		</Fragment>
	);
}

function Stat({ label }: { label: string }) {
	const { colors } = useTheme();
	return (
		<Text variant="labelMedium" style={{ color: colors.onSurfaceVariant }}>
			{label}
		</Text>
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
	summary: {
		flexDirection: "row",
		gap: 20,
		paddingHorizontal: 24,
		paddingBottom: 16,
	},
	loading: { flex: 1, justifyContent: "center", alignItems: "center" },
	empty: { alignItems: "center", paddingTop: 80 },
	list: { paddingHorizontal: 24 },
});
