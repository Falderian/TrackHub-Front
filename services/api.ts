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

async function request(path: string, options: RequestInit = {}) {
	const base = API_BASE.replace(/\/+$/, "");
	const url = `${base}${path}`;
	const method = options.method || "GET";
	const body = options.body ? JSON.parse(options.body as string) : undefined;

	console.log(`[API] ${method} ${url}`, body ? { body } : "");

	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(options.headers as Record<string, string>),
	};

	if (accessToken) {
		headers["Authorization"] = `Bearer ${accessToken}`;
	}

	const res = await fetch(url, {
		...options,
		headers,
	});

	console.log(`[API] ${method} ${url} → ${res.status} ${res.statusText}`);

	const json = await res.json().catch(() => ({}));
	console.log(
		`[API] ${method} ${url} → response:`,
		JSON.stringify(json).slice(0, 300),
	);

	if (!res.ok) {
		throw new Error(
			json.message || json.error || `Request failed: ${res.status}`,
		);
	}

	return json;
}

export const api = {
	register: (data: { email: string; username: string; password: string }) =>
		request("/auth/register", { method: "POST", body: JSON.stringify(data) }),

	login: (data: { email: string; password: string }) =>
		request("/auth/login", { method: "POST", body: JSON.stringify(data) }),

	refresh: () =>
		request("/auth/refresh", {
			method: "POST",
			body: JSON.stringify({ refreshToken }),
		}),

	getMe: () => request("/auth/me"),
	health: () => request("/health"),
};
