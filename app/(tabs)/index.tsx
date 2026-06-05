import { View, StyleSheet } from "react-native";
import { Text, Button, Surface, useTheme, IconButton } from "react-native-paper";
import { useAuth } from "../../contexts/auth";

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <IconButton icon="bike" size={48} iconColor={colors.primary} style={styles.icon} />
      <Text variant="headlineSmall" style={styles.greeting}>
        Hello, {user?.username ?? "Rider"}
      </Text>
      <Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
        {user?.email}
      </Text>

      <Surface style={[styles.card, { backgroundColor: colors.surface }]} elevation={2}>
        <Text variant="bodySmall" style={{ color: colors.onSurfaceVariant }}>No rides yet</Text>
        <Text variant="titleMedium" style={{ color: colors.onSurface }}>Start your first ride</Text>
      </Surface>

      <Button mode="outlined" onPress={logout} textColor={colors.error} style={styles.logoutButton}>
        Log out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    padding: 24,
    paddingTop: 80,
  },
  icon: {
    marginBottom: 8,
  },
  greeting: {
    fontWeight: "bold",
  },
  card: {
    width: "100%",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
    marginBottom: 24,
  },
  logoutButton: {
    borderColor: "#bf616a",
  },
});
