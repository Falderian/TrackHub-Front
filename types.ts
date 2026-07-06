export interface Ride {
	id: number;
	userId: number;
	title: string | null;
	startTime: string;
	endTime: string | null;
	distance: number | null;
	avgSpeed: number | null;
	maxSpeed: number | null;
	elevationGain: number;
	elevationLoss: number;
	createdAt: string;
	updatedAt: string;
}

export interface RideStats {
	totalRides: number;
	totalKm: number;
	totalMin: number;
}

export interface ChartPoint {
	d: number;
	v: number;
}

export interface ChartArrays {
	elevation: ChartPoint[];
	speed: ChartPoint[];
}

export interface PaginatedResponse<T> {
	data: T[];
	meta: {
		total: number;
		page: number;
		pageSize: number;
		totalPages: number;
	};
}

export type MaintenanceType =
	| "brake_pads"
	| "tires"
	| "fork"
	| "chain"
	| "cassette"
	| "other";

export type MaintenanceAction = "check" | "replace";

export interface MaintenanceLog {
	id: number;
	userId: number;
	type: MaintenanceType;
	action: MaintenanceAction;
	odometerKm: number;
	intervalKm: number | null;
	intervalDays: number | null;
	cost: number | null;
	notes: string | null;
	performedAt: string;
	createdAt: string;
}

export interface MaintenanceStatus {
	type: MaintenanceType;
	action: MaintenanceAction;
	disabled: boolean;
	lastOdometerKm: number | null;
	lastPerformedAt: string | null;
	intervalKm: number | null;
	intervalDays: number | null;
	remainingKm: number | null;
	remainingDays: number | null;
	status: "ok" | "soon" | "due" | "unknown";
}

export interface MaintenanceTypeInfo {
	type: MaintenanceType;
	label: string;
	icon: string;
}

export interface MaintenanceDefaults {
	checkKm: number;
	checkDays: number;
	replaceKm: number;
	replaceDays: number;
}

export const MAINTENANCE_TYPES: MaintenanceTypeInfo[] = [
	{ type: "brake_pads", label: "Brake Pads", icon: "car-brake-alert" },
	{ type: "fork", label: "Fork Service", icon: "car-shift-pattern" },
	{ type: "tires", label: "Tires", icon: "tire" },
	{ type: "chain", label: "Chain", icon: "link-variant" },
	{ type: "cassette", label: "Cassette", icon: "cog" },
	{ type: "other", label: "Other", icon: "wrench" },
];

export const MAINTENANCE_DEFAULTS: Record<
	MaintenanceType,
	MaintenanceDefaults
> = {
	brake_pads: { checkKm: 0, checkDays: 1, replaceKm: 2000, replaceDays: 0 },
	fork: { checkKm: 0, checkDays: 1, replaceKm: 1000, replaceDays: 180 },
	tires: { checkKm: 0, checkDays: 7, replaceKm: 2000, replaceDays: 0 },
	chain: { checkKm: 100, checkDays: 0, replaceKm: 3000, replaceDays: 0 },
	cassette: { checkKm: 0, checkDays: 90, replaceKm: 6000, replaceDays: 0 },
	other: { checkKm: 0, checkDays: 0, replaceKm: 0, replaceDays: 0 },
};

export const BRAKE_PAD_MATERIALS = [
	{ label: "Organic", intervalKm: 1000 },
	{ label: "Sintered", intervalKm: 2500 },
	{ label: "Ceramic", intervalKm: 3000 },
];

export const FORK_TYPES = [
	{ label: "Air", intervalKm: 1000, intervalDays: 180 },
	{ label: "Coil", intervalKm: 1500, intervalDays: 180 },
];
