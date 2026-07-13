import { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { useTheme } from "react-native-paper";

function Pulse({ style }: { style?: object }) {
	const { colors } = useTheme();
	const anim = useRef(new Animated.Value(0.3)).current;

	useEffect(() => {
		const loop = Animated.loop(
			Animated.sequence([
				Animated.timing(anim, {
					toValue: 0.7,
					duration: 800,
					useNativeDriver: true,
				}),
				Animated.timing(anim, {
					toValue: 0.3,
					duration: 800,
					useNativeDriver: true,
				}),
			]),
		);
		loop.start();
		return () => loop.stop();
	}, [anim]);

	return (
		<Animated.View
			style={[
				style,
				{
					opacity: anim,
					backgroundColor: colors.surfaceVariant,
					borderRadius: 8,
				},
			]}
		/>
	);
}

export function RideCardSkeleton() {
	const { colors } = useTheme();

	return (
		<View
			style={[
				skel.card,
				{
					backgroundColor: colors.surface,
					borderColor: colors.outlineVariant,
				},
			]}
		>
			<View style={skel.cardRow}>
				<Pulse style={skel.icon} />
				<View style={skel.cardBody}>
					<Pulse style={skel.lineLg} />
					<Pulse style={[skel.lineSm, { width: "55%" }]} />
				</View>
				<Pulse style={skel.chevron} />
			</View>
		</View>
	);
}

export function SkeletonHome() {
	return (
		<View style={skel.container}>
			{/* Header avatar + text */}
			<View style={[skel.headerRow, { paddingHorizontal: 24, paddingTop: 64 }]}>
				<Pulse style={skel.avatar} />
				<View style={skel.headerText}>
					<Pulse style={[skel.lineMd, { width: "60%" }]} />
					<Pulse style={[skel.lineSm, { width: "40%" }]} />
				</View>
				<Pulse style={skel.menuDot} />
			</View>

			{/* Stat cards row */}
			<View style={[skel.statsRow, { paddingHorizontal: 24 }]}>
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
			</View>

			{/* CTA button */}
			<View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
				<Pulse style={{ height: 50, borderRadius: 14 }} />
			</View>

			{/* Ride cards */}
			{[1, 2, 3].map((i) => (
				<View key={i} style={{ paddingHorizontal: 24, marginBottom: 12 }}>
					<RideCardSkeleton />
				</View>
			))}
		</View>
	);
}

export function SkeletonDashboard() {
	return (
		<View style={skel.container}>
			{/* Search bar */}
			<View style={{ paddingHorizontal: 24, marginBottom: 16 }}>
				<Pulse style={{ height: 44, borderRadius: 22 }} />
			</View>

			{/* Stats row */}
			<View
				style={[skel.statsRow, { paddingHorizontal: 24, marginBottom: 24 }]}
			>
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
			</View>

			{/* Ride rows */}
			{[1, 2, 3, 4, 5].map((i) => (
				<View key={i} style={{ paddingHorizontal: 24, marginBottom: 12 }}>
					<RideCardSkeleton />
				</View>
			))}
		</View>
	);
}

export function SkeletonStats() {
	return (
		<View style={skel.container}>
			{/* Segmented control */}
			<View style={{ paddingHorizontal: 24, marginBottom: 16, marginTop: 60 }}>
				<Pulse style={{ height: 40, borderRadius: 20 }} />
			</View>

			{/* Summary cards */}
			<View
				style={[skel.statsRow, { paddingHorizontal: 24, marginBottom: 24 }]}
			>
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
			</View>

			{/* Chart area */}
			<View style={{ paddingHorizontal: 24 }}>
				<Pulse style={{ height: 260, borderRadius: 16 }} />
			</View>
		</View>
	);
}

export function SkeletonRideDetail() {
	return (
		<View style={skel.container}>
			{/* Map */}
			<View style={{ marginBottom: 20 }}>
				<Pulse style={{ height: 220, borderRadius: 0 }} />
			</View>

			{/* Title */}
			<View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
				<Pulse style={[skel.lineLg, { width: "70%", marginBottom: 8 }]} />
				<Pulse style={[skel.lineSm, { width: "40%" }]} />
			</View>

			{/* Stat tiles */}
			<View
				style={[skel.statsRow, { paddingHorizontal: 24, marginBottom: 24 }]}
			>
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
			</View>

			{/* Detail grid */}
			<View
				style={{
					paddingHorizontal: 24,
					flexDirection: "row",
					gap: 12,
					marginBottom: 24,
				}}
			>
				<Pulse style={{ flex: 1, height: 80 }} />
				<Pulse style={{ flex: 1, height: 80 }} />
			</View>

			{/* Chart */}
			<View style={{ paddingHorizontal: 24, marginBottom: 24 }}>
				<Pulse style={{ height: 180, borderRadius: 16 }} />
			</View>

			{/* Action buttons */}
			<View style={{ paddingHorizontal: 24, gap: 12 }}>
				<Pulse style={{ height: 48, borderRadius: 12 }} />
				<Pulse style={{ height: 48, borderRadius: 12 }} />
			</View>
		</View>
	);
}

export function SkeletonProfile() {
	return (
		<View style={skel.container}>
			{/* Nav bar */}
			<View
				style={[
					skel.profileNav,
					{ paddingHorizontal: 16, paddingTop: 60, paddingBottom: 8 },
				]}
			>
				<Pulse style={skel.backArrow} />
				<Pulse style={[skel.lineMd, { width: "30%" }]} />
			</View>

			<View style={[skel.profileAvatarRow, { paddingHorizontal: 24 }]}>
				<Pulse style={skel.profileAvatar} />
				<View style={skel.headerText}>
					<Pulse style={[skel.lineMd, { width: "50%" }]} />
					<Pulse style={[skel.lineSm, { width: "65%" }]} />
				</View>
			</View>

			<View style={{ paddingHorizontal: 24, marginVertical: 24 }}>
				<Pulse style={{ height: 1, width: "100%" }} />
			</View>

			<View style={{ paddingHorizontal: 24, marginBottom: 12 }}>
				<Pulse style={[skel.lineSm, { width: "25%" }]} />
			</View>

			<View style={[skel.statsRow, { paddingHorizontal: 24 }]}>
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
				<Pulse style={skel.statCard} />
			</View>

			<View style={{ paddingHorizontal: 24, marginVertical: 24 }}>
				<Pulse style={{ height: 1, width: "100%" }} />
			</View>

			<View style={{ paddingHorizontal: 24 }}>
				<Pulse style={{ height: 44, borderRadius: 22 }} />
			</View>
		</View>
	);
}

const skel = StyleSheet.create({
	container: { flex: 1, paddingTop: 8 },
	card: {
		borderRadius: 14,
		borderWidth: StyleSheet.hairlineWidth,
		padding: 16,
	},
	cardRow: { flexDirection: "row", alignItems: "center", gap: 14 },
	cardBody: { flex: 1, gap: 8 },
	icon: { width: 40, height: 40, borderRadius: 20 },
	chevron: { width: 20, height: 20, borderRadius: 4 },
	headerRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 16,
		marginBottom: 28,
	},
	headerText: { flex: 1, gap: 8 },
	avatar: { width: 56, height: 56, borderRadius: 28 },
	menuDot: { width: 24, height: 24, borderRadius: 4 },
	statsRow: {
		flexDirection: "row",
		gap: 12,
		marginBottom: 24,
	},
	statCard: { flex: 1, height: 80, borderRadius: 14 },
	profileNav: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		marginBottom: 24,
	},
	backArrow: { width: 22, height: 22, borderRadius: 4 },
	profileAvatarRow: {
		flexDirection: "row",
		alignItems: "center",
		gap: 20,
		marginBottom: 8,
	},
	profileAvatar: { width: 80, height: 80, borderRadius: 40 },
	lineSm: { height: 12, width: "100%" },
	lineMd: { height: 16, width: "100%" },
	lineLg: { height: 20, width: "100%" },
});
