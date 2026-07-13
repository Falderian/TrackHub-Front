import * as IntentLauncher from "expo-intent-launcher";
import { Alert, Linking, Platform } from "react-native";

export async function requestBatteryExemption(): Promise<void> {
	if (Platform.OS !== "android") return;

	try {
		await IntentLauncher.startActivityAsync(
			"android.settings.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
			{ data: "package:com.protasckina.trackhub" },
		);
	} catch {
		try {
			await IntentLauncher.startActivityAsync(
				"android.settings.IGNORE_BATTERY_OPTIMIZATION_SETTINGS",
			);
		} catch {
			Linking.openSettings();
		}
	}
}

let hasShownThisSession = false;

export async function promptBatteryExemption(): Promise<boolean> {
	if (Platform.OS !== "android") return false;
	if (hasShownThisSession) return false;

	return new Promise((resolve) => {
		Alert.alert(
			"Battery optimisation",
			"Android may stop GPS tracking when the screen is off to save battery. To record complete rides, disable battery optimisation for TrackHub on the next screen.",
			[
				{
					text: "Later",
					style: "cancel",
					onPress: () => resolve(false),
				},
				{
					text: "Open settings",
					style: "default",
					onPress: () => {
						hasShownThisSession = true;
						requestBatteryExemption();
						resolve(true);
					},
				},
			],
			{ cancelable: true, onDismiss: () => resolve(false) },
		);
	});
}
