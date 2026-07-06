import type {
	MaintenanceAction,
	MaintenanceLog,
	MaintenanceStatus,
	MaintenanceType,
	PaginatedResponse,
	Ride,
	RideStats,
} from "../types";
import { getApiBase } from "./config";
import { getAccessToken, tokensReady, tryRefresh } from "./tokens";

async function request<T = unknown>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	await tokensReady;

	const base = (await getApiBase()).replace(/\/+$/, "");
	const url = `${base}${path}`;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	const accessToken = getAccessToken();
	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	let res = await fetch(url, { ...options, headers });

	if (res.status === 401) {
		const ok = await tryRefresh();
		if (ok) {
			const newToken = getAccessToken();
			if (newToken) {
				headers.Authorization = `Bearer ${newToken}`;
			}
			res = await fetch(url, { ...options, headers });
		}
	}

	const json = await res.json().catch(() => ({}));

	if (!res.ok) {
		const msg =
			typeof json.error === "string"
				? json.error
				: json.error?.fieldErrors
					? Object.values(json.error.fieldErrors).flat().join(", ")
					: JSON.stringify(json.error || json.message);
		throw new Error(msg || `Request failed: ${res.status}`);
	}

	return json as T;
}

export const api = {
	register: (data: { email: string; username: string; password: string }) =>
		request<{ accessToken: string; refreshToken: string }>("/auth/register", {
			method: "POST",
			body: JSON.stringify(data),
		}),

	login: (data: { email: string; password: string }) =>
		request<{ accessToken: string; refreshToken: string }>("/auth/login", {
			method: "POST",
			body: JSON.stringify(data),
		}),

	getMe: () =>
		request<{ id: number; email: string; username: string }>("/auth/me"),
	health: () => request("/health"),

	getRideStats: (from?: string, to?: string) => {
		const qs = new URLSearchParams();
		if (from) qs.set("from", from);
		if (to) qs.set("to", to);
		const suffix = qs.toString() ? `?${qs}` : "";
		return request<RideStats>(`/rides/stats${suffix}`);
	},

	getStatsBuckets: (
		from: string,
		to: string,
		granularity: "day" | "week" | "month",
	) => {
		const qs = new URLSearchParams({ from, to, granularity });
		return request<
			{ label: string; distance: number; rides: number; minutes: number }[]
		>(`/rides/stats/buckets?${qs}`);
	},

	getRides: (params?: {
		page?: number;
		pageSize?: number;
		search?: string;
	}) => {
		const qs = new URLSearchParams();
		if (params?.page) qs.set("page", String(params.page));
		if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
		if (params?.search) qs.set("search", params.search);
		const suffix = qs.toString() ? `?${qs}` : "";
		return request<PaginatedResponse<Ride>>(`/rides${suffix}`);
	},

	getRide: (id: number) =>
		request<Ride & { trackPoints: unknown[] }>(`/rides/${id}`),

	createRide: (data: {
		startTime: string;
		trackPoints?: {
			latitude: number;
			longitude: number;
			elevation?: number;
			timestamp: string;
			speed?: number;
		}[];
	}) => request("/rides", { method: "POST", body: JSON.stringify(data) }),

	addTrackPoints: (
		rideId: number,
		points: {
			latitude: number;
			longitude: number;
			elevation?: number;
			timestamp: string;
			speed?: number;
		}[],
	) =>
		request(`/rides/${rideId}/track-points`, {
			method: "POST",
			body: JSON.stringify({ trackPoints: points }),
		}),

	updateRide: (
		id: number,
		data: {
			endTime?: string;
			distance?: number;
			avgSpeed?: number;
			maxSpeed?: number;
			elevationGain?: number;
			elevationLoss?: number;
		},
	) =>
		request(`/rides/${id}`, {
			method: "PATCH",
			body: JSON.stringify(data),
		}),

	deleteRide: (id: number) =>
		request<void>(`/rides/${id}`, { method: "DELETE" }),

	exportData: () =>
		request<{
			exportedAt: string;
			rides: (Ride & { trackPoints: unknown[] })[];
		}>("/rides/export"),

	getRideGpx: async (id: number): Promise<string> => {
		await tokensReady;
		const base = (await getApiBase()).replace(/\/+$/, "");
		const url = `${base}/rides/${id}/gpx`;
		const accessToken = getAccessToken();
		const headers: Record<string, string> = {};
		if (accessToken) {
			headers.Authorization = `Bearer ${accessToken}`;
		}
		let res = await fetch(url, { headers });
		if (res.status === 401) {
			const ok = await tryRefresh();
			if (ok) {
				const newToken = getAccessToken();
				if (newToken) headers.Authorization = `Bearer ${newToken}`;
				res = await fetch(url, { headers });
			}
		}
		if (!res.ok) throw new Error("Failed to download GPX");
		return res.text();
	},

	// ── Maintenance ──────────────────────────────────────────

	getMaintenanceSettings: () =>
		request<{ type: string; action: string }[]>("/maintenance/settings"),

	toggleMaintenanceSetting: (type: string, disabled: boolean) =>
		request<void>(`/maintenance/settings/${type}`, {
			method: "PUT",
			body: JSON.stringify({ disabled }),
		}),

	getMaintenanceSummary: () =>
		request<MaintenanceStatus[]>("/maintenance/summary"),

	getMaintenanceLogs: (params?: {
		page?: number;
		pageSize?: number;
		type?: MaintenanceType;
	}) => {
		const qs = new URLSearchParams();
		if (params?.page) qs.set("page", String(params.page));
		if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
		if (params?.type) qs.set("type", params.type);
		const suffix = qs.toString() ? `?${qs}` : "";
		return request<PaginatedResponse<MaintenanceLog>>(`/maintenance${suffix}`);
	},

	createMaintenanceLog: (data: {
		type: MaintenanceType;
		action: MaintenanceAction;
		odometerKm: number;
		intervalKm?: number;
		intervalDays?: number;
		cost?: number;
		notes?: string;
		performedAt: string;
	}) =>
		request<MaintenanceLog>("/maintenance", {
			method: "POST",
			body: JSON.stringify(data),
		}),

	deleteMaintenanceLog: (id: number) =>
		request<void>(`/maintenance/${id}`, { method: "DELETE" }),
};
