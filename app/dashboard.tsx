import { router, useFocusEffect } from "expo-router";
import { Fragment, useCallback, useMemo, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	FlatList,
	StyleSheet,
	View,
} from "react-native";
import {
	Button,
	Dialog,
	Icon,
	IconButton,
	Portal,
	Searchbar,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorBanner from "../components/ErrorBanner";
import RideRow from "../components/RideRow";
import { useDeleteRideMutation, useRidesOverview } from "../hooks/queries";

export default function DashboardScreen() {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const [deleteTarget, setDeleteTarget] = useState<number | null>(null);
	const [query, setQuery] = useState("");

	const {
		rides: allRides,
		totalRides,
		stats,
		isLoading,
		isRefetching,
		isError,
		errorMessage,
		retry,
	} = useRidesOverview();
	const deleteRide = useDeleteRideMutation();

	useFocusEffect(
		useCallback(() => {
			retry();
		}, [retry]),
	);

	const filtered = useMemo(() => {
		if (!query.trim()) return allRides;
		const q = query.toLowerCase();
		return allRides.filter((r) => (r.title ?? "").toLowerCase().includes(q));
	}, [allRides, query]);

	const handleDelete = useCallback(async () => {
		if (deleteTarget == null) return;
		try {
			await deleteRide.mutateAsync(deleteTarget);
		} catch (e: unknown) {
			Alert.alert(
				"Delete failed",
				e instanceof Error ? e.message : "Something went wrong",
			);
		} finally {
			setDeleteTarget(null);
		}
	}, [deleteTarget, deleteRide]);

	const totalHrs = ((stats?.totalMin ?? 0) / 60).toFixed(1);
	const totalEle = allRides.reduce((s, r) => s + (r.elevationGain ?? 0), 0);

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

				<View style={styles.searchRow}>
					<Searchbar
						placeholder="Search rides…"
						value={query}
						onChangeText={setQuery}
						style={[styles.searchBar, { backgroundColor: colors.surface }]}
						inputStyle={{ color: colors.onSurface }}
						placeholderTextColor={colors.onSurfaceVariant}
						iconColor={colors.onSurfaceVariant}
						clearButtonMode="while-editing"
					/>
				</View>

				{isError && <ErrorBanner message={errorMessage} onRetry={retry} />}

				{!isLoading && allRides.length > 0 && (
					<View style={styles.summary}>
						<Stat label={`${totalRides} rides`} />
						<Stat label={`${(stats?.totalKm ?? 0).toFixed(0)} km`} />
						<Stat label={`${totalHrs}h`} />
						{totalEle > 0 && <Stat label={`+${totalEle}m`} />}
					</View>
				)}

				{isLoading ? (
					<View style={styles.loading}>
						<ActivityIndicator size="large" color={colors.primary} />
					</View>
				) : (
					<FlatList
						data={filtered}
						keyExtractor={(item) => String(item.id)}
						renderItem={({ item }) => (
							<RideRow ride={item} onDelete={() => setDeleteTarget(item.id)} />
						)}
						contentContainerStyle={[
							styles.list,
							{ paddingBottom: insets.bottom + 16 },
						]}
						refreshing={isRefetching}
						onRefresh={retry}
						showsVerticalScrollIndicator={false}
						ListEmptyComponent={
							<View style={styles.empty}>
								<Icon source="bike" size={48} color={colors.onSurfaceVariant} />
								<Text
									variant="bodyLarge"
									style={{ color: colors.onSurfaceVariant, marginTop: 12 }}
								>
									{query ? "No matches" : "No rides yet"}
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
							Permanently delete this ride and all its track data?
						</Text>
					</Dialog.Content>
					<Dialog.Actions>
						<Button onPress={() => setDeleteTarget(null)}>Cancel</Button>
						<Button
							onPress={handleDelete}
							loading={deleteRide.isPending}
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
	searchRow: {
		paddingHorizontal: 16,
		paddingBottom: 12,
	},
	searchBar: {
		borderRadius: 12,
		elevation: 0,
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
