export const haversine = (
	a: { latitude: number; longitude: number },
	b: { latitude: number; longitude: number },
): number => {
	const R = 6_371_000;
	const toRad = (d: number) => (d * Math.PI) / 180;
	const dLat = toRad(b.latitude - a.latitude);
	const dLon = toRad(b.longitude - a.longitude);
	const sinLat = Math.sin(dLat / 2);
	const sinLon = Math.sin(dLon / 2);
	const h =
		sinLat * sinLat +
		Math.cos(toRad(a.latitude)) *
			Math.cos(toRad(b.latitude)) *
			sinLon *
			sinLon;
	return R * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};

export const fmtTime = (totalSeconds: number): string => {
	const h = Math.floor(totalSeconds / 3600);
	const m = Math.floor((totalSeconds % 3600) / 60);
	const s = totalSeconds % 60;
	if (h > 0)
		return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
	return `${m}:${String(s).padStart(2, "0")}`;
};

export const fmtDist = (km: number): string =>
	km >= 10 ? `${Math.round(km)}k` : km.toFixed(1);

export const fmtElevation = (m: number): string =>
	Math.abs(m) >= 1000 ? `${(m / 1000).toFixed(1)}k` : `${Math.round(m)}`;

export const fmtPace = (kmh: number): string => {
	if (kmh < 0.5) return "—";
	const minPerKm = 60 / kmh;
	const min = Math.floor(minPerKm);
	const sec = Math.round((minPerKm - min) * 60);
	return `${min}:${String(sec).padStart(2, "0")}`;
};

export const computeXLabels = (
	points: Array<{ d: number }>,
): Array<{ label: string; frac: number }> => {
	if (points.length < 2) return [];

	const totalDist = points[points.length - 1].d;
	const target = 6;
	const raw = totalDist / (target - 1);
	const nice = [1, 2, 5, 10, 20, 50, 100].find((n) => n >= raw) ?? raw;

	const labels: Array<{ label: string; frac: number }> = [];
	let next = 0;
	for (let km = 0; km <= totalDist + nice * 0.5; km += nice) {
		while (next < points.length && points[next].d < km) next++;
		const idx = next < points.length ? next : points.length - 1;
		labels.push({ label: fmtDist(points[idx].d), frac: km / totalDist });
	}
	return labels;
};

export const zoneColor = (
	kmh: number,
	colors: { primary: string; error: string },
): string => {
	if (kmh < 20) return colors.primary;
	if (kmh < 35) return "#e5a412";
	return colors.error;
};

export interface RideMetrics {
	currentSpeed: string;
	maxSpeed: number;
	paceMinPerKm: string;
}

export const computeRideMetrics = (
	locations: ReadonlyArray<{
		latitude: number;
		longitude: number;
		timestamp?: number;
	}>,
	distance: number,
	elapsed: number,
): RideMetrics => {
	let currentSpeed = "0.0";
	let maxSpeed = 0;

	for (let i = 1; i < locations.length; i++) {
		const a = locations[i - 1];
		const b = locations[i];
		const dt =
			a.timestamp && b.timestamp
				? (b.timestamp - a.timestamp) / 1000
				: 1;
		if (dt <= 0) continue;
		const dist = haversine(a, b);
		const speed = (dist / dt) * 3.6;
		if (i === locations.length - 1) currentSpeed = speed.toFixed(1);
		if (speed > maxSpeed) maxSpeed = speed;
	}

	const distKm = distance / 1000;
	const speedKmh = elapsed > 0 ? (distKm / (elapsed / 3600)) : 0;
	const paceMinPerKm =
		distKm > 0.01 && elapsed > 0 ? fmtPace(speedKmh) : "—";

	return { currentSpeed, maxSpeed, paceMinPerKm };
};
