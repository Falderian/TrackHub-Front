import { Button, Dialog, Portal, Text, useTheme } from "react-native-paper";

interface Props {
	visible: boolean;
	onDismiss: () => void;
	onConfirm: () => void;
	loading: boolean;
}

export default function DeleteRideDialog({
	visible,
	onDismiss,
	onConfirm,
	loading,
}: Props) {
	const { colors } = useTheme();

	return (
		<Portal>
			<Dialog visible={visible} onDismiss={onDismiss}>
				<Dialog.Title>Delete ride?</Dialog.Title>
				<Dialog.Content>
					<Text variant="bodyMedium">
						This will permanently delete this ride and all its track data.
						This action cannot be undone.
					</Text>
				</Dialog.Content>
				<Dialog.Actions>
					<Button onPress={onDismiss}>Cancel</Button>
					<Button
						onPress={onConfirm}
						loading={loading}
						textColor={colors.error}
					>
						Delete
					</Button>
				</Dialog.Actions>
			</Dialog>
		</Portal>
	);
}
