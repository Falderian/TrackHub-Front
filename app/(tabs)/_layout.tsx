import { Tabs } from "expo-router";
import { Icon, useTheme } from "react-native-paper";

export default function TabLayout() {
	const theme = useTheme();

	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarShowLabel: false,
				tabBarActiveTintColor: theme.colors.primary,
				tabBarLabelStyle: { display: "none" },
			}}
		>
			<Tabs.Screen
				name="index"
				options={{
					title: "Home",
					tabBarIcon: ({ color, size }) => (
						<Icon source="home-circle" color={color} size={size} />
					),
				}}
			/>
			<Tabs.Screen
				name="record"
				options={{
					title: "Ride",
					tabBarIcon: ({ color, size }) => (
						<Icon source="plus-circle" color={color} size={size} />
					),
				}}
			/>
		</Tabs>
	);
}
