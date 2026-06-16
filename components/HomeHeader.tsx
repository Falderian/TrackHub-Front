import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, View } from "react-native";
import {
	Avatar,
	Button,
	IconButton,
	Menu,
	Text,
	useTheme,
} from "react-native-paper";
import { useAuth } from "../contexts/auth";
import StatCard from "./StatCard";

export default function HomeHeader({
	totalRides,
	totalKm,
	totalHrs,
}: {
	totalRides: number;
	totalKm: string;
	totalHrs: string;
}) {
	const { user, logout } = useAuth();
	const { colors } = useTheme();
	const [menuVisible, setMenuVisible] = useState(false);
	const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

	return (
		<View style={styles.root}>
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

				<Menu
					visible={menuVisible}
					onDismiss={() => setMenuVisible(false)}
					anchor={
						<IconButton
							icon="dots-vertical"
							size={22}
							iconColor={colors.onSurfaceVariant}
							onPress={() => setMenuVisible(true)}
							style={styles.iconBtn}
						/>
					}
				>
					<Menu.Item
						leadingIcon="chart-bar"
						onPress={() => {
							setMenuVisible(false);
							router.push("/stats");
						}}
						title="Stats"
					/>
					<Menu.Item
						leadingIcon="logout"
						onPress={() => {
							setMenuVisible(false);
							logout();
						}}
						title="Logout"
					/>
				</Menu>
			</View>

			<View style={styles.statsRow}>
				<StatCard icon="routes" value={totalRides} label="Rides" />
				<StatCard icon="map-marker-distance" value={totalKm} label="km" />
				<StatCard icon="clock-outline" value={totalHrs} label="Hours" />
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
		</View>
	);
}

const styles = StyleSheet.create({
	root: { paddingHorizontal: 24, paddingTop: 64 },
	welcomeRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		marginBottom: 28,
	},
	welcomeText: { flex: 1 },
	iconBtn: { margin: 0 },
	statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
	cta: { borderRadius: 14, marginBottom: 32 },
	ctaInner: { paddingVertical: 8 },
});
