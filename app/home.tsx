import { StatusBar } from "expo-status-bar";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { ActivityIndicator, StyleSheet, useColorScheme, View } from "react-native";
import {
	Avatar,
	Button,
	Icon,
	IconButton,
	Surface,
	Text,
	useTheme,
} from "react-native-paper";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import EmptyRides from "../components/EmptyRides";
import RideCard from "../components/RideCard";
import { useAuth } from "../contexts/auth";
import { api } from "../services/api";
import type { Ride, RideStats } from "../types";

export default function HomeScreen() {
	const { user, logout } = useAuth();
	const { colors } = useTheme();
	const scheme = useColorScheme();
	const insets = useSafeAreaInsets();
	const [rides, setRides] = useState<Ride[]>([]);
	const [totalRides, setTotalRides] = useState(0);
	const [stats, setStats] = useState<RideStats>({
		totalRides: 0,
		totalKm: 0,
		totalMin: 0,
	});
	const [loading, setLoading] = useState(true);

	useFocusEffect(
		useCallback(() => {
			(async () => {
				try {
					const res = await api.getRides({ pageSize: 5 });
					setRides(res.data);
					setTotalRides(res.meta.total);
				} catch {}
				try {
					const s = await api.getRideStats();
					setStats(s);
				} catch {}
				setLoading(false);
			})();
		}, []),
	);

	const totalHrs = (stats.totalMin / 60).toFixed(1);
	const initials = user?.username?.slice(0, 2).toUpperCase() ?? "??";

	return (
		<View style={[styles.container, { backgroundColor: colors.background }]}>
			<StatusBar
				style={scheme === "dark" ? "light" : "dark"}
				backgroundColor={colors.background}
			/>

			<View style={styles.header}>
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
						<Text
							variant="bodyMedium"
							style={{ color: colors.onSurfaceVariant }}
						>
							{user?.email}
						</Text>
					</View>
					<IconButton
						icon="logout"
						size={22}
						iconColor={colors.error}
						onPress={logout}
						style={styles.logoutBtn}
					/>
				</View>

				<View style={styles.statsRow}>
					<StatCard icon="routes" value={totalRides} label="Rides" />
					<StatCard
						icon="map-marker-distance"
						value={stats.totalKm.toFixed(1)}
						label="km"
					/>
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

			<View style={styles.sectionHeader}>
				<Text
					variant="titleMedium"
					style={{ color: colors.onBackground, fontWeight: "600" }}
				>
					Recent Rides
				</Text>
				{totalRides > 5 && (
					<Button
						mode="text"
						icon="chevron-right"
						contentStyle={{ flexDirection: "row-reverse" }}
						onPress={() => router.push("/dashboard")}
						textColor={colors.primary}
					>
						See all
					</Button>
				)}
			</View>

			{loading ? (
				<View style={styles.loadingWrap}>
					<ActivityIndicator size="large" color={colors.primary} />
				</View>
			) : rides.length === 0 ? (
				<View style={[styles.ridesScroll, { paddingBottom: insets.bottom }]}>
					<EmptyRides />
				</View>
			) : (
				<View style={[styles.ridesScroll, { paddingBottom: insets.bottom }]}>
					{rides.map((ride) => (
						<RideCard key={ride.id} ride={ride} />
					))}
				</View>
			)}
		</View>
	);
}

function StatCard({
	icon,
	value,
	label,
}: {
	icon: string;
	value: string | number;
	label: string;
}) {
	const { colors } = useTheme();
	return (
		<Surface
			style={[styles.statCard, { backgroundColor: colors.surface }]}
			elevation={1}
		>
			<Icon source={icon} size={22} color={colors.primary} />
			<Text
				variant="titleLarge"
				style={[styles.statValue, { color: colors.onSurface }]}
			>
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
	header: { paddingHorizontal: 24, paddingTop: 64 },
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
	sectionHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 24,
		marginBottom: 12,
	},
	ridesScroll: { flex: 1, paddingHorizontal: 24 },
	loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
	logoutBtn: { margin: 0 },
});
