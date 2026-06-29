import AsyncStorage from "@react-native-async-storage/async-storage";

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
