/** Returns a time-of-day greeting. */
export function greeting(): string {
	const hour = new Date().getHours();
	if (hour < 12) return "Good morning";
	if (hour < 18) return "Good afternoon";
	return "Good evening";
}

/** Returns a human-readable relative time string (e.g. "5m ago", "Yesterday"). */
export function relativeTime(dateStr: string): string {
	const now = Date.now();
	const then = new Date(dateStr).getTime();
	const diffMin = Math.floor((now - then) / 60_000);
	const diffHrs = Math.floor(diffMin / 60);
	const diffDays = Math.floor(diffHrs / 24);
	if (diffMin < 1) return "Just now";
	if (diffMin < 60) return `${diffMin}m ago`;
	if (diffHrs < 24) return `${diffHrs}h ago`;
	if (diffDays === 1) return "Yesterday";
	if (diffDays < 7) return `${diffDays}d ago`;
	return new Date(dateStr).toLocaleDateString();
}

/** Returns ISO strings for the start of the current week (Sunday 00:00) and now. */
export function getWeekRange(): { from: string; to: string } {
	const now = new Date();
	const start = new Date(now);
	start.setDate(now.getDate() - now.getDay());
	start.setHours(0, 0, 0, 0);
	return { from: start.toISOString(), to: now.toISOString() };
}
