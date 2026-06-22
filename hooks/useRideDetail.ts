import { router, useFocusEffect, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { fmtPace, fmtTime } from "../helpers/ride";
import { api } from "../services/api";
import type { ChartArrays } from "../types";

export interface RideDetailData {
	id: number;
	title: string | null;
	distance: number | null;
	avgSpeed: number | null;
	maxSpeed: number | null;
	elevationGain: number;
	elevationLoss: number;
	startTime: string;
	endTime: string | null;
	trackPoints: {
		latitude: number;
		longitude: number;
		elevation?: number;
		speed?: number;
		timestamp?: string;
	}[];
	chart: ChartArrays | null;
}

export interface DetailStat {
	icon: string;
	label: string;
	value: string;
}

export default function useRideDetail() {
	const { id } = useLocalSearchParams<{ id: string }>();
	const [ride, setRide] = useState<RideDetailData | null>(null);
	const [loading, setLoading] = useState(true);
	const [deleting, setDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	useFocusEffect(
		useCallback(() => {
			(async () => {
				try {
					const data = await api.getRide(Number(id));
					setRide(data as unknown as RideDetailData);
				} catch {}
				setLoading(false);
			})();
		}, [id]),
	);

	const handleDelete = useCallback(async () => {
		setDeleting(true);
		try {
			await api.deleteRide(Number(id));
		} catch {
		} finally {
			setShowDeleteDialog(false);
			setDeleting(false);
			router.back();
		}
	}, [id]);

	const durSec = useMemo(() => {
		if (!ride?.startTime || !ride?.endTime) return null;
		return Math.round(
			(new Date(ride.endTime).getTime() - new Date(ride.startTime).getTime()) /
				1000,
		);
	}, [ride?.startTime, ride?.endTime]);

	const dateLabel = useMemo(() => {
		if (!ride?.startTime) return null;
		return new Date(ride.startTime).toLocaleDateString(undefined, {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	}, [ride?.startTime]);

	const timeRange = useMemo(() => {
		if (!ride?.startTime) return null;
		const opts: Intl.DateTimeFormatOptions = {
			hour: "2-digit",
			minute: "2-digit",
		};
		const start = new Date(ride.startTime).toLocaleTimeString(undefined, opts);
		if (!ride.endTime) return start;
		const end = new Date(ride.endTime).toLocaleTimeString(undefined, opts);
		return `${start} – ${end}`;
	}, [ride?.startTime, ride?.endTime]);

	const durLabel = useMemo(
		() => (durSec != null ? fmtTime(durSec) : null),
		[durSec],
	);

	const mid =
		ride?.trackPoints && ride.trackPoints.length > 0
			? ride.trackPoints[Math.floor(ride.trackPoints.length / 2)]
			: null;

	const pointCount = ride?.trackPoints?.length ?? 0;

	const details: DetailStat[] = useMemo(() => {
		const items: DetailStat[] = [
			{
				icon: "speedometer",
				label: "Avg speed",
				value:
					ride?.avgSpeed != null ? `${ride.avgSpeed.toFixed(1)} km/h` : "—",
			},
			{
				icon: "speedometer",
				label: "Max speed",
				value:
					ride?.maxSpeed != null ? `${ride.maxSpeed.toFixed(1)} km/h` : "—",
			},
			{
				icon: "timer-outline",
				label: "Pace",
				value: ride?.avgSpeed != null ? `${fmtPace(ride.avgSpeed)} /km` : "—",
			},
		];
		if ((ride?.elevationLoss ?? 0) > 0) {
			items.push({
				icon: "arrow-down-bold",
				label: "Descent",
				value: `−${Math.round(ride!.elevationLoss)} m`,
			});
		}
		items.push({
			icon: "map-marker-path",
			label: "Track points",
			value: String(pointCount),
		});
		return items;
	}, [ride, pointCount]);

	const hasCharts = ride?.chart !== null;

	return {
		ride,
		loading,
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
	};
}
