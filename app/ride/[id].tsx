import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { useCallback, useState } from "react";
import {
	ActivityIndicator,
	ScrollView,
	StyleSheet,
	useWindowDimensions,
	View,
} from "react-native";
import {
	Button,
	Divider,
	Icon,
	Snackbar,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import DeleteRideDialog from "../../components/DeleteRideDialog";
import ElevationProfile from "../../components/ElevationProfile";
import ErrorBanner from "../../components/ErrorBanner";
import RideDetailHeader from "../../components/RideDetailHeader";
import RideMap from "../../components/RideMap";
import SpeedChart from "../../components/SpeedChart";
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
		timeRange,
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

	if (loading || !ride) {
		return (
			<View
				style={[
					styles.container,
					styles.centered,
					{ backgroundColor: colors.background },
				]}
			>
				<ActivityIndicator size="large" color={colors.primary} />
			</View>
		);
	}

	const chartW = screenW - 40 - 32 - 52; // screen - outer pad - card pad - y-axis

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<View style={styles.mapWrap}>
				<RideMap
					initialLat={mid?.latitude ?? 53.9}
					initialLon={mid?.longitude ?? 27.56}
					locations={ride.trackPoints}
				/>
			</View>

			<ScrollView
				style={styles.body}
				contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
				showsVerticalScrollIndicator={false}
			>
				<RideDetailHeader
					onDelete={() => setShowDeleteDialog(true)}
					deleting={deleting}
				/>

				<View style={styles.titleBlock}>
					<Text
						variant="headlineSmall"
						style={{ color: colors.onBackground, fontWeight: "700" }}
						numberOfLines={2}
					>
						{ride.title}
					</Text>
					{dateLabel && (
						<Text
							variant="bodySmall"
							style={{ color: colors.onSurfaceVariant }}
						>
							{dateLabel}
							{timeRange ? ` · ${timeRange}` : ""}
							{durLabel ? ` · ${durLabel}` : ""}
						</Text>
					)}
				</View>

				<View style={styles.heroRow}>
					<Surface
						style={[styles.heroCard, { backgroundColor: colors.surface }]}
						elevation={0}
					>
						<Text
							variant="headlineMedium"
							style={[styles.heroNum, { color: colors.primary }]}
						>
							{(ride.distance ?? 0).toFixed(1)}
						</Text>
						<Text
							variant="labelSmall"
							style={{ color: colors.onSurfaceVariant }}
						>
							kilometres
						</Text>
					</Surface>
					<Surface
						style={[styles.heroCard, { backgroundColor: colors.surface }]}
						elevation={0}
					>
						<Text
							variant="headlineMedium"
							style={[styles.heroNum, { color: colors.onSurface }]}
						>
							{durLabel ?? "—"}
						</Text>
						<Text
							variant="labelSmall"
							style={{ color: colors.onSurfaceVariant }}
						>
							moving time
						</Text>
					</Surface>
					<Surface
						style={[styles.heroCard, { backgroundColor: colors.surface }]}
						elevation={0}
					>
						<Text
							variant="headlineMedium"
							style={[
								styles.heroNum,
								{
									color:
										ride.elevationGain > 0 ? colors.primary : colors.onSurface,
								},
							]}
						>
							{Math.round(ride.elevationGain)}
						</Text>
						<Text
							variant="labelSmall"
							style={{ color: colors.onSurfaceVariant }}
						>
							metres ↑
						</Text>
					</Surface>
				</View>

				<View style={styles.sectionLabel}>
					<Text
						variant="titleSmall"
						style={{ color: colors.onSurface, fontWeight: "700" }}
					>
						Details
					</Text>
				</View>
				<View style={styles.detailGrid}>
					{details.map((d) => (
						<Surface
							key={d.icon + d.label}
							style={[styles.detailCard, { backgroundColor: colors.surface }]}
							elevation={0}
						>
							<Icon source={d.icon} size={16} color={colors.onSurfaceVariant} />
							<Text
								variant="bodyLarge"
								style={[styles.detailVal, { color: colors.onSurface }]}
								numberOfLines={1}
								adjustsFontSizeToFit
							>
								{d.value}
							</Text>
							<Text
								variant="labelSmall"
								style={{ color: colors.onSurfaceVariant }}
							>
								{d.label}
							</Text>
						</Surface>
					))}
				</View>

				{hasCharts && ride.chart ? (
					<View style={styles.chartSection}>
						<Surface
							style={[styles.chartCard, { backgroundColor: colors.surface }]}
							elevation={0}
						>
							<View style={styles.chartHeader}>
								<Icon source="speedometer" size={18} color={colors.primary} />
								<Text
									variant="labelLarge"
									style={{ color: colors.onSurface, fontWeight: "600" }}
								>
									Speed
								</Text>
								<View style={{ flex: 1 }} />
								<Text
									variant="labelMedium"
									style={{ color: colors.primary, fontWeight: "700" }}
								>
									{ride.avgSpeed != null
										? `${ride.avgSpeed.toFixed(1)} km/h`
										: "—"}
								</Text>
							</View>
							<SpeedChart
								data={ride.chart.speed}
								width={chartW + 52}
								height={140}
							/>
						</Surface>

						{ride.chart.elevation.length >= 2 && (
							<Surface
								style={[styles.chartCard, { backgroundColor: colors.surface }]}
								elevation={0}
							>
								<View style={styles.chartHeader}>
									<Icon
										source="image-filter-hdr"
										size={18}
										color={colors.primary}
									/>
									<Text
										variant="labelLarge"
										style={{ color: colors.onSurface, fontWeight: "600" }}
									>
										Elevation
									</Text>
									<View style={{ flex: 1 }} />
									<Text
										variant="labelSmall"
										style={{ color: colors.onSurfaceVariant }}
									>
										+{Math.round(ride.elevationGain)} · −
										{Math.round(ride.elevationLoss)} m
									</Text>
								</View>
								<ElevationProfile
									data={ride.chart.elevation}
									width={chartW + 52}
									height={140}
								/>
							</Surface>
						)}
					</View>
				) : null}

				<Divider
					style={[styles.divider, { backgroundColor: colors.outline }]}
				/>
				<Button
					mode="text"
					icon="export-variant"
					textColor={colors.primary}
					contentStyle={styles.deleteBtn}
					onPress={handleExportGpx}
					loading={exporting}
					disabled={exporting}
				>
					Export GPX
				</Button>
				<Button
					mode="text"
					icon="delete"
					textColor={colors.error}
					contentStyle={styles.deleteBtn}
					onPress={() => setShowDeleteDialog(true)}
					disabled={deleting}
				>
					Delete ride
				</Button>
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
				action={{
					label: "OK",
					onPress: () => setSnackVisible(false),
				}}
			>
				Sharing is not available on this device.
			</Snackbar>
		</View>
	);
}

