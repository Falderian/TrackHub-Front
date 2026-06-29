import { useCallback, useEffect, useRef } from "react";
import { roundTo } from "../helpers/ride";
import { api } from "../services/api";
import { saveLocalRide } from "../services/local-rides";
import {
	clearPersistedRide,
	getRideState,
	type RideSummary,
} from "../services/location";
import * as storage from "../services/storage";

async function persistMeta(
	rideId: number | null,
	lastSyncedIndex: number,
	overrides?: Partial<
		Pick<storage.SyncMeta, "isCompleted" | "completedAt" | "finalStats">
	>,
) {
	const meta: storage.SyncMeta = {
		rideId,
		lastSyncedIndex,
		isCompleted: false,
		completedAt: null,
		finalStats: null,
		...overrides,
	};
	await storage
		.saveSyncMeta(meta)
		.catch((err) => console.warn("[TrackHub] persistMeta failed:", err));
}

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
	const lastFlushedRef = useRef(0);
	const flushingRef = useRef(false);

	useEffect(() => {
		storage.loadSyncMeta().then((meta) => {
			if (meta) {
				rideIdRef.current = meta.rideId;
				lastFlushedRef.current = meta.lastSyncedIndex;
			}
		});
	}, []);

	const flush = useCallback(async () => {
		const id = rideIdRef.current;
		if (flushingRef.current) return;

		const state = getRideState();
		const points = state.locations.slice(lastFlushedRef.current);
		if (points.length === 0) return;

		if (!id) {
			const newId = await tryCreateRide(
				new Date(state.rideStartTime ?? Date.now()).toISOString(),
			);
			if (newId) {
				rideIdRef.current = newId;
			} else {
				await persistMeta(null, lastFlushedRef.current);
				return;
			}
		}

		flushingRef.current = true;
		try {
			if (!rideIdRef.current) return;
			await api.addTrackPoints(
				rideIdRef.current,
				points.map((p) => ({
					latitude: p.latitude,
					longitude: p.longitude,
					timestamp: new Date(p.timestamp).toISOString(),
					speed: p.speed ?? undefined,
					elevation: p.elevation ?? undefined,
				})),
			);
			lastFlushedRef.current += points.length;
			await persistMeta(rideIdRef.current, lastFlushedRef.current);
		} catch (err) {
			console.warn("[TrackHub] flush failed:", err);
			await persistMeta(rideIdRef.current, lastFlushedRef.current);
		} finally {
			flushingRef.current = false;
		}
	}, []);

	useEffect(() => {
		if (!isActive) return;
		const interval = setInterval(() => {
			flush();
		}, 15_000);
		return () => clearInterval(interval);
	}, [isActive, flush]);

	const beginRide = useCallback(async () => {
		lastFlushedRef.current = 0;

		const state = getRideState();
		if (!state.rideStartTime) return;

		const id = await tryCreateRide(new Date(state.rideStartTime).toISOString());
		rideIdRef.current = id;
		await persistMeta(id, 0);

		if (!id) {
			console.warn(
				"[TrackHub] beginRide: backend unreachable — ride will sync when connection restores.",
			);
		}
	}, []);

	const completeRide = useCallback(
		async (summary: RideSummary): Promise<number | null> => {
			await flush();

			let id = rideIdRef.current;

			if (!summary.trackPoints.length) {
				rideIdRef.current = null;
				lastFlushedRef.current = 0;
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

			await persistMeta(id, lastFlushedRef.current, {
				isCompleted: true,
				completedAt: lastPoint.timestamp,
				finalStats,
			});

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

			rideIdRef.current = null;
			lastFlushedRef.current = 0;
			return id;
		},
		[flush],
	);

	return { flush, beginRide, completeRide };
}
