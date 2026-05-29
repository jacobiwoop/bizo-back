import { Tabs } from "expo-router";
import { House, MessageCircle, Plus, Search, User } from "lucide-react-native";
import { useEffect, useRef } from "react";
import { Animated, Pressable, Text, View } from "react-native";

function TabIcon({
  focused,
  icon,
  label,
}: {
  focused: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <View className="w-[62px] items-center gap-[2px]">
      {icon}
      <Text
        className={`text-center text-[10px] font-bold ${focused ? "text-[#F5C518]" : "text-[#5F5E5E]"}`}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
}

function BizoTabBar({ state, navigation }: any) {
  const activeRoute = state.routes[state.index]?.name;
  const hidden = activeRoute === "publish-entry";
  const translateY = useRef(new Animated.Value(hidden ? 110 : 0)).current;

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: hidden ? 110 : 0,
      duration: hidden ? 240 : 220,
      useNativeDriver: true,
    }).start();
  }, [hidden, translateY]);

  const items = [
    {
      label: "Accueil",
      name: "home",
      render: (focused: boolean) => (
        <House color={focused ? "#F5C518" : "#5F5E5E"} fill={focused ? "#F5C518" : "transparent"} size={23} />
      ),
    },
    {
      label: "Explorer",
      name: "explorer",
      render: (focused: boolean) => <Search color={focused ? "#F5C518" : "#5F5E5E"} size={23} />,
    },
    {
      label: "",
      name: "publish-entry",
      center: true,
      render: (_focused: boolean) => <Plus color="#F5C518" size={32} strokeWidth={2.4} />,
    },
    {
      label: "Messages",
      name: "messages",
      render: (focused: boolean) => <MessageCircle color={focused ? "#F5C518" : "#5F5E5E"} size={23} />,
    },
    {
      label: "Profil",
      name: "profile",
      render: (focused: boolean) => <User color={focused ? "#F5C518" : "#5F5E5E"} size={23} />,
    },
  ];

  return (
    <Animated.View
      pointerEvents={hidden ? "none" : "auto"}
      style={{
        backgroundColor: "#FFFFFF",
        bottom: 0,
        elevation: 8,
        height: 64,
        left: 0,
        paddingHorizontal: 10,
        paddingTop: 8,
        position: "absolute",
        right: 0,
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.05,
        shadowRadius: 20,
        transform: [{ translateY }],
      }}
    >
      <View className="flex-row items-start justify-around">
        {items.map((item) => {
          const focused = activeRoute === item.name;
          return (
            <Pressable
              key={item.name}
              className={item.center ? "-mt-8 h-14 w-14 items-center justify-center rounded-full bg-[#2A313D] shadow-soft" : "items-center"}
              onPress={() => navigation.navigate(item.name)}
            >
              {item.center ? item.render(focused) : <TabIcon focused={focused} icon={item.render(focused)} label={item.label} />}
            </Pressable>
          );
        })}
      </View>
    </Animated.View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <BizoTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 64,
          backgroundColor: "#FFFFFF",
          borderTopWidth: 0,
          elevation: 8,
          paddingHorizontal: 10,
          paddingTop: 8,
          position: "absolute",
          shadowColor: "#000000",
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.05,
          shadowRadius: 20,
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={<House color={focused ? "#F5C518" : "#5F5E5E"} fill={focused ? "#F5C518" : "transparent"} size={23} />} label="Accueil" />
          ),
        }}
      />
      <Tabs.Screen
        name="explorer"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={<Search color={focused ? "#F5C518" : "#5F5E5E"} size={23} />} label="Explorer" />
          ),
        }}
      />
      <Tabs.Screen
        name="publish-entry"
        options={{
          tabBarButton: (props) => (
            <Pressable
              accessibilityState={props.accessibilityState}
              onPress={props.onPress}
              className="-mt-8 h-14 w-14 items-center justify-center self-center rounded-full bg-[#2A313D] shadow-soft"
            >
              <Plus color="#F5C518" size={32} strokeWidth={2.4} />
            </Pressable>
          ),
        }}
      />
      <Tabs.Screen
        name="messages"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={<MessageCircle color={focused ? "#F5C518" : "#5F5E5E"} size={23} />} label="Messages" />
          ),
        }}
      />
      <Tabs.Screen
        name="favorites"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon={<User color={focused ? "#F5C518" : "#5F5E5E"} size={23} />} label="Profil" />
          ),
        }}
      />
    </Tabs>
  );
}
