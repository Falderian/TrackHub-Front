import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { haversine } from "../helpers/ride";
import { clearActiveRide, loadActiveRide, saveActiveRide } from "./storage";

const TASK_NAME = "TRACKHUB_LOCATION";

let lastPersist = 0;
const PERSIST_INTERVAL_MS = 5_000;

function persistIfNeeded() {
	const now = Date.now();
	if (now - lastPersist >= PERSIST_INTERVAL_MS) {
		lastPersist = now;
		saveActiveRide(state).catch((err) =>
			console.warn("[TrackHub] persist failed:", err),
		);
	}
}

type Coords = {
	latitude: number;
	longitude: number;
	speed?: number;
	elevation?: number;
	timestamp: number;
};

export type RideState = {
	running: boolean;
	paused: boolean;
	startedAt: number | null;
	rideStartTime: number | null;
	totalElapsed: number;
	distance: number;
	elevationGain: number;
	elevationLoss: number;
	maxElevation: number;
	minElevation: number;
	locations: Coords[];
};

export interface RideSummary {
	startTime: string;
	totalElapsed: number;
	distance: number;
	elevationGain: number;
	elevationLoss: number;
	trackPoints: {
		latitude: number;
		longitude: number;
		elevation?: number;
		speed?: number;
		timestamp: string;
	}[];
}

let state: RideState = {
	running: false,
	paused: false,
	startedAt: null,
	rideStartTime: null,
	totalElapsed: 0,
	distance: 0,
	elevationGain: 0,
	elevationLoss: 0,
	maxElevation: -Infinity,
	minElevation: Infinity,
	locations: [],
};

const listeners = new Set<() => void>();

function notify() {
	for (const fn of listeners) fn();
}

export function getRideState(): Readonly<RideState> {
	return state;
}

export function subscribe(fn: () => void): () => void {
	listeners.add(fn);
	return () => {
		listeners.delete(fn);
	};
}

const MAX_ACCURACY_M = 65;
const MAX_SPEED_MS = 22;

function passFilter(
	loc: Location.LocationObject,
	prev: Coords | undefined,
): boolean {
	const acc = loc.coords.accuracy;
	if (acc != null && acc > MAX_ACCURACY_M) return false;

	const chipSpeed = loc.coords.speed;
	if (chipSpeed != null && chipSpeed > MAX_SPEED_MS) return false;

	if (prev) {
		const ts = loc.timestamp < 1e12 ? loc.timestamp * 1000 : loc.timestamp;
		const dt = (ts - prev.timestamp) / 1000;
		if (dt > 0.5) {
			const dist = haversine(prev, {
				latitude: loc.coords.latitude,
				longitude: loc.coords.longitude,
			});
			if (dist / dt > MAX_SPEED_MS) return false;
		}
	}

	return true;
}

let droppedCount = 0;

TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
	if (error) {
		console.warn("[TrackHub] location task error:", error.message);
		return;
	}
	const locations = (data as { locations: Location.LocationObject[] })
		.locations;
	if (!locations?.length) return;

	for (const loc of locations) {
		const prev = state.locations[state.locations.length - 1];
		if (!passFilter(loc, prev)) {
			droppedCount++;
			continue;
		}
		const ts = loc.timestamp < 1e12 ? loc.timestamp * 1000 : loc.timestamp;
		const alt = loc.coords.altitude ?? undefined;
		const spd = loc.coords.speed ?? undefined;
		const coord: Coords = {
			latitude: loc.coords.latitude,
			longitude: loc.coords.longitude,
			elevation: alt,
			speed: spd,
			timestamp: ts,
		};
		if (prev) {
			state.distance += haversine(prev, coord);
			if (alt !== undefined && prev.elevation !== undefined) {
				const diff = alt - prev.elevation;
				if (diff > 0) state.elevationGain += diff;
				else state.elevationLoss += Math.abs(diff);
			}
		}
		if (alt !== undefined) {
			if (alt > state.maxElevation) state.maxElevation = alt;
			if (alt < state.minElevation) state.minElevation = alt;
		}
		state.locations.push(coord);
	}

	if (droppedCount > 0) {
		console.warn(`[TrackHub] dropped ${droppedCount} outlier(s) this batch`);
		droppedCount = 0;
	}

	persistIfNeeded();
	notify();
});

