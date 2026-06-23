import { router } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { Alert } from "react-native";
import { clearPersistedRide, restoreActiveRide } from "../services/location";
import { drainPendingSync, hasOrphanedActiveRide } from "../services/recovery";
import { clearSyncMeta } from "../services/storage";

export function useRecovery() {
	useEffect(() => {
		(async () => {
			await SplashScreen.hideAsync();

			drainPendingSync().catch(() => {});

			const orphaned = await hasOrphanedActiveRide();
			if (!orphaned) return;

			Alert.alert(
				"Resume ride?",
				"It looks like you have a ride in progress from your last session. Would you like to resume it?",
				[
					{
						text: "Discard",
						style: "destructive",
						onPress: async () => {
							await clearPersistedRide().catch(() => {});
							await clearSyncMeta().catch(() => {});
						},
					},
					{
						text: "Resume",
						onPress: async () => {
							const restored = await restoreActiveRide();
							if (restored) {
								router.push("/record");
							}
						},
					},
				],
				{ cancelable: false },
			);
		})();
	}, []);
}
