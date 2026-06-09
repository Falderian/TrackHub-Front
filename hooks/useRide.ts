import { useCallback, useEffect, useMemo, useState } from "react";
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
	stop: () => Promise<void>;
}

function fmtTime(s: number) {
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	if (h > 0)
		return `${h}:${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
	return `${m}:${String(sec).padStart(2, "0")}`;
}

export function useRide(): RideData {
	const [rideState, setRideState] = useState<RideState>(getRideState);
	const [elapsed, setElapsed] = useState(getElapsed);

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
	}, [refresh]);

	const pause = useCallback(async () => {
		await pauseTracking();
		refresh();
	}, [refresh]);

	const resume = useCallback(async () => {
		await resumeTracking();
		refresh();
	}, [refresh]);

	const stop = useCallback(async () => {
		await stopTracking();
		refresh();
	}, [refresh]);

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
	const isActive = rideState.running && !rideState.paused;
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
