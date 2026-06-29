import { Link, router } from "expo-router";
import { useState } from "react";
import {
	Alert,
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	View,
} from "react-native";
import {
	Button,
	Divider,
	Icon,
	Surface,
	Text,
	TextInput,
	useTheme,
} from "react-native-paper";
import { useAuth } from "../../contexts/auth";

const TEST_EMAIL = "test@example.com";
const TEST_PASSWORD = "secret123";

export default function LoginScreen() {
	const { login, continueOffline } = useAuth();
	const { colors } = useTheme();
	const [email, setEmail] = useState(TEST_EMAIL);
	const [password, setPassword] = useState(TEST_PASSWORD);
	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async () => {
		if (!email.trim() || !password.trim()) return;
		setSubmitting(true);
		try {
			await login(email.trim(), password);
			router.replace("/home");
		} catch (e: unknown) {
			Alert.alert(
				"Login failed",
				e instanceof Error ? e.message : "Unknown error",
			);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={[styles.container, { backgroundColor: colors.background }]}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<ScrollView
				contentContainerStyle={styles.scroll}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.header}>
					<View
						style={[
							styles.iconCircle,
							{ backgroundColor: colors.primaryContainer },
						]}
					>
						<Icon source="bike" size={48} color={colors.primary} />
					</View>
					<Text
						variant="headlineLarge"
						style={[styles.title, { color: colors.onBackground }]}
					>
						TrackHub
					</Text>
					<Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant }}>
						Track every ride
					</Text>
				</View>

				<Surface
					style={[styles.card, { backgroundColor: colors.surface }]}
					elevation={2}
				>
					<TextInput
						mode="outlined"
						label="Email"
						value={email}
						onChangeText={setEmail}
						autoCapitalize="none"
						keyboardType="email-address"
						autoCorrect={false}
						left={<TextInput.Icon icon="email-outline" />}
						style={styles.input}
					/>
					<TextInput
						mode="outlined"
						label="Password"
						value={password}
						onChangeText={setPassword}
						secureTextEntry={!showPassword}
						left={<TextInput.Icon icon="lock-outline" />}
						right={
							<TextInput.Icon
								icon={showPassword ? "eye-off" : "eye"}
								onPress={() => setShowPassword((v) => !v)}
							/>
						}
						style={styles.input}
					/>

					<Button
						mode="contained"
						onPress={handleLogin}
						loading={submitting}
						disabled={submitting}
						buttonColor={colors.primary}
						contentStyle={styles.buttonInner}
						style={styles.button}
					>
						Sign In
					</Button>
				</Surface>

				<Divider
					style={[styles.divider, { backgroundColor: colors.outline }]}
				/>

				<Link
					href="/(auth)/register"
					style={[styles.link, { color: colors.primary }]}
				>
					Don't have an account? Register
				</Link>

				<View style={styles.offlineSection}>
					<Divider
						style={[styles.divider, { backgroundColor: colors.outline }]}
					/>
					<Text
						variant="bodySmall"
						style={{
							color: colors.onSurfaceVariant,
							textAlign: "center",
							marginBottom: 12,
						}}
					>
						No internet? Record rides now, sync later.
					</Text>
					<Button
						mode="outlined"
						icon="wifi-off"
						onPress={continueOffline}
						textColor={colors.onSurfaceVariant}
						style={[styles.offlineButton, { borderColor: colors.outline }]}
					>
						Continue Offline
					</Button>
				</View>
			</ScrollView>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
	scroll: {
		flexGrow: 1,
		justifyContent: "center",
		padding: 24,
		paddingBottom: 48,
	},
	header: {
		alignItems: "center",
		marginBottom: 36,
	},
	iconCircle: {
		width: 88,
		height: 88,
		borderRadius: 44,
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 16,
	},
	title: {
		fontWeight: "800",
		letterSpacing: 1,
	},
	card: {
		borderRadius: 16,
		padding: 20,
	},
	input: {
		marginBottom: 12,
	},
	button: {
		marginTop: 6,
		borderRadius: 12,
	},
	buttonInner: {
		paddingVertical: 6,
	},
	divider: {
		marginVertical: 24,
		opacity: 0.4,
	},
	link: {
		textAlign: "center",
		fontSize: 14,
		fontWeight: "500",
	},
	offlineSection: {
		marginTop: 8,
	},
	offlineButton: {
		borderRadius: 12,
	},
});
