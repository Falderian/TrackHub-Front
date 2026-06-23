import AsyncStorage from "@react-native-async-storage/async-storage";
import type { RideState } from "./location";

const ACTIVE_RIDE_KEY = "@trackhub/active-ride";
const SYNC_META_KEY = "@trackhub/sync-meta";

export interface PersistedRide {
	state: RideState;
	savedAt: number;
}

export interface SyncMeta {
	rideId: number | null;
	lastSyncedIndex: number;
	isCompleted: boolean;
	completedAt: string | null;
	finalStats: {
		distance: number;
		avgSpeed: number;
		maxSpeed: number;
		elevationGain: number;
		elevationLoss: number;
	} | null;
}

export async function saveActiveRide(state: RideState): Promise<void> {
	const payload: PersistedRide = { state, savedAt: Date.now() };
	await AsyncStorage.setItem(ACTIVE_RIDE_KEY, JSON.stringify(payload));
}

export async function loadActiveRide(): Promise<PersistedRide | null> {
	const raw = await AsyncStorage.getItem(ACTIVE_RIDE_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as PersistedRide;
	} catch {
		return null;
	}
}

export async function clearActiveRide(): Promise<void> {
	await AsyncStorage.multiRemove([ACTIVE_RIDE_KEY, SYNC_META_KEY]);
}

export async function saveSyncMeta(meta: SyncMeta): Promise<void> {
	await AsyncStorage.setItem(SYNC_META_KEY, JSON.stringify(meta));
}

export async function loadSyncMeta(): Promise<SyncMeta | null> {
	const raw = await AsyncStorage.getItem(SYNC_META_KEY);
	if (!raw) return null;
	try {
		return JSON.parse(raw) as SyncMeta;
	} catch {
		return null;
	}
}

export async function clearSyncMeta(): Promise<void> {
	await AsyncStorage.removeItem(SYNC_META_KEY);
}
