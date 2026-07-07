import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type {
	MaintenanceAction,
	MaintenanceLog,
	MaintenanceStatus,
	MaintenanceType,
	PaginatedResponse,
	Ride,
	RideStats,
} from "../types";

// ── Query key factories ──────────────────────────────────────────

export const rideKeys = {
	all: ["rides"] as const,
	lists: () => [...rideKeys.all, "list"] as const,
	list: (params?: { page?: number; pageSize?: number }) =>
		[...rideKeys.lists(), params] as const,
	details: () => [...rideKeys.all, "detail"] as const,
	detail: (id: number) => [...rideKeys.details(), id] as const,
	stats: () => [...rideKeys.all, "stats"] as const,
	stat: (from?: string, to?: string) =>
		[...rideKeys.stats(), from, to] as const,
	buckets: (from: string, to: string, granularity: "day" | "week" | "month") =>
		[...rideKeys.stats(), "buckets", from, to, granularity] as const,
};

// ── Queries ──────────────────────────────────────────────────────

export function useRidesQuery(params?: {
	page?: number;
	pageSize?: number;
	search?: string;
}) {
	return useQuery<PaginatedResponse<Ride>>({
		queryKey: rideKeys.list(params),
		queryFn: () => api.getRides(params),
		staleTime: 30_000,
	});
}

export function useRideStatsQuery(from?: string, to?: string) {
	return useQuery<RideStats>({
		queryKey: rideKeys.stat(from, to),
		queryFn: () => api.getRideStats(from, to),
		staleTime: 30_000,
	});
}

export function useStatsBucketsQuery(
	from: string,
	to: string,
	granularity: "day" | "week" | "month",
) {
	return useQuery({
		queryKey: rideKeys.buckets(from, to, granularity),
		queryFn: () => api.getStatsBuckets(from, to, granularity),
		staleTime: 30_000,
	});
}

export function useRideQuery(id: number) {
	return useQuery({
		queryKey: rideKeys.detail(id),
		queryFn: () => api.getRide(id),
		staleTime: 30_000,
		enabled: !Number.isNaN(id),
	});
}

interface QueryLike {
	isError: boolean;
	error: Error | null;
	refetch: () => unknown;
}

function mergeErrors(fallback: string, queries: QueryLike[]) {
	const isError = queries.some((q) => q.isError);
	if (!isError) {
		return { isError: false as const, errorMessage: "", retry: () => {} };
	}
	const firstErr = queries.find((q) => q.isError)?.error ?? null;
	return {
		isError: true as const,
		errorMessage: firstErr instanceof Error ? firstErr.message : fallback,
		retry: () => {
			for (const q of queries) q.refetch();
		},
	};
}

export function useRidesOverview(pageSize = 100, search?: string) {
	const rides = useRidesQuery({ pageSize, search });
	const stats = useRideStatsQuery();
	const { isError, errorMessage, retry } = mergeErrors("Unable to load data", [
		rides,
		stats,
	]);

	return {
		rides: rides.data?.data ?? [],
		totalRides: rides.data?.meta.total ?? 0,
		stats: stats.data ?? null,
		isLoading: rides.isLoading,
		isRefetching: rides.isRefetching,
		isError,
		errorMessage,
		retry,
	};
}

export function useStatsData(
	from: string,
	to: string,
	granularity: "day" | "week" | "month",
) {
	const stats = useRideStatsQuery(from, to);
	const buckets = useStatsBucketsQuery(from, to, granularity);
	const { isError, errorMessage, retry } = mergeErrors("Unable to load stats", [
		stats,
		buckets,
	]);

	return {
		stats: stats.data ?? null,
		buckets: buckets.data ?? [],
		isLoading: stats.isLoading,
		isError,
		errorMessage,
		retry,
	};
}

export function useDeleteRideMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => api.deleteRide(id),
		onSuccess: (_data, id) => {
			// Remove from list caches
			queryClient.setQueriesData<PaginatedResponse<Ride>>(
				{ queryKey: rideKeys.lists() },
				(old) =>
					old
						? {
								...old,
								data: old.data.filter((r) => r.id !== id),
								meta: { ...old.meta, total: old.meta.total - 1 },
							}
						: undefined,
			);
			// Invalidate to refetch fresh data
			queryClient.invalidateQueries({ queryKey: rideKeys.all });
		},
	});
}

// ── Maintenance query keys ────────────────────────────────────

export const maintenanceKeys = {
	all: ["maintenance"] as const,
	summary: () => [...maintenanceKeys.all, "summary"] as const,
	logs: () => [...maintenanceKeys.all, "logs"] as const,
	logsList: (params?: {
		page?: number;
		pageSize?: number;
		type?: MaintenanceType;
	}) => [...maintenanceKeys.logs(), params] as const,
};

// ── Maintenance queries ────────────────────────────────────────

export function useMaintenanceSummaryQuery() {
	return useQuery<MaintenanceStatus[]>({
		queryKey: maintenanceKeys.summary(),
		queryFn: () => api.getMaintenanceSummary(),
		staleTime: 30_000,
	});
}

export function useMaintenanceLogsQuery(params?: {
	page?: number;
	pageSize?: number;
	type?: MaintenanceType;
}) {
	return useQuery<PaginatedResponse<MaintenanceLog>>({
		queryKey: maintenanceKeys.logsList(params),
		queryFn: () => api.getMaintenanceLogs(params),
		staleTime: 30_000,
	});
}

export function useCreateMaintenanceLogMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (data: {
			type: MaintenanceType;
			action: MaintenanceAction;
			odometerKm?: number;
			intervalKm?: number;
			intervalDays?: number;
			cost?: number;
			notes?: string;
			performedAt: string;
		}) => api.createMaintenanceLog(data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
		},
	});
}

export function useQuickServiceMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: ({
			type,
			action = "replace" as MaintenanceAction,
		}: {
			type: MaintenanceType;
			action?: MaintenanceAction;
		}) => api.quickService(type, action),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
		},
	});
}

export function useDeleteMaintenanceLogMutation() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: (id: number) => api.deleteMaintenanceLog(id),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: maintenanceKeys.all });
		},
	});
}
