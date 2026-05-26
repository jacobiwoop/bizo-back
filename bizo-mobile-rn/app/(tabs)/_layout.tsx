import { Tabs } from "expo-router";
import { Heart, House, MessageCircle, Plus, User } from "lucide-react-native";
import { Pressable, View } from "react-native";

function TabIcon({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  return (
    <View
      className={`h-12 w-12 items-center justify-center rounded-full ${focused ? "bg-[#FFF1E7]" : "bg-transparent"}`}
    >
      {children}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 94,
          borderTopWidth: 0,
          borderTopLeftRadius: 34,
          borderTopRightRadius: 34,
          paddingHorizontal: 24,
          paddingTop: 16,
          position: "absolute",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <House color={focused ? "#F2994A" : "#111111"} size={24} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <MessageCircle color={focused ? "#F2994A" : "#111111"} size={24} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="publish-entry"
        options={{
          tabBarButton: () => (
            <Pressable className="-mt-10 h-20 w-20 items-center justify-center self-center rounded-full bg-[#F2994A] shadow-soft">
              <Plus color="#FFFFFF" size={34} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <Heart color={focused ? "#F2994A" : "#111111"} size={24} />
            </TabIcon>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused}>
              <User color={focused ? "#F2994A" : "#111111"} size={24} />
            </TabIcon>
          ),
        }}
      />
    </Tabs>
  );
}
