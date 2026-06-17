import * as Location from "expo-location";
import * as TaskManager from "expo-task-manager";
import { haversine } from "../helpers/ride";

const TASK_NAME = "TRACKHUB_LOCATION";

type Coords = {
	latitude: number;
	longitude: number;
	altitude?: number;
	speed?: number;
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
		const alt = loc.coords.altitude ?? undefined;
		const spd = loc.coords.speed ?? undefined;
		const coord: Coords = {
			latitude: loc.coords.latitude,
			longitude: loc.coords.longitude,
			altitude: alt,
			speed: spd,
			timestamp: loc.timestamp,
		};
		if (prev) {
			state.distance += haversine(prev, coord);
			if (alt !== undefined && prev.altitude !== undefined) {
				const diff = alt - prev.altitude;
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
	notify();
});

export async function requestPermissions(): Promise<boolean> {
	const fg = await Location.requestForegroundPermissionsAsync();
	if (!fg.granted) return false;

	const bg = await Location.requestBackgroundPermissionsAsync();
	return bg.granted;
}

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

	await Location.startLocationUpdatesAsync(TASK_NAME, {
		accuracy: Location.Accuracy.BestForNavigation,
		distanceInterval: 5,
		foregroundService: {
			notificationTitle: "TrackHub",
			notificationBody: "Tracking your ride…",
			notificationColor: "#bf616a",
		},
		activityType: Location.ActivityType.Fitness,
		showsBackgroundLocationIndicator: true,
	});
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

	await Location.startLocationUpdatesAsync(TASK_NAME, {
		accuracy: Location.Accuracy.BestForNavigation,
		distanceInterval: 5,
		foregroundService: {
			notificationTitle: "TrackHub",
			notificationBody: "Tracking your ride…",
			notificationColor: "#bf616a",
		},
		activityType: Location.ActivityType.Fitness,
		showsBackgroundLocationIndicator: true,
	});
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
			elevation: loc.altitude,
			speed: loc.speed,
			timestamp: new Date(loc.timestamp).toISOString(),
		})),
	};

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
