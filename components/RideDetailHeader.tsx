import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { IconButton, useTheme } from "react-native-paper";

interface Props {
	onDelete: () => void;
	deleting: boolean;
}

export default function RideDetailHeader({ onDelete, deleting }: Props) {
	const { colors } = useTheme();

	return (
		<View style={styles.row}>
			<IconButton
				icon="arrow-left"
				size={22}
				iconColor={colors.primary}
				style={styles.btn}
				onPress={() => router.back()}
			/>
			<View style={styles.spacer} />
			<IconButton
				icon="delete"
				size={20}
				iconColor={colors.error}
				style={styles.btn}
				onPress={onDelete}
				disabled={deleting}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
	},
	spacer: { flex: 1 },
	btn: { margin: 0, width: 40, height: 40 },
});
