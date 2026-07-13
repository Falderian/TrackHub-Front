import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Alert, StyleSheet, useColorScheme, View } from "react-native";
import {
	Avatar,
	Button,
	Divider,
	IconButton,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorBanner from "../components/ErrorBanner";
import PermissionCheck from "../components/PermissionCheck";
import { SkeletonProfile } from "../components/SkeletonLoader";
import { useAuth } from "../contexts/auth";
import { useRidesOverview } from "../hooks/queries";

export default function ProfileScreen() {
	const { user, logout } = useAuth();
	const { colors } = useTheme();
	const scheme = useColorScheme();
	const insets = useSafeAreaInsets();

	const { stats, totalRides, isLoading, isError, errorMessage, retry } =
		useRidesOverview(1);

	const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<StatusBar
				style={scheme === "dark" ? "light" : "dark"}
				backgroundColor={colors.background}
			/>

			<View style={[styles.nav, { paddingTop: insets.top + 8 }]}>
				<IconButton icon="arrow-left" size={22} onPress={() => router.back()} />
				<Text
					variant="titleMedium"
					style={{ color: colors.onBackground, fontWeight: "700", flex: 1 }}
				>
					Profile
				</Text>
			</View>

			{isLoading ? (
				<SkeletonProfile />
			) : (
				<View style={styles.body}>
					{isError && <ErrorBanner message={errorMessage} onRetry={retry} />}

					<View style={styles.avatarRow}>
						<Avatar.Text
							size={80}
							label={initials}
							color={colors.onPrimary}
							style={{ backgroundColor: colors.primary }}
						/>
						<View style={styles.userInfo}>
							<Text
								variant="headlineSmall"
								style={{ color: colors.onBackground, fontWeight: "700" }}
							>
								{user?.username ?? "—"}
							</Text>
							<Text
								variant="bodyMedium"
								style={{ color: colors.onSurfaceVariant }}
							>
								{user?.email ?? "—"}
							</Text>
						</View>
					</View>

					<Divider
						style={[styles.divider, { backgroundColor: colors.outline }]}
					/>

					<Text
						variant="titleSmall"
						style={{
							color: colors.onSurface,
							fontWeight: "700",
							marginBottom: 12,
						}}
					>
						Your stats
					</Text>

					<View style={styles.statRow}>
						<StatTile
							label="Rides"
							value={String(totalRides)}
							color={colors.primary}
						/>
						<StatTile
							label="Kilometres"
							value={(stats?.totalKm ?? 0).toFixed(0)}
							color={colors.onSurface}
						/>
						<StatTile
							label="Hours"
							value={((stats?.totalMin ?? 0) / 60).toFixed(1)}
							color={colors.onSurface}
						/>
					</View>

					<Divider
						style={[styles.divider, { backgroundColor: colors.outline }]}
					/>

					<PermissionCheck />

					<Divider
						style={[styles.divider, { backgroundColor: colors.outline }]}
					/>

					<Button
						mode="outlined"
						icon="logout"
						textColor={colors.error}
						style={{ borderColor: colors.error }}
						contentStyle={styles.logoutBtn}
						onPress={() =>
							Alert.alert("Logout", "Are you sure you want to logout?", [
								{ text: "Cancel", style: "cancel" },
								{
									text: "Logout",
									style: "destructive",
									onPress: () => logout(),
								},
							])
						}
					>
						Log out
					</Button>
				</View>
			)}
		</View>
	);
}

function StatTile({
	label,
	value,
	color,
}: {
	label: string;
	value: string;
	color: string;
}) {
	const { colors } = useTheme();
	return (
		<Surface
			style={[styles.tile, { backgroundColor: colors.surface }]}
			elevation={0}
		>
			<Text variant="headlineSmall" style={{ color, fontWeight: "800" }}>
				{value}
			</Text>
			<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
				{label}
			</Text>
		</Surface>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1 },
	nav: {
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 8,
		paddingBottom: 4,
	},
	body: { flex: 1, paddingHorizontal: 24 },
	avatarRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 20,
		marginBottom: 24,
	},
	userInfo: { flex: 1, gap: 2 },
	divider: { marginVertical: 24 },
	statRow: {
		flexDirection: "row",
		gap: 10,
		marginBottom: 8,
	},
	tile: {
		flex: 1,
		borderRadius: 14,
		padding: 16,
		alignItems: "center",
		gap: 4,
	},
	logoutBtn: { paddingVertical: 8 },
});
