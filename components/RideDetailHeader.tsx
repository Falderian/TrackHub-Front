import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, useTheme } from "react-native-paper";

interface Props {
	title: string;
	dateLabel: string | null;
	onDelete: () => void;
	deleting: boolean;
}

export default function RideDetailHeader({
	title,
	dateLabel,
	onDelete,
	deleting,
}: Props) {
	const { colors } = useTheme();

	return (
		<View style={[styles.row, { backgroundColor: colors.surface }]}>
			<IconButton
				icon="arrow-left"
				size={22}
				iconColor={colors.primary}
				style={styles.btn}
				onPress={() => router.back()}
			/>

			<View style={styles.center}>
				<Text
					variant="titleMedium"
					numberOfLines={1}
					style={[styles.title, { color: colors.onBackground }]}
				>
					{title}
				</Text>
				{dateLabel && (
					<Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>
						{dateLabel}
					</Text>
				)}
			</View>

			<IconButton
				icon="delete"
				size={20}
				iconColor={colors.error}
				onPress={onDelete}
				disabled={deleting}
				style={styles.btn}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		paddingRight: 8,
		paddingVertical: 10,
		paddingLeft: 8,
	},
	center: {
		flex: 1,
		flexShrink: 1,
		alignItems: "center",
		paddingHorizontal: 4,
	},
	title: {
		fontWeight: "700",
		textAlign: "center",
	},
	btn: { margin: 0, width: 40, height: 40 },
});
