import { router } from "expo-router";
import { ScrollView, StyleSheet, View } from "react-native";
import {
	Avatar,
	Button,
	Icon,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import { useAuth } from "../contexts/auth";

export default function HomeScreen() {
	const { user, logout } = useAuth();
	const { colors } = useTheme();

	const initials = user?.username
		? user.username.slice(0, 2).toUpperCase()
		: "??";

	return (
		<ScrollView
			style={[styles.container, { backgroundColor: colors.background }]}
			contentContainerStyle={styles.content}
		>
			<View style={styles.welcomeRow}>
				<Avatar.Text
					size={56}
					label={initials}
					color={colors.onPrimary}
					style={{ backgroundColor: colors.primary }}
				/>
				<View style={styles.welcomeText}>
					<Text
						variant="titleLarge"
						style={{ color: colors.onBackground, fontWeight: "700" }}
					>
						Welcome back
					</Text>
					<Text variant="bodyMedium" style={{ color: colors.onSurfaceVariant }}>
						{user?.email}
					</Text>
				</View>
			</View>

			<View style={styles.statsRow}>
				<Surface
					style={[styles.statCard, { backgroundColor: colors.surface }]}
					elevation={1}
				>
					<Icon source="routes" size={22} color={colors.primary} />
					<Text
						variant="titleLarge"
						style={[styles.statValue, { color: colors.onSurface }]}
					>
						0
					</Text>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						Rides
					</Text>
				</Surface>

				<Surface
					style={[styles.statCard, { backgroundColor: colors.surface }]}
					elevation={1}
				>
					<Icon source="map-marker-distance" size={22} color={colors.primary} />
					<Text
						variant="titleLarge"
						style={[styles.statValue, { color: colors.onSurface }]}
					>
						0.0
					</Text>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						km
					</Text>
				</Surface>

				<Surface
					style={[styles.statCard, { backgroundColor: colors.surface }]}
					elevation={1}
				>
					<Icon source="clock-outline" size={22} color={colors.primary} />
					<Text
						variant="titleLarge"
						style={[styles.statValue, { color: colors.onSurface }]}
					>
						0h
					</Text>
					<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
						Time
					</Text>
				</Surface>
			</View>

			<Button
				mode="contained"
				icon="bike"
				onPress={() => router.push("/record")}
				buttonColor={colors.primary}
				contentStyle={styles.ctaInner}
				style={styles.cta}
				labelStyle={{ fontWeight: "700", fontSize: 16 }}
			>
				Start a Ride
			</Button>

			<View style={styles.sectionHeader}>
				<Text
					variant="titleMedium"
					style={{ color: colors.onBackground, fontWeight: "600" }}
				>
					Recent Rides
				</Text>
			</View>

			<Surface
				style={[styles.emptyCard, { backgroundColor: colors.surface }]}
				elevation={1}
			>
				<View
					style={[
						styles.emptyIconWrap,
						{ backgroundColor: colors.surfaceVariant },
					]}
				>
					<Icon source="bike" size={40} color={colors.onSurfaceVariant} />
				</View>
				<Text
					variant="titleMedium"
					style={{ color: colors.onSurface, marginTop: 12 }}
				>
					No rides yet
				</Text>
				<Text
					variant="bodySmall"
					style={{
						color: colors.onSurfaceVariant,
						textAlign: "center",
						marginTop: 4,
					}}
				>
					Hit Start a Ride to record your first one
				</Text>
			</Surface>

			<Button
				mode="text"
				onPress={logout}
				textColor={colors.error}
				style={styles.logout}
			>
				Log out
			</Button>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	content: { padding: 24, paddingTop: 64, paddingBottom: 40 },
	welcomeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		marginBottom: 28,
	},
	welcomeText: { flex: 1 },
	statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
	statCard: {
		flex: 1,
		borderRadius: 14,
		padding: 16,
		alignItems: "center",
		gap: 4,
	},
	statValue: { fontWeight: "800" },
	cta: { borderRadius: 14, marginBottom: 32 },
	ctaInner: { paddingVertical: 8 },
	sectionHeader: { marginBottom: 12 },
	emptyCard: { borderRadius: 14, padding: 32, alignItems: "center" },
	emptyIconWrap: {
		width: 72,
		height: 72,
		borderRadius: 36,
		alignItems: "center",
		justifyContent: "center",
	},
	logout: { marginTop: 32, alignSelf: "center" },
});
