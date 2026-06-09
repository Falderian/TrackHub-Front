import { StyleSheet, View } from "react-native";
import { Button, useTheme } from "react-native-paper";

interface Props {
	isIdle: boolean;
	isActive: boolean;
	isPaused: boolean;
	onStart: () => void;
	onPause: () => void;
	onResume: () => void;
	onStop: () => void;
}

export default function RideControls({
	isIdle,
	isActive,
	isPaused,
	onStart,
	onPause,
	onResume,
	onStop,
}: Props) {
	const { colors } = useTheme();

	return (
		<View style={styles.row}>
			{isIdle && (
				<Button
					mode="contained"
					icon="bike"
					onPress={onStart}
					buttonColor={colors.primary}
					contentStyle={styles.main}
					labelStyle={styles.mainLabel}
					style={styles.full}
				>
					Start a ride
				</Button>
			)}

			{isActive && (
				<>
					<Button
						mode="outlined"
						icon="pause"
						onPress={onPause}
						textColor={colors.primary}
						style={[styles.half, { borderColor: colors.primary }]}
						contentStyle={styles.halfInner}
					>
						Pause
					</Button>
					<Button
						mode="contained"
						icon="stop"
						onPress={onStop}
						buttonColor={colors.error}
						style={styles.half}
						contentStyle={styles.halfInner}
					>
						Stop
					</Button>
				</>
			)}

			{isPaused && (
				<>
					<Button
						mode="contained"
						icon="play"
						onPress={onResume}
						buttonColor={colors.primary}
						style={styles.half}
						contentStyle={styles.halfInner}
					>
						Resume
					</Button>
					<Button
						mode="outlined"
						icon="stop"
						onPress={onStop}
						textColor={colors.error}
						style={[styles.half, { borderColor: colors.error }]}
						contentStyle={styles.halfInner}
					>
						Stop
					</Button>
				</>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	row: { flexDirection: "row", gap: 14, justifyContent: "center" },
	full: { borderRadius: 14, flex: 1 },
	main: { paddingVertical: 10 },
	mainLabel: { fontWeight: "700", fontSize: 17 },
	half: { flex: 1, borderRadius: 14 },
	halfInner: { paddingVertical: 8 },
});
