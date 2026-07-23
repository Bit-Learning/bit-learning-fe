import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { colors } from "@/components/ui";
export default function TabsLayout() {
	return (
		<Tabs
			screenOptions={({ route }) => ({
				headerShadowVisible: false,
				tabBarActiveTintColor: colors.blue,
				tabBarIcon: ({ color, size }) => (
					<Ionicons
						name={
							({
								index: "home",
								courses: "search",
								learning: "play-circle",
								profile: "person",
							}[route.name] ?? "home") as never
						}
						size={size}
						color={color}
					/>
				),
			})}
		>
			<Tabs.Screen name="index" options={{ title: "Home" }} />
			<Tabs.Screen name="courses" options={{ title: "Courses" }} />
			<Tabs.Screen name="learning" options={{ title: "My learning" }} />
			<Tabs.Screen name="profile" options={{ title: "Profile" }} />
		</Tabs>
	);
}
