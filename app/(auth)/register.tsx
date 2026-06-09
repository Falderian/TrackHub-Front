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

const TEST_EMAIL = "newuser@example.com";
const TEST_USERNAME = "rider1";
const TEST_PASSWORD = "secret123";

export default function RegisterScreen() {
	const { register } = useAuth();
	const { colors } = useTheme();
	const [email, setEmail] = useState(TEST_EMAIL);
	const [username, setUsername] = useState(TEST_USERNAME);
	const [password, setPassword] = useState(TEST_PASSWORD);
	const [submitting, setSubmitting] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const handleRegister = async () => {
		if (!email.trim() || !username.trim() || !password.trim()) return;
		if (password.length < 6) {
			Alert.alert("Error", "Password must be at least 6 characters");
			return;
		}
		setSubmitting(true);
		try {
			await register(email.trim(), username.trim(), password);
			router.replace("/home");
		} catch (e: unknown) {
			Alert.alert(
				"Registration failed",
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
				{/* Branded Header */}
				<View style={styles.header}>
					<View
						style={[
							styles.iconCircle,
							{ backgroundColor: colors.secondaryContainer },
						]}
					>
						<Icon source="account-plus" size={48} color={colors.secondary} />
					</View>
					<Text
						variant="headlineLarge"
						style={[styles.title, { color: colors.onBackground }]}
					>
						Join TrackHub
					</Text>
					<Text variant="bodyLarge" style={{ color: colors.onSurfaceVariant }}>
						Start logging your rides
					</Text>
				</View>

				{/* Form Card */}
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
						label="Username"
						value={username}
						onChangeText={setUsername}
						autoCapitalize="none"
						autoCorrect={false}
						left={<TextInput.Icon icon="account-outline" />}
						style={styles.input}
					/>
					<TextInput
						mode="outlined"
						label="Password (min 6 characters)"
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
						onPress={handleRegister}
						loading={submitting}
						disabled={submitting}
						buttonColor={colors.secondary}
						contentStyle={styles.buttonInner}
						style={styles.button}
					>
						Create Account
					</Button>
				</Surface>

				<Divider
					style={[styles.divider, { backgroundColor: colors.outline }]}
				/>

				<Link
					href="/(auth)/login"
					style={[styles.link, { color: colors.primary }]}
				>
					Already have an account? Sign in
				</Link>
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
});
