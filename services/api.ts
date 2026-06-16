import Constants from "expo-constants";
import * as SecureStore from "expo-secure-store";
import type { PaginatedResponse, Ride, RideStats } from "../types";

const API_BASE = __DEV__
	? `http://${Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost"}:8000`
	: "https://trackhub.falderian.deno.net/";

const ACCESS_TOKEN_KEY = "trackhub_access_token";
const REFRESH_TOKEN_KEY = "trackhub_refresh_token";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshing: Promise<boolean> | null = null;

export async function setTokens(access: string, refresh: string) {
	accessToken = access;
	refreshToken = refresh;
	try {
		await Promise.all([
			SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access),
			SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh),
		]);
	} catch (err) {
		console.error("[api] Failed to persist tokens:", err);
	}
}

export async function clearTokens() {
	accessToken = null;
	refreshToken = null;
	try {
		await Promise.all([
			SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
			SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
		]);
	} catch (err) {
		console.error("[api] Failed to clear tokens from secure storage:", err);
	}
}

export function getAccessToken() {
	return accessToken;
}

export async function restoreTokens(): Promise<boolean> {
	try {
		const [access, refresh] = await Promise.all([
			SecureStore.getItemAsync(ACCESS_TOKEN_KEY),
			SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
		]);
		if (access && refresh) {
			accessToken = access;
			refreshToken = refresh;
			return true;
		}
		return false;
	} catch {
		return false;
	}
}

async function tryRefresh(): Promise<boolean> {
	if (refreshing) return refreshing;

	refreshing = (async () => {
		try {
			if (!refreshToken) return false;
			const res = await fetch(`${API_BASE.replace(/\/+$/, "")}/auth/refresh`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ refreshToken }),
			});
			if (!res.ok) {
				clearTokens();
				return false;
			}
			const json = await res.json();
			await setTokens(json.accessToken, json.refreshToken);
			return true;
		} catch {
			clearTokens();
			return false;
		} finally {
			refreshing = null;
		}
	})();

	return refreshing;
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

	let res = await fetch(url, { ...options, headers });

	if (res.status === 401 && refreshToken) {
		const ok = await tryRefresh();
		if (ok) {
			headers.Authorization = `Bearer ${accessToken}`;
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
};
