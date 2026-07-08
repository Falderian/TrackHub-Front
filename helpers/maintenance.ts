import type { MaintenanceAction, MaintenanceStatus, MaintenanceType } from "../types";
import {
	BRAKE_PAD_MATERIALS,
	FORK_TYPES,
	MAINTENANCE_DEFAULTS,
} from "../types";

const TYPE_LABEL: Record<MaintenanceType, string> = {
	brake_pads: "Brake pads",
	fork: "Fork",
	tires: "Tires",
	chain: "Chain",
	cassette: "Cassette",
	other: "Maintenance",
};

export function formatLabel(s: MaintenanceStatus): string {
	const parts: string[] = [];
	if (s.remainingKm !== null) {
		parts.push(
			s.remainingKm <= 0
				? `${Math.abs(s.remainingKm)} km ago`
				: `${s.remainingKm} km left`,
		);
	}
	if (s.remainingDays !== null) {
		parts.push(
			s.remainingDays <= 0
				? `${Math.abs(s.remainingDays)}d ago`
				: `${s.remainingDays}d left`,
		);
	}
	return parts.join(" · ");
}

export function buildMessage(
	due: MaintenanceStatus[],
	soon: MaintenanceStatus[],
): string {
	if (due.length === 1 && soon.length === 0) {
		const s = due[0];
		const typeLabel = TYPE_LABEL[s.type] ?? s.type;
		const action = s.action === "replace" ? "replacement" : "check";
		const label = formatLabel(s);
		return `${typeLabel} ${action} overdue — ${label}`;
	}
	if (due.length === 0 && soon.length === 1) {
		const s = soon[0];
		const typeLabel = TYPE_LABEL[s.type] ?? s.type;
		const action = s.action === "replace" ? "replacement" : "check";
		const label = formatLabel(s);
		return `${typeLabel} ${action} due soon — ${label}`;
	}

	const parts: string[] = [];
	if (due.length > 0)
		parts.push(`${due.length} item${due.length > 1 ? "s" : ""} overdue`);
	if (soon.length > 0) parts.push(`${soon.length} due soon`);
	return `${parts.join(", ")} — Tap to review`;
}

export interface StatusColors {
	error: string;
	onSurfaceVariant: string;
}

export function dotColor(
	status: string,
	disabled: boolean,
	colors: StatusColors,
): string {
	if (disabled) return colors.onSurfaceVariant;
	switch (status) {
		case "due":
			return colors.error;
		case "soon":
			return "#e6a817";
		case "ok":
			return "#4caf50";
		default:
			return colors.onSurfaceVariant;
	}
}

export function statusLabel(s: MaintenanceStatus): string {
	if (s.status === "unknown") return s.disabled ? "Disabled" : "No data";
	const p: string[] = [];
	if (s.remainingKm !== null)
		p.push(
			s.remainingKm <= 0
				? `Overdue ${Math.abs(s.remainingKm)}km`
				: `${s.remainingKm}km left`,
		);
	if (s.remainingDays !== null)
		p.push(
			s.remainingDays <= 0
				? `Overdue ${Math.abs(s.remainingDays)}d`
				: `${s.remainingDays}d left`,
		);
	return p.length > 0 ? p.join(" · ") : s.status === "ok" ? "OK" : "DUE";
}

export function getDefaults(
	type: MaintenanceType,
	action: MaintenanceAction,
): { km: string; days: string } {
	const def = MAINTENANCE_DEFAULTS[type];
	let km = action === "check" ? def.checkKm : def.replaceKm;
	let days = action === "check" ? def.checkDays : def.replaceDays;
	if (km === 0 && days === 0) {
		if (type === "brake_pads") km = BRAKE_PAD_MATERIALS[0].intervalKm;
		if (type === "fork") {
			km = FORK_TYPES[0].intervalKm;
			days = FORK_TYPES[0].intervalDays;
		}
	}
	return { km: km > 0 ? String(km) : "", days: days > 0 ? String(days) : "" };
}
