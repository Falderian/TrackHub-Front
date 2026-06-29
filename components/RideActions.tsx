import { StyleSheet, View } from "react-native";
import { Button, useTheme } from "react-native-paper";

interface Props {
	exporting: boolean;
	onExport: () => void;
	onDelete: () => void;
}

export default function RideActions({ exporting, onExport, onDelete }: Props) {
	const { colors } = useTheme();

	return (
		<View style={styles.root}>
			<Button
				mode="outlined"
				icon="export"
				onPress={onExport}
				loading={exporting}
				disabled={exporting}
			>
				Export GPX
			</Button>

			<Button
				mode="text"
				icon="delete"
				textColor={colors.error}
				onPress={onDelete}
			>
				Delete ride
			</Button>
		</View>
	);
}

const styles = StyleSheet.create({
	root: { gap: 12, marginTop: 8, marginBottom: 16 },
});
