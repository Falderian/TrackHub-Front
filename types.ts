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
