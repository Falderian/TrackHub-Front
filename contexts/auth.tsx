import { router } from "expo-router";
import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";
import { api } from "../services/api";
import { drainPendingSync } from "../services/recovery";
import {
	clearTokens as clearApiTokens,
	restoreTokens,
	setTokens,
} from "../services/tokens";

type User = {
	id: number;
	email: string;
	username: string;
};

type AuthState = {
	user: User | null;
	initializing: boolean;
	isGuest: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (
		email: string,
		username: string,
		password: string,
	) => Promise<void>;
	logout: () => Promise<void>;
	continueOffline: () => void;
};

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [initializing, setInitializing] = useState(true);
	const [isGuest, setIsGuest] = useState(false);

	useEffect(() => {
		(async () => {
			try {
				const restored = await restoreTokens();
				if (restored) {
					const me = await api.getMe();
					setUser(me);
				}
			} catch {
				clearApiTokens();
			} finally {
				setInitializing(false);
			}
		})();
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const data = await api.login({ email, password });
		await setTokens(data.accessToken, data.refreshToken);
		const me = await api.getMe();
		setUser(me);
		setIsGuest(false);
		drainPendingSync().catch((err) =>
			console.warn("[TrackHub] drainPendingSync after login failed:", err),
		);
	}, []);

	const register = useCallback(
		async (email: string, username: string, password: string) => {
			const data = await api.register({ email, username, password });
			await setTokens(data.accessToken, data.refreshToken);
			const me = await api.getMe();
			setUser(me);
			setIsGuest(false);
			drainPendingSync().catch((err) =>
				console.warn("[TrackHub] drainPendingSync after register failed:", err),
			);
		},
		[],
	);

	const logout = useCallback(async () => {
		await clearApiTokens();
		setUser(null);
		setIsGuest(false);
		router.replace("/(auth)/login");
	}, []);

	const continueOffline = useCallback(() => {
		setUser({ id: 0, email: "", username: "Offline" });
		setIsGuest(true);
		setInitializing(false);
		router.replace("/home");
	}, []);

	return (
		<AuthContext.Provider
			value={{
				user,
				initializing,
				isGuest,
				login,
				register,
				logout,
				continueOffline,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth must be used within AuthProvider");
	return ctx;
}
