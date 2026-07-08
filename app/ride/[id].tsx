import {
	ScrollView,
	StyleSheet,
	useWindowDimensions,
	View,
} from "react-native";
import { useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DeleteRideDialog from "../../components/DeleteRideDialog";
import ErrorBanner from "../../components/ErrorBanner";
import RideCharts from "../../components/RideCharts";
import RideDetailHeader from "../../components/RideDetailHeader";
import RideMap from "../../components/RideMap";
import RideStatsCard from "../../components/RideStatsCard";
import { SkeletonRideDetail } from "../../components/SkeletonLoader";
import useRideDetail from "../../hooks/useRideDetail";

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

	const distanceKm = ride.distance != null ? ride.distance.toFixed(1) : "—";
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
				<RideStatsCard
					distanceKm={distanceKm}
					duration={durLabel ?? "—"}
					elevationGain={elevation}
					details={details}
				/>

				{hasCharts && (
					<RideCharts
						speedData={ride.chart?.speed ?? []}
						elevationData={ride.chart?.elevation ?? []}
						width={chartW}
					/>
				)}
			</ScrollView>

			<DeleteRideDialog
				visible={showDeleteDialog}
				onDismiss={() => setShowDeleteDialog(false)}
				onConfirm={handleDelete}
				loading={deleting}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },
	mapWrap: { flex: 1 },
	body: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
});
