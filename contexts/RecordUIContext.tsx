import {
	createContext,
	type ReactNode,
	type RefObject,
	useContext,
	useState,
} from "react";
import type { RideMapHandle } from "../components/RideMap";

type MapContextValue = {
	autoCenter: boolean;
	setAutoCenter: (v: boolean | ((prev: boolean) => boolean)) => void;
	mapRef: RefObject<RideMapHandle | null>;
};

const MapContext = createContext<MapContextValue | null>(null);

type LayoutContextValue = {
	expanded: boolean;
	setExpanded: (v: boolean | ((prev: boolean) => boolean)) => void;
};

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function RecordUIProvider({
	children,
	mapRef,
}: {
	children: ReactNode;
	mapRef: RefObject<RideMapHandle | null>;
}) {
	const [autoCenter, setAutoCenter] = useState(false);
	const [expanded, setExpanded] = useState(false);

	return (
		<MapContext.Provider value={{ autoCenter, setAutoCenter, mapRef }}>
			<LayoutContext.Provider value={{ expanded, setExpanded }}>
				{children}
			</LayoutContext.Provider>
		</MapContext.Provider>
	);
}

export function useRecordMapUI() {
	const ctx = useContext(MapContext);
	if (!ctx)
		throw new Error("useRecordMapUI must be used within RecordUIProvider");
	return ctx;
}

export function useOptionalRecordMapUI() {
	return useContext(MapContext);
}

export function useRecordLayoutUI() {
	const ctx = useContext(LayoutContext);
	if (!ctx)
		throw new Error("useRecordLayoutUI must be used within RecordUIProvider");
	return ctx;
}