const CARD_PAD = 16;
const OUTER = 20;

const styles = StyleSheet.create({
	container: { flex: 1 },
	centered: { justifyContent: "center", alignItems: "center" },

	mapWrap: { height: "35%" },
	body: { flex: 1 },

	titleBlock: {
		paddingHorizontal: OUTER + 4,
		marginTop: 14,
		marginBottom: 20,
		gap: 4,
	},

	heroRow: {
		flexDirection: "row",
		gap: 10,
		paddingHorizontal: OUTER,
		marginBottom: 20,
	},
	heroCard: {
		flex: 1,
		borderRadius: 16,
		paddingVertical: 16,
		alignItems: "center",
		gap: 4,
	},
	heroNum: { fontWeight: "800" },

	sectionLabel: { paddingHorizontal: OUTER + 4, marginBottom: 10 },
	detailGrid: {
		flexDirection: "row",
		flexWrap: "wrap",
		gap: 8,
		paddingHorizontal: OUTER,
		marginBottom: 20,
	},
	detailCard: {
		flex: 1,
		minWidth: "30%",
		borderRadius: 14,
		padding: 12,
		alignItems: "center",
		gap: 2,
	},
	detailVal: { fontWeight: "700" },

	chartSection: { paddingHorizontal: OUTER, gap: 12, marginBottom: 8 },
	chartCard: { borderRadius: 16, padding: CARD_PAD, overflow: "hidden" },
	chartHeader: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		marginBottom: 4,
	},

	divider: { marginHorizontal: OUTER, marginTop: 12, marginBottom: 4 },
	deleteBtn: { paddingVertical: 8 },
});
