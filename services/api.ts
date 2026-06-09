import type { PaginatedResponse, Ride, RideStats } from "../types";

const API_BASE = "https://trackhub.falderian.deno.net/";

let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(access: string, refresh: string) {
	accessToken = access;
	refreshToken = refresh;
}

export function clearTokens() {
	accessToken = null;
	refreshToken = null;
}

export function getAccessToken() {
	return accessToken;
}

async function request<T = unknown>(
	path: string,
	options: RequestInit = {},
): Promise<T> {
	const base = API_BASE.replace(/\/+$/, "");
	const url = `${base}${path}`;

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	if (accessToken) {
		headers.Authorization = `Bearer ${accessToken}`;
	}

	const res = await fetch(url, { ...options, headers });

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

	refresh: () =>
		request<{ accessToken: string; refreshToken: string }>("/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		}),

	getMe: () =>
		request<{ id: number; email: string; username: string }>("/auth/me"),
	health: () => request("/health"),

	getRideStats: () => request<RideStats>("/rides/stats"),

	getRides: (params?: { page?: number; pageSize?: number }) => {
		const qs = new URLSearchParams();
		if (params?.page) qs.set("page", String(params.page));
		if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
		const suffix = qs.toString() ? `?${qs}` : "";
		return request<PaginatedResponse<Ride>>(`/rides${suffix}`);
	},

	getRide: (id: number) =>
		request<Ride & { trackPoints: unknown[] }>(`/rides/${id}`),

	createRide: (data: {
		title?: string;
		startTime: string;
		trackPoints?: {
			latitude: number;
			longitude: number;
			elevation?: number;
			timestamp: string;
			speed?: number;
		}[];
	}) => request("/rides", { method: "POST", body: JSON.stringify(data) }),

	deleteRide: (id: number) =>
		request<void>(`/rides/${id}`, { method: "DELETE" }),
};
