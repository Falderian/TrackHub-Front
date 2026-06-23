import * as SecureStore from "expo-secure-store";
import { getApiBase } from "./config";

const ACCESS_TOKEN_KEY = "trackhub_access_token";
const REFRESH_TOKEN_KEY = "trackhub_refresh_token";

let accessToken: string | null = null;
let refreshToken: string | null = null;
let refreshing: Promise<boolean> | null = null;

let resolveReady: () => void;
export const tokensReady = new Promise<void>((resolve) => {
	resolveReady = resolve;
});

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
			resolveReady();
			return true;
		}
		resolveReady();
		return false;
	} catch {
		resolveReady();
		return false;
	}
}

export async function tryRefresh(): Promise<boolean> {
	if (refreshing) return refreshing;

	refreshing = (async () => {
		try {
			if (!refreshToken) return false;
			const res = await fetch(
				`${(await getApiBase()).replace(/\/+$/, "")}/auth/refresh`,
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ refreshToken }),
				},
			);
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
