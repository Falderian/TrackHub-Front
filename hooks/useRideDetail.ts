import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";
import { fmtPace, fmtTime } from "../helpers/ride";
import type { ChartArrays } from "../types";
import { useDeleteRideMutation, useRideQuery } from "./queries";

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
	const numId = Number(id);

	const {
		data: ride,
		isLoading: loading,
		isError,
		error: queryError,
		refetch,
	} = useRideQuery(numId);
	const deleteRide = useDeleteRideMutation();

	const [showDeleteDialog, setShowDeleteDialog] = useState(false);

	const handleDelete = useCallback(async () => {
		try {
			await deleteRide.mutateAsync(numId);
			setShowDeleteDialog(false);
			router.back();
		} catch (e: unknown) {
			setShowDeleteDialog(false);
			Alert.alert(
				"Delete failed",
				e instanceof Error ? e.message : "Something went wrong",
			);
		}
	}, [numId, deleteRide]);

	const rideError = isError
		? queryError instanceof Error
			? queryError.message
			: "Unable to load ride"
		: null;

	const typedRide = ride as RideDetailData | undefined;

	const durSec = useMemo(() => {
		if (!typedRide?.startTime || !typedRide?.endTime) return null;
		return Math.round(
			(new Date(typedRide.endTime).getTime() -
				new Date(typedRide.startTime).getTime()) /
				1000,
		);
	}, [typedRide?.startTime, typedRide?.endTime]);

	const dateLabel = useMemo(() => {
		if (!typedRide?.startTime) return null;
		return new Date(typedRide.startTime).toLocaleDateString(undefined, {
			weekday: "long",
			month: "long",
			day: "numeric",
			year: "numeric",
		});
	}, [typedRide?.startTime]);

	const timeRange = useMemo(() => {
		if (!typedRide?.startTime) return null;
		const opts: Intl.DateTimeFormatOptions = {
			hour: "2-digit",
			minute: "2-digit",
		};
		const start = new Date(typedRide.startTime).toLocaleTimeString(
			undefined,
			opts,
		);
		if (!typedRide.endTime) return start;
		const end = new Date(typedRide.endTime).toLocaleTimeString(undefined, opts);
		return `${start} – ${end}`;
	}, [typedRide?.startTime, typedRide?.endTime]);

	const durLabel = useMemo(
		() => (durSec != null ? fmtTime(durSec) : null),
		[durSec],
	);

	const mid =
		typedRide?.trackPoints && typedRide.trackPoints.length > 0
			? typedRide.trackPoints[Math.floor(typedRide.trackPoints.length / 2)]
			: null;

	const pointCount = typedRide?.trackPoints?.length ?? 0;

	const details: DetailStat[] = useMemo(() => {
		const items: DetailStat[] = [
			{
				icon: "speedometer",
				label: "Avg speed",
				value:
					typedRide?.avgSpeed != null
						? `${typedRide.avgSpeed.toFixed(1)} km/h`
						: "—",
			},
			{
				icon: "speedometer",
				label: "Max speed",
				value:
					typedRide?.maxSpeed != null
						? `${typedRide.maxSpeed.toFixed(1)} km/h`
						: "—",
			},
			{
				icon: "timer-outline",
				label: "Pace",
				value:
					typedRide?.avgSpeed != null
						? `${fmtPace(typedRide.avgSpeed)} /km`
						: "—",
			},
		];
		if ((typedRide?.elevationLoss ?? 0) > 0) {
			items.push({
				icon: "arrow-down-bold",
				label: "Descent",
				value: `−${Math.round(typedRide?.elevationLoss ?? 0)} m`,
			});
		}
		items.push({
			icon: "map-marker-path",
			label: "Track points",
			value: String(pointCount),
		});
		return items;
	}, [typedRide, pointCount]);

	const hasCharts = typedRide?.chart !== null;

	return {
		ride: typedRide ?? null,
		loading,
		rideError,
		refetch,
		deleting: deleteRide.isPending,
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
