import { useCallback, useRef } from "react";
import {
	Animated,
	type GestureResponderEvent,
	PanResponder,
	type PanResponderGestureState,
	Pressable,
	StyleSheet,
	View,
} from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

const DELETE_THRESHOLD = -80;
const DELETE_WIDTH = 80;

type Props = {
	children: React.ReactNode;
	onDelete: () => void;
};

export default function SwipeableRow({ children, onDelete }: Props) {
	const { colors } = useTheme();
	const translateX = useRef(new Animated.Value(0)).current;
	const isOpen = useRef(false);

	const snapTo = useCallback(
		(toValue: number) => {
			Animated.spring(translateX, {
				toValue,
				useNativeDriver: true,
				bounciness: 0,
			}).start();
			isOpen.current = toValue === -DELETE_WIDTH;
		},
		[translateX],
	);

	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (
				_: GestureResponderEvent,
				gs: PanResponderGestureState,
			) => Math.abs(gs.dx) > 10 && Math.abs(gs.dy) < 10,
			onPanResponderMove: (
				_: GestureResponderEvent,
				gs: PanResponderGestureState,
			) => {
				const current = isOpen.current ? -DELETE_WIDTH + gs.dx : gs.dx;
				if (current <= 0) {
					translateX.setValue(Math.max(current, -DELETE_WIDTH * 1.5));
				}
			},
			onPanResponderRelease: (
				_: GestureResponderEvent,
				gs: PanResponderGestureState,
			) => {
				if (gs.dx < DELETE_THRESHOLD || isOpen.current) {
					snapTo(gs.dx < 0 ? -DELETE_WIDTH : 0);
				} else {
					snapTo(0);
				}
			},
		}),
	).current;

	const close = useCallback(() => snapTo(0), [snapTo]);

	return (
		<View style={styles.container}>
			<View style={[styles.deleteAction, { backgroundColor: colors.error }]}>
				<Pressable
					onPress={() => {
						close();
						onDelete();
					}}
					style={styles.deletePressable}
				>
					<Icon source="delete" size={20} color={colors.onError} />
					<Text
						variant="labelSmall"
						style={{ color: colors.onError, fontWeight: "600" }}
					>
						Delete
					</Text>
				</Pressable>
			</View>

			<Animated.View
				style={{ transform: [{ translateX }] }}
				{...panResponder.panHandlers}
			>
				{children}
			</Animated.View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: { position: "relative" },
	deleteAction: {
		position: "absolute",
		right: 0,
		top: 0,
		bottom: 8,
		width: DELETE_WIDTH,
		borderRadius: 12,
		alignItems: "center",
		justifyContent: "center",
	},
	deletePressable: {
		alignItems: "center",
		justifyContent: "center",
		gap: 2,
		flex: 1,
		width: "100%",
	},
});
