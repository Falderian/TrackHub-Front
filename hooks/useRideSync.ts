import { useCallback, useEffect, useRef } from "react";
import { roundTo } from "../helpers/ride";
import { api } from "../services/api";
import { saveLocalRide } from "../services/local-rides";
import {
	clearPersistedRide,
	clearSyncRide,
	flushAllPending,
	getRideState,
	initSyncRide,
	type RideSummary,
	restoreSyncState,
} from "../services/location";
import * as storage from "../services/storage";

async function tryCreateRide(
	startTime: string,
	trackPoints?: RideSummary["trackPoints"],
) {
	try {
		const ride = await api.createRide({ startTime, trackPoints });
		return (ride as { id: number }).id;
	} catch (err) {
		console.warn("[TrackHub] createRide failed:", err);
		return null;
	}
}

export function useRideSync(isActive: boolean) {
	const rideIdRef = useRef<number | null>(null);
	const ridingRef = useRef(false);

	// Restore sync state from previous crash/unfinished ride
	useEffect(() => {
		storage.loadSyncMeta().then((meta) => {
			if (meta) {
				rideIdRef.current = meta.rideId;
				restoreSyncState(meta.rideId, meta.lastSyncedIndex);
			}
		});
	}, []);

	// Track isActive → false transition to flush on pause
	useEffect(() => {
		if (!isActive && ridingRef.current) {
			// Just paused — auto-flush will catch up on resume
			// because lastSyncedIndex is preserved in the GPS task state
		}
		ridingRef.current = isActive;
	}, [isActive]);

	const beginRide = useCallback(async () => {
		const state = getRideState();
		if (!state.rideStartTime) return;

		const id = await tryCreateRide(new Date(state.rideStartTime).toISOString());
		rideIdRef.current = id;

		if (id) {
			initSyncRide(id);
		} else {
			console.warn(
				"[TrackHub] beginRide: backend unreachable — ride will sync when connection restores.",
			);
		}
	}, []);

	const completeRide = useCallback(
		async (summary: RideSummary): Promise<number | null> => {
			try {
				await flushAllPending();
			} catch {}

			let id = rideIdRef.current;

			if (!summary.trackPoints.length) {
				clearSyncRide();
				rideIdRef.current = null;
				await clearPersistedRide().catch(() => {});
				await storage.clearSyncMeta().catch(() => {});
				return null;
			}

			const lastPoint = summary.trackPoints[summary.trackPoints.length - 1];
			const distanceKm = summary.distance / 1000;
			const durationHours = summary.totalElapsed / 3600;
			const avgSpeed = durationHours > 0 ? distanceKm / durationHours : 0;

			let maxSpeed = 0;
			for (const p of summary.trackPoints) {
				if (p.speed != null && p.speed > 0) {
					const kmh = p.speed * 3.6;
					if (kmh > maxSpeed) maxSpeed = kmh;
				}
			}

			const finalStats = {
				distance: roundTo(distanceKm, 2),
				avgSpeed: roundTo(avgSpeed, 2),
				maxSpeed: roundTo(maxSpeed, 2),
				elevationGain: roundTo(summary.elevationGain, 2),
				elevationLoss: roundTo(summary.elevationLoss, 2),
			};

			const didSync = Boolean(id);

			if (!id) {
				try {
					const ride = await api.createRide({
						startTime: summary.startTime,
						trackPoints: summary.trackPoints,
					});
					id = (ride as { id: number }).id;
				} catch (err) {
					console.warn("[TrackHub] completeRide create failed:", err);
				}
			}

			if (id) {
				try {
					await api.updateRide(id, {
						endTime: lastPoint.timestamp,
						distance: finalStats.distance,
						avgSpeed: finalStats.avgSpeed,
						maxSpeed: finalStats.maxSpeed,
						elevationGain: finalStats.elevationGain,
						elevationLoss: finalStats.elevationLoss,
					});
					await clearPersistedRide().catch(() => {});
					await storage.clearSyncMeta().catch(() => {});
				} catch (err) {
					console.warn("[TrackHub] completeRide finalize failed:", err);
				}
			}

			if (!didSync && !id) {
				saveLocalRide({
					localId: -Date.now(),
					title: new Date(summary.startTime).toLocaleDateString(),
					startTime: summary.startTime,
					endTime: lastPoint.timestamp,
					distance: finalStats.distance,
					avgSpeed: finalStats.avgSpeed,
					maxSpeed: finalStats.maxSpeed,
					elevationGain: finalStats.elevationGain,
					elevationLoss: finalStats.elevationLoss,
					completedAt: new Date().toISOString(),
				}).catch((saveErr) =>
					console.warn("[TrackHub] saveLocalRide failed:", saveErr),
				);
			}

			clearSyncRide();
			rideIdRef.current = null;
			return id;
		},
		[],
	);

	return {
		flush: flushAllPending,
		beginRide,
		completeRide,
	};
}
