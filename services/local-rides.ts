import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Ride } from "../types";

const LOCAL_RIDES_KEY = "@trackhub/local-rides";

export interface LocalRide {
	localId: number;
	title: string;
	startTime: string;
	endTime: string | null;
	distance: number; // km
	avgSpeed: number; // km/h
	maxSpeed: number; // km/h
	elevationGain: number;
	elevationLoss: number;
	completedAt: string;
}

export async function saveLocalRide(ride: LocalRide): Promise<void> {
	const rides = await loadLocalRides();
	rides.unshift(ride);
	await AsyncStorage.setItem(LOCAL_RIDES_KEY, JSON.stringify(rides));
}

export async function loadLocalRides(): Promise<LocalRide[]> {
	const raw = await AsyncStorage.getItem(LOCAL_RIDES_KEY);
	if (!raw) return [];
	try {
		return JSON.parse(raw) as LocalRide[];
	} catch {
		return [];
	}
}

export async function clearLocalRides(): Promise<void> {
	await AsyncStorage.removeItem(LOCAL_RIDES_KEY);
}

/** Map a local ride to the API Ride shape (userId 0 sentinel). */
export function toRide(l: LocalRide): Ride {
	return {
		id: l.localId,
		userId: 0,
		title: l.title,
		startTime: l.startTime,
		endTime: l.endTime,
		distance: l.distance,
		avgSpeed: l.avgSpeed,
		maxSpeed: l.maxSpeed,
		elevationGain: l.elevationGain,
		elevationLoss: l.elevationLoss,
		createdAt: l.completedAt,
		updatedAt: l.completedAt,
	};
}
