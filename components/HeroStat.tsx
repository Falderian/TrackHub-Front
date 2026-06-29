import { StyleSheet, View } from "react-native";
import { Icon, Text, useTheme } from "react-native-paper";

interface Props {
	value: string;
	unit: string;
	icon: string;
}

export default function HeroStat({ value, unit, icon }: Props) {
	const { colors } = useTheme();
	return (
		<View style={styles.stat}>
			<Icon source={icon} size={20} color={colors.primary} />
			<Text
				variant="headlineSmall"
				style={{ color: colors.onBackground, fontWeight: "800" }}
			>
				{value}
			</Text>
			{unit ? (
				<Text variant="labelSmall" style={{ color: colors.onSurfaceVariant }}>
					{unit}
				</Text>
			) : null}
		</View>
	);
}

const styles = StyleSheet.create({
	stat: { alignItems: "center", gap: 4 },
});
