import { Redirect } from "expo-router";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { Text, useTheme } from "react-native-paper";
import { useAuth } from "../contexts/auth";

export default function Index() {
	const { user, initializing } = useAuth();
	const { colors } = useTheme();

	if (initializing) {
		return (
			<View
				style={[
					styles.container,
					{ backgroundColor: colors.background },
				]}
			>
				<ActivityIndicator size="large" color={colors.primary} />
				<Text
					variant="bodyMedium"
					style={[styles.hint, { color: colors.onSurfaceVariant }]}
				>
					Restoring session…
				</Text>
			</View>
		);
	}

	if (user) {
		return <Redirect href="/home" />;
	}

	return <Redirect href="/(auth)/login" />;
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		gap: 16,
	},
	hint: {
		opacity: 0.6,
	},
});
