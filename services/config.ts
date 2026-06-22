import Constants from "expo-constants";

let apiBase: string | null = null;

export async function getApiBase(): Promise<string> {
	if (apiBase) return apiBase;

	if (__DEV__) {
		apiBase = `http://${Constants.expoConfig?.hostUri?.split(":")[0] ?? "localhost"}:8000`;
		return apiBase;
	}

	apiBase = "https://trackhub--local.sneograt.deno.net/";
	return apiBase;
}
