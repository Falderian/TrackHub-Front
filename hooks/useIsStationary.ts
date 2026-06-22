import { Accelerometer } from "expo-sensors";
import { useEffect, useState } from "react";

/**
 * Returns true when the device's accelerometer indicates no physical movement.
 * Uses variance of acceleration magnitude over a ~1-second sliding window —
 * when cycling, road vibration produces high variance; when stationary, only
 * sensor noise remains.
 */
export function useIsStationary(): boolean {
	const [stationary, setStationary] = useState(true);

	useEffect(() => {
		const window: number[] = [];
		const MAX_SAMPLES = 10; // ~1s at 100ms interval

		const sub = Accelerometer.addListener(({ x, y, z }) => {
			const mag = Math.sqrt(x * x + y * y + z * z);
			window.push(mag);
			if (window.length > MAX_SAMPLES) window.shift();

			if (window.length < 5) return; // need enough samples

			const mean = window.reduce((s, v) => s + v, 0) / window.length;
			const variance =
				window.reduce((s, v) => s + (v - mean) ** 2, 0) / window.length;

			// Variance below 0.1 means the device is essentially still.
			// Cycling on rough roads: 1–10+.  Walking: 0.5–2.  Still: < 0.05.
			setStationary(variance < 0.1);
		});

		Accelerometer.setUpdateInterval(100);

		return () => sub.remove();
	}, []);

	return stationary;
}
