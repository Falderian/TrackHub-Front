export const STADIA_API_KEY = "7902b426-cec2-48f1-90ad-d45bfa1d7733";

const API = STADIA_API_KEY;
export const TILE_STYLES = [
	{
		name: "Outdoors",
		url: `https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}@2x.png?api_key=${API}`,
	},
	{
		name: "Smooth",
		url: `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}@2x.png?api_key=${API}`,
	},
	{
		name: "Dark",
		url: `https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png?api_key=${API}`,
	},
];
