import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, View } from "react-native";
import { Button, IconButton, Menu, Text, useTheme } from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../contexts/auth";
import { greeting } from "../helpers/date";
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
	const insets = useSafeAreaInsets();
	const [menuVisible, setMenuVisible] = useState(false);

	return (
		<View style={[styles.root, { paddingTop: insets.top + 16 }]}>
			<View style={styles.welcomeRow}>
				<View style={styles.welcomeText}>
					<Text
						variant="titleLarge"
						style={{ color: colors.onBackground, fontWeight: "700" }}
					>
						{greeting()}
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
						leadingIcon="account"
						onPress={() => {
							setMenuVisible(false);
							router.push("/profile");
						}}
						title="Profile"
					/>
					<Menu.Item
						leadingIcon="chart-bar"
						onPress={() => {
							setMenuVisible(false);
							router.push("/stats");
						}}
						title="Stats"
					/>
					<Menu.Item
						leadingIcon="wrench"
						onPress={() => {
							setMenuVisible(false);
							router.push("/maintenance");
						}}
						title="Maintenance"
					/>
					<Menu.Item
						leadingIcon="logout"
						onPress={() => {
							setMenuVisible(false);
							Alert.alert("Logout", "Are you sure you want to logout?", [
								{ text: "Cancel", style: "cancel" },
								{
									text: "Logout",
									style: "destructive",
									onPress: () => logout(),
								},
							]);
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
				textColor={colors.onPrimary}
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
	root: { paddingHorizontal: 24 },
	welcomeRow: {
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 16,
		marginBottom: 24,
	},
	welcomeText: { flex: 1 },
	iconBtn: { margin: 0 },
	statsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
	cta: { borderRadius: 14, marginBottom: 16 },
	ctaInner: { paddingVertical: 8 },
});
