import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import {
	ScrollView,
	StyleSheet,
	useWindowDimensions,
	View,
} from "react-native";
import { Snackbar, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DeleteRideDialog from "../../components/DeleteRideDialog";
import ErrorBanner from "../../components/ErrorBanner";
import RideActions from "../../components/RideActions";
import RideCharts from "../../components/RideCharts";
import RideDetailGrid from "../../components/RideDetailGrid";
import RideDetailHeader from "../../components/RideDetailHeader";
import RideHeroStats from "../../components/RideHeroStats";
import RideMap from "../../components/RideMap";
import { SkeletonRideDetail } from "../../components/SkeletonLoader";
import useRideDetail from "../../hooks/useRideDetail";
import { api } from "../../services/api";

export default function RideDetailScreen() {
	const { colors } = useTheme();
	const insets = useSafeAreaInsets();
	const { width: screenW } = useWindowDimensions();
	const {
		ride,
		loading,
		rideError,
		refetch,
		deleting,
		showDeleteDialog,
		setShowDeleteDialog,
		handleDelete,
		dateLabel,
		durLabel,
		mid,
		details,
		hasCharts,
	} = useRideDetail();

	const [exporting, setExporting] = useState(false);
	const [snackVisible, setSnackVisible] = useState(false);

	const handleExportGpx = useCallback(async () => {
		if (!ride) return;
		setExporting(true);
		try {
			const gpx = await api.getRideGpx(ride.id);
			const filename = `trackhub-ride-${ride.id}.gpx`;
			const fileUri = `${FileSystem.cacheDirectory}${filename}`;
			await FileSystem.writeAsStringAsync(fileUri, gpx, {
				encoding: FileSystem.EncodingType.UTF8,
			});
			const canShare = await Sharing.isAvailableAsync();
			if (canShare) {
				await Sharing.shareAsync(fileUri, {
					mimeType: "application/gpx+xml",
					dialogTitle: "Export GPX",
				});
			} else {
				setSnackVisible(true);
			}
		} catch (err) {
			console.warn("[TrackHub] GPX export failed:", err);
			setSnackVisible(true);
		} finally {
			setExporting(false);
		}
	}, [ride]);

	// ── Error state ──────────────────────────────────────────────

	if (rideError) {
		return (
			<View
				style={[
					styles.container,
					styles.centered,
					{ backgroundColor: colors.background },
				]}
			>
				<ErrorBanner message={rideError} onRetry={refetch} />
			</View>
		);
	}

	// ── Loading state ────────────────────────────────────────────

	if (loading || !ride) {
		return (
			<View style={[styles.container, { backgroundColor: colors.background }]}>
				<SkeletonRideDetail />
			</View>
		);
	}

	// ── Content ──────────────────────────────────────────────────

	const chartW = screenW - 40 - 32 - 52;

	const distanceKm =
		ride.distance != null ? (ride.distance / 1000).toFixed(1) : "—";
	const elevation =
		ride.elevationGain != null ? `${Math.round(ride.elevationGain)}` : "—";

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={styles.mapWrap}>
				<RideMap
					initialLat={mid?.latitude ?? 53.9}
					initialLon={mid?.longitude ?? 27.55}
					locations={ride.trackPoints ?? []}
				/>
			</View>

			<RideDetailHeader
				title={ride.title ?? "Untitled ride"}
				dateLabel={dateLabel}
				onDelete={() => setShowDeleteDialog(true)}
				deleting={deleting}
			/>

			<ScrollView
				style={styles.body}
				contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
				showsVerticalScrollIndicator={false}
			>
				<RideHeroStats
					distanceKm={distanceKm}
					duration={durLabel ?? "—"}
					elevationGain={elevation}
				/>

				<RideDetailGrid items={details} />

				{hasCharts && (
					<RideCharts
						speedData={ride.chart?.speed ?? []}
						elevationData={ride.chart?.elevation ?? []}
						width={chartW}
					/>
				)}

				<RideActions
					exporting={exporting}
					onExport={handleExportGpx}
					onDelete={() => setShowDeleteDialog(true)}
				/>
			</ScrollView>

			<DeleteRideDialog
				visible={showDeleteDialog}
				onDismiss={() => setShowDeleteDialog(false)}
				onConfirm={handleDelete}
				loading={deleting}
			/>

			<Snackbar
				visible={snackVisible}
				onDismiss={() => setSnackVisible(false)}
				duration={3000}
			>
				Could not export GPX. Try again.
			</Snackbar>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },
	mapWrap: { flex: 1 },
	body: { flex: 1, paddingHorizontal: 24, paddingTop: 20 },
});
