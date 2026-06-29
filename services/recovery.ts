import { api } from "./api";
import { clearLocalRides } from "./local-rides";
import { clearPersistedRide, loadActiveRide } from "./location";
import { clearSyncMeta, loadSyncMeta } from "./storage";

export async function drainPendingSync(): Promise<boolean> {
	const meta = await loadSyncMeta();
	if (!meta) return false;

	if (!meta.isCompleted) return false;

	const persisted = await loadActiveRide();
	if (!persisted) {
		await clearSyncMeta().catch(() => {});
		return false;
	}

	const locations = persisted.state.locations;
	const trackPoints = locations.map((loc) => ({
		latitude: loc.latitude,
		longitude: loc.longitude,
		speed: loc.speed ?? undefined,
		elevation: loc.elevation ?? undefined,
		timestamp: new Date(loc.timestamp).toISOString(),
	}));

	let rideId = meta.rideId;
	let ok = true;

	try {
		if (!rideId) {
			const startTime = new Date(
				persisted.state.rideStartTime ?? Date.now(),
			).toISOString();
			const ride = await api.createRide({ startTime });
			rideId = (ride as { id: number }).id;
		}

		const unsent = trackPoints.slice(meta.lastSyncedIndex);
		if (unsent.length > 0) {
			await api.addTrackPoints(rideId, unsent);
		}

		if (meta.finalStats && meta.completedAt) {
			await api.updateRide(rideId, {
				endTime: meta.completedAt,
				distance: meta.finalStats.distance,
				avgSpeed: meta.finalStats.avgSpeed,
				maxSpeed: meta.finalStats.maxSpeed,
				elevationGain: meta.finalStats.elevationGain,
				elevationLoss: meta.finalStats.elevationLoss,
			});
		}
	} catch (err) {
		console.warn("[TrackHub] drainPendingSync failed:", err);
		ok = false;
	}

	if (ok) {
		await clearPersistedRide().catch(() => {});
		await clearSyncMeta().catch(() => {});
		await clearLocalRides().catch(() => {});
	}

	return ok;
}

export async function hasOrphanedActiveRide(): Promise<boolean> {
	const meta = await loadSyncMeta();
	if (!meta) return false;

	if (!meta.isCompleted) {
		const persisted = await loadActiveRide();
		if (!persisted) {
			await clearSyncMeta().catch(() => {});
			return false;
		}
		if (Date.now() - persisted.savedAt > 86_400_000) {
			await clearPersistedRide().catch(() => {});
			await clearSyncMeta().catch(() => {});
			return false;
		}
		return true;
	}
	return false;
}
