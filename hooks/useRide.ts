import { useCallback, useEffect, useMemo, useState } from "react";
import { fmtTime } from "../helpers/ride";
import {
	getElapsed,
	getRideState,
	pauseTracking,
	type RideState,
	resumeTracking,
	startTracking,
	stopTracking,
	subscribe,
} from "../services/location";
import { useRideSync } from "./useRideSync";

export interface RideData {
	state: RideState;
	elapsed: number;
	distanceKm: string;
	elapsedStr: string;
	speedKmh: string;
	isIdle: boolean;
	isActive: boolean;
	isPaused: boolean;
	start: () => Promise<void>;
	pause: () => Promise<void>;
	resume: () => Promise<void>;
	stop: () => Promise<number | null>;
}

export function useRide(): RideData {
	const [rideState, setRideState] = useState<RideState>(getRideState);
	const [elapsed, setElapsed] = useState(getElapsed);

	const isActive = rideState.running && !rideState.paused;
	const sync = useRideSync(isActive);

	useEffect(() => {
		const unsub = subscribe(() => setRideState({ ...getRideState() }));
		return unsub;
	}, []);

	useEffect(() => {
		if (!rideState.running || rideState.paused) return;
		const timer = setInterval(() => setElapsed(getElapsed()), 1000);
		return () => clearInterval(timer);
	}, [rideState.running, rideState.paused]);

	const refresh = useCallback(() => {
		setRideState({ ...getRideState() });
		setElapsed(getElapsed());
	}, []);

	const start = useCallback(async () => {
		await startTracking();
		refresh();
		await sync.beginRide();
	}, [refresh, sync.beginRide]);

	const pause = useCallback(async () => {
		await sync.flush();
		await pauseTracking();
		refresh();
	}, [refresh, sync.flush]);

	const resume = useCallback(async () => {
		await resumeTracking();
		refresh();
	}, [refresh]);

	const stop = useCallback(async (): Promise<number | null> => {
		const summary = await stopTracking();
		refresh();
		if (!summary) return null;
		return sync.completeRide(summary);
	}, [refresh, sync.completeRide]);

	const distanceKm = useMemo(
		() => (rideState.distance / 1000).toFixed(2),
		[rideState.distance],
	);
	const elapsedStr = useMemo(() => fmtTime(elapsed), [elapsed]);
	const speedKmh = useMemo(
		() =>
			elapsed > 0
				? (rideState.distance / 1000 / (elapsed / 3600)).toFixed(1)
				: "0.0",
		[rideState.distance, elapsed],
	);

	const isIdle = !rideState.running;
	const isPaused = rideState.running && rideState.paused;

	return useMemo(
		() => ({
			state: rideState,
			elapsed,
			distanceKm,
			elapsedStr,
			speedKmh,
			isIdle,
			isActive,
			isPaused,
			start,
			pause,
			resume,
			stop,
		}),
		[
			rideState,
			elapsed,
			distanceKm,
			elapsedStr,
			speedKmh,
			isIdle,
			isActive,
			isPaused,
			start,
			pause,
			resume,
			stop,
		],
	);
}
