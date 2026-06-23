import { StyleSheet, View } from "react-native";
import { Button, Icon, Surface, Text, useTheme } from "react-native-paper";

interface Props {
	message: string;
	onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: Props) {
	const { colors } = useTheme();

	return (
		<Surface
			style={[styles.card, { backgroundColor: colors.errorContainer }]}
			elevation={0}
		>
			<View style={styles.row}>
				<Icon source="alert-circle" size={20} color={colors.error} />
				<Text
					variant="bodyMedium"
					style={[styles.message, { color: colors.onErrorContainer }]}
					numberOfLines={3}
				>
					{message}
				</Text>
			</View>
			{onRetry && (
				<Button
					mode="text"
					icon="refresh"
					textColor={colors.error}
					onPress={onRetry}
					compact
				>
					Retry
				</Button>
			)}
		</Surface>
	);
}

const styles = StyleSheet.create({
	card: {
		marginHorizontal: 24,
		marginBottom: 16,
		borderRadius: 12,
		padding: 14,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		flex: 1,
		marginRight: 8,
	},
	message: {
		flex: 1,
	},
});
