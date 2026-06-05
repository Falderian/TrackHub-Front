import { useState } from "react";
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform } from "react-native";
import { TextInput, Button, Text, useTheme } from "react-native-paper";
import { Link, router } from "expo-router";
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

  const handleRegister = async () => {
    if (!email.trim() || !username.trim() || !password.trim()) return;
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    try {
      await register(email.trim(), username.trim(), password);
      router.replace("/(tabs)");
    } catch (e: any) {
      Alert.alert("Registration failed", e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={[styles.container, { backgroundColor: colors.background }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Text variant="headlineLarge" style={styles.title}>Create Account</Text>
      <Text variant="bodyLarge" style={[styles.subtitle, { color: colors.onSurfaceVariant }]}>
        Join TrackHub and start riding
      </Text>

      <TextInput
        mode="outlined"
        label="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        style={styles.input}
      />
      <TextInput
        mode="outlined"
        label="Password (min 6 characters)"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      <Button
        mode="contained"
        onPress={handleRegister}
        loading={submitting}
        disabled={submitting}
        style={styles.button}
        buttonColor={colors.secondary}
      >
        Register
      </Button>

      <Link href="/(auth)/login" style={[styles.link, { color: colors.primary }]}>
        Already have an account? Sign in
      </Link>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    textAlign: "center",
    fontWeight: "bold",
  },
  subtitle: {
    textAlign: "center",
    marginBottom: 32,
    marginTop: 4,
  },
  input: {
    marginBottom: 12,
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
  },
  link: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 14,
  },
});