export async function requestPermissions(): Promise<boolean> {
	const fg = await Location.requestForegroundPermissionsAsync();
	if (!fg.granted) return false;

	const bg = await Location.requestBackgroundPermissionsAsync();
	return bg.granted;
}

const TRACKING_OPTIONS = {
	accuracy: Location.Accuracy.BestForNavigation,
	distanceInterval: 5,
	timeInterval: 3000,
	pausesLocationUpdatesAutomatically: false,
	foregroundService: {
		notificationTitle: "TrackHub",
		notificationBody: "Tracking your ride…",
		notificationColor: "#bf616a",
	},
	activityType: Location.ActivityType.Fitness,
	showsBackgroundLocationIndicator: true,
} satisfies Location.LocationOptions;

export async function startTracking(): Promise<void> {
	const ok = await requestPermissions();
	if (!ok) throw new Error("Location permission denied");

	const now = Date.now();
	state = {
		running: true,
		paused: false,
		startedAt: now,
		rideStartTime: now,
		totalElapsed: 0,
		distance: 0,
		elevationGain: 0,
		elevationLoss: 0,
		maxElevation: -Infinity,
		minElevation: Infinity,
		locations: [],
	};

	saveActiveRide(state).catch((err) =>
		console.warn("[TrackHub] persist failed:", err),
	);

	await Location.startLocationUpdatesAsync(TASK_NAME, TRACKING_OPTIONS);
}

export async function pauseTracking(): Promise<void> {
	if (!state.running || state.paused) return;

	if (state.startedAt) {
		state.totalElapsed += Math.floor((Date.now() - state.startedAt) / 1000);
	}
	state.paused = true;
	state.startedAt = null;

	await Location.stopLocationUpdatesAsync(TASK_NAME);
	notify();
}

export async function resumeTracking(): Promise<void> {
	if (!state.running || !state.paused) return;

	state.paused = false;
	state.startedAt = Date.now();

	await Location.startLocationUpdatesAsync(TASK_NAME, TRACKING_OPTIONS);
	notify();
}

export async function stopTracking(): Promise<RideSummary | null> {
	if (!state.running) return null;

	if (state.startedAt) {
		state.totalElapsed += Math.floor((Date.now() - state.startedAt) / 1000);
	}

	if (!state.paused) {
		await Location.stopLocationUpdatesAsync(TASK_NAME);
	}

	const summary: RideSummary = {
		startTime: new Date(state.rideStartTime ?? Date.now()).toISOString(),
		totalElapsed: state.totalElapsed,
		distance: state.distance,
		elevationGain: state.elevationGain,
		elevationLoss: state.elevationLoss,
		trackPoints: state.locations.map((loc) => ({
			latitude: loc.latitude,
			longitude: loc.longitude,
			speed: loc.speed ?? undefined,
			elevation: loc.elevation ?? undefined,
			timestamp: new Date(loc.timestamp).toISOString(),
		})),
	};

	saveActiveRide(state).catch((err) =>
		console.warn("[TrackHub] persist failed:", err),
	);

	state.running = false;
	state.paused = false;
	state.startedAt = null;
	state.rideStartTime = null;
	state.totalElapsed = 0;
	state.distance = 0;
	state.elevationGain = 0;
	state.elevationLoss = 0;
	state.maxElevation = -Infinity;
	state.minElevation = Infinity;
	state.locations = [];
	notify();

	return summary;
}

export function getElapsed(): number {
	let current = state.totalElapsed;
	if (state.startedAt && !state.paused) {
		current += Math.floor((Date.now() - state.startedAt) / 1000);
	}
	return current;
}

export async function restoreActiveRide(): Promise<RideState | null> {
	const persisted = await loadActiveRide();
	if (!persisted) return null;

	const age = Date.now() - persisted.savedAt;
	if (age > 86_400_000) {
		await clearActiveRide();
		return null;
	}

	state = { ...persisted.state };
	notify();

	if (state.running && !state.paused) {
		try {
			await Location.startLocationUpdatesAsync(TASK_NAME, TRACKING_OPTIONS);
		} catch (err) {
			console.warn("[TrackHub] failed to restart location updates:", err);
		}
	}

	return state;
}

export { clearActiveRide as clearPersistedRide, loadActiveRide };
