import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import type { PaginatedResponse, Ride, RideStats } from "../types";

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

export function useRidesQuery(params?: { page?: number; pageSize?: number }) {
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

// ── Mutations ────────────────────────────────────────────────────

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
