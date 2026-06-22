import { useCallback, useEffect, useRef } from "react";
import { roundTo } from "../helpers/ride";
import { api } from "../services/api";
import { getRideState, type RideSummary } from "../services/location";

export function useRideSync(isActive: boolean) {
	const rideIdRef = useRef<number | null>(null);
	const lastFlushedRef = useRef(0);
	const flushingRef = useRef(false);

	const flush = useCallback(async () => {
		const id = rideIdRef.current;
		if (!id || flushingRef.current) return;

		const locations = getRideState().locations;
		const points = locations.slice(lastFlushedRef.current);
		if (points.length === 0) return;

		flushingRef.current = true;
		try {
			await api.addTrackPoints(
				id,
				points.map((p) => ({
					latitude: p.latitude,
					longitude: p.longitude,
					timestamp: new Date(p.timestamp).toISOString(),
					speed: p.speed ?? undefined,
					elevation: p.elevation ?? undefined,
				})),
			);
			lastFlushedRef.current += points.length;
		} catch (err) {
			console.error("Failed to flush track points:", err);
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

		try {
			const ride = await api.createRide({
				startTime: new Date(state.rideStartTime).toISOString(),
			});
			rideIdRef.current = (ride as { id: number }).id;
		} catch (err) {
			console.error("Failed to create ride on backend:", err);
		}
	}, []);

	const completeRide = useCallback(
		async (summary: RideSummary): Promise<number | null> => {
			await flush();

			const id = rideIdRef.current;
			rideIdRef.current = null;
			lastFlushedRef.current = 0;

			if (!summary.trackPoints.length) return null;

			const lastPoint = summary.trackPoints[summary.trackPoints.length - 1];
			const distanceKm = summary.distance / 1000;
			const durationHours = summary.totalElapsed / 3600;
			const avgSpeed = durationHours > 0 ? distanceKm / durationHours : 0;

			// Use GPS chip Doppler speed (m/s → km/h) — far more accurate
			// than computing from position deltas which are dominated by noise.
			let maxSpeed = 0;
			for (const p of summary.trackPoints) {
				if (p.speed != null && p.speed > 0) {
					const kmh = p.speed * 3.6;
					if (kmh > maxSpeed) maxSpeed = kmh;
				}
			}

			if (id) {
				try {
					await api.updateRide(id, {
						endTime: lastPoint.timestamp,
						distance: roundTo(distanceKm, 2),
						avgSpeed: roundTo(avgSpeed, 2),
						maxSpeed: roundTo(maxSpeed, 2),
					});
					return id;
				} catch (err) {
					console.error("Failed to finalize ride:", err);
					return id;
				}
			}

			try {
				const ride = await api.createRide({
					startTime: summary.startTime,
					trackPoints: summary.trackPoints,
				});
				return (ride as { id: number }).id;
			} catch (err) {
				console.error("Failed to save ride:", err);
			}
			return null;
		},
		[flush],
	);

	return { flush, beginRide, completeRide };
}
